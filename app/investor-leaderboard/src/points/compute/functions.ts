import { Context } from "ponder:registry";
import {
    POINTS_PER_SECOND,
    Q128,
    seasonDeadline,
    seasonYuzuStartAmount,
} from "./constants";
import { pointSupply, userPoints } from "ponder:schema";
import { Hex, isAddressEqual, zeroAddress } from "viem";

/** ------------------------------------------------------------------------
 * Utility logging (replace with a real logger in production)
 * ---------------------------------------------------------------------- */
export function logEvent(event: string, data: Record<string, unknown>) {
    // if (
    //     !Object.values(data).some(
    //         (a) =>
    //             isAddress(a) &&
    //             isAddressEqual(a, "0xdf37f81daad2b0327a0a50003740e1c935c70913")
    //     )
    // )
    //     return;
    // Swap this for a structured logger (e.g., pino, winston) in production
    // if (event != 'Balance check') return;
    console.log(`[${event}]`, data);
}

/** ------------------------------------------------------------------------
 * Global point supply helpers
 * ---------------------------------------------------------------------- */

/**
 * Ensures the `point_supply` singleton row exists and returns it.
 * Initializes the table on first request with default values.
 */
export async function getOrInitPointSupply(db: Context["db"]) {
    let row = await db.find(pointSupply, { id: "supply" });

    if (!row) {
        row = await db.insert(pointSupply).values({
            id: "supply",
            totalDeposits: 0n,
            maxPoints: seasonYuzuStartAmount,
            pointsPerShare: 0n,
            pointsReserve: 0n,
            pointsPerSec: 0n,
            pointsAccrued: 0n,
        });
    }

    return row;
}

/**
 * Computes newly accumulated points and the corresponding increase
 * in points-per-share (PPS), ensuring total points remain within
 * the configured maximum cap.
 */
function computeReserveUpdate({
    timestamp,
    value,
}: {
    timestamp: bigint;
    value: bigint;
}) {
    // Scaled emission rate: value * POINTS_PER_SECOND / 1e18
    const pointsRateDelta = (value * POINTS_PER_SECOND) / 10n ** 18n;

    const timeRemaining = seasonDeadline - timestamp;
    const reserveDelta = pointsRateDelta * timeRemaining;

    return { reserveDelta, pointsRateDelta };
}

/**
 * Computes the capped points accrued and updated points-per-share (PPS).
 *
 * - Caps accrual at 90% of maxPoints
 * - Calculates PPS increase from undistributed points
 * - Returns both capped pointsAccrued and updated PPS
 */
function computePointsUpdate(
    global: typeof pointSupply.$inferSelect,
    pointsAccrued: bigint
) {
    if (global.totalDeposits <= 0n) {
        return {
            pointsAccrued: global.pointsAccrued,
            updatedPPS: global.pointsPerShare,
        };
    }

    // Cap accrual at 90% of maxPoints
    const maxAccruable = (global.maxPoints * 9n) / 10n;
    const cappedAccrued =
        pointsAccrued > maxAccruable ? maxAccruable : pointsAccrued;

    // Only consider positive undistributed points
    const undistributed =
        cappedAccrued > global.pointsAccrued
            ? cappedAccrued - global.pointsAccrued
            : 0n;

    const ppsIncrease = (undistributed * Q128) / global.totalDeposits;
    const updatedPPS = global.pointsPerShare + ppsIncrease;

    return { pointsAccrued: cappedAccrued, updatedPPS };
}

/**
 * Updates the global point accounting system.
 *
 * - Recalculates the reserve and points-per-second rate (PPS rate).
 * - Adjusts totals depending on whether points are minted or burned.
 * - Computes new points-per-share (PPS) value based on unclaimed accrual.
 *
 * @param db        Database context
 * @param timestamp Current timestamp (bigint)
 * @param value     Amount to apply (bigint)
 * @param direction Whether the update is from "mint" or "burn"
 */
export async function mineGlobalPoints(
    db: Context["db"],
    timestamp: bigint,
    value: bigint,
    direction: "mint" | "burn"
) {
    const global = await getOrInitPointSupply(db);

    // Compute rate/reserve delta
    let { reserveDelta, pointsRateDelta } = computeReserveUpdate({
        timestamp,
        value,
    });
    if (direction === "burn") {
        reserveDelta = -reserveDelta;
        pointsRateDelta = -pointsRateDelta;
    }

    const updatedReserve = global.pointsReserve + reserveDelta;
    const updatedRate = (global.pointsPerSec ?? 0n) + pointsRateDelta;
    const timeRemaining = seasonDeadline - timestamp;

    // Estimate accrued points from reserve dynamics
    const projectedAccrued = updatedReserve - updatedRate * timeRemaining;

    const { pointsAccrued, updatedPPS } = computePointsUpdate(
        global,
        projectedAccrued
    );

    await db.update(pointSupply, { id: "supply" }).set({
        pointsReserve: updatedReserve,
        pointsPerSec: updatedRate,
        pointsPerShare: updatedPPS,
        pointsAccrued,
    });

    logEvent("PointsUpdated", {
        pointsAccrued: pointsAccrued.toString(),
        updatedPPS: updatedPPS.toString(),
    });
}

/** ------------------------------------------------------------------------
 * User RPS helpers
 * ---------------------------------------------------------------------- */

/**
 * Computes the weighted average of two values with rounding up.
 * Equivalent to Solidity's `Math.ceilDiv`.
 */
function weightedAverageRoundUp(
    a: bigint,
    wa: bigint,
    b: bigint,
    wb: bigint
): bigint {
    const numerator = a * wa + b * wb;
    const denominator = wa + wb;

    if (denominator === 0n) {
        throw new Error("Denominator cannot be zero in weightedAverageRoundUp");
    }

    return (numerator + denominator - 1n) / denominator; // ceilDiv
}

/**
 * Sets the reward-per-share (RPS) snapshot for a user.
 */
export async function setUserRps(
    db: Context["db"],
    from: string,
    to: string,
    shares: bigint,
    rps: bigint
): Promise<void> {
    const global = await getOrInitPointSupply(db);

    await db
        .insert(userPoints)
        .values({ id: to, pointPerShare: rps })
        .onConflictDoUpdate({ pointPerShare: rps });

    logEvent("UserRewardPerShareUpdate", {
        from,
        to,
        shares: shares.toString(),
        rps: rps.toString(),
        globalPointsPerShare: global.pointsPerShare.toString(),
    });
}

/** ------------------------------------------------------------------------
 * Transfer + accounting
 * ---------------------------------------------------------------------- */

export async function update({
    db,
    from,
    to,
    value,
    currentTimestamp,
}: {
    db: Context["db"];
    from: string;
    to: string;
    value: bigint;
    currentTimestamp: bigint;
}): Promise<void> {
    const isMint = isAddressEqual(from as Hex, zeroAddress);
    const isBurn = isAddressEqual(to as Hex, zeroAddress);
    const isTransfer = !isBurn && !isMint;

    await mineGlobalPoints(
        db,
        currentTimestamp,
        !isTransfer ? value : 0n,
        isBurn ? "burn" : "mint"
    );

    if (!isBurn && value > 0n) {
        const global = await getOrInitPointSupply(db);

        const fromUser = await db.find(userPoints, { id: from });
        const prevailingRps = isMint
            ? global.pointsPerShare
            : fromUser?.pointPerShare ?? 0n;

        const toUser = await db.find(userPoints, { id: to });
        const sharesOfTo = toUser?.shares ?? 0n;

        const newRps = weightedAverageRoundUp(
            toUser?.pointPerShare ?? 0n,
            sharesOfTo,
            prevailingRps,
            value
        );

        await setUserRps(db, from, to, sharesOfTo, newRps);
    }

    await applyTransfer(db, from, to, value);
}

/**
 * Applies ERC20-style balance updates and total supply adjustments.
 */
export async function applyTransfer(
    db: Context["db"],
    from: string,
    to: string,
    value: bigint
): Promise<void> {
    if (value === 0n) return;

    const global = await getOrInitPointSupply(db);

    if (from === "0x0000000000000000000000000000000000000000") {
        await db.update(pointSupply, { id: "supply" }).set({
            totalDeposits: global.totalDeposits + value,
        });
    } else {
        const fromUser = await db.find(userPoints, { id: from });
        if (!fromUser || fromUser.shares < value) {
            throw new Error(
                `Insufficient balance for ${from}, value: ${value}, shares: ${fromUser?.shares}`
            );
        }
        await db.update(userPoints, { id: from }).set((row) => ({
            shares: row.shares - value,
        }));
    }

    if (to === "0x0000000000000000000000000000000000000000") {
        await db.update(pointSupply, { id: "supply" }).set({
            totalDeposits: global.totalDeposits - value,
        });
    } else {
        const toUser = await db.find(userPoints, { id: to });
        if (toUser) {
            await db.update(userPoints, { id: to }).set((row) => ({
                shares: row.shares + value,
            }));
        } else {
            await db.insert(userPoints).values({ id: to, shares: value });
        }
    }

    logEvent("Transfer", { from, to, value: value.toString() });
}

/** ------------------------------------------------------------------------
 * Claimable points
 * ---------------------------------------------------------------------- */

interface GetClaimablePointsParams {
    db: Context["db"];
    userAddress: string;
    shares: bigint;
    ppsIncrease: bigint;
}

interface ClaimablePointsResult {
    shares: bigint;
    claimable: bigint;
}

/**
 * Computes the claimable points for a given user.
 * Mirrors Solidity `_claimableReward`.
 */
export async function getClaimablePointsForUser(
    params: GetClaimablePointsParams
): Promise<ClaimablePointsResult> {
    const { db, userAddress, shares, ppsIncrease } = params;

    const global = await getOrInitPointSupply(db);
    const userRow = await db.find(userPoints, { id: userAddress });

    if (!userRow) {
        return { shares: 0n, claimable: 0n };
    }

    // if (shares > userRow.shares) {
    //     throw new Error(
    //         `Invalid share amount: requested ${shares}, user ${userAddress} has only ${userRow.shares}`
    //     );
    // }

    const globalRps = global.pointsPerShare + ppsIncrease;
    const userRps = userRow.pointPerShare;

    const claimable = (shares * (globalRps - userRps)) / Q128;
    return { shares, claimable };
}
