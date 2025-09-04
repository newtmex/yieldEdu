import { Context } from "ponder:registry";
import {
    POINTS_PER_SECOND,
    Q128,
    seasonStart,
    seasonYuzuStartAmount,
} from "./constants";
import { pointSupply, userPoints } from "ponder:schema";

/** ------------------------------------------------------------------------
 * Utility logging (replace with a real logger in production)
 * ---------------------------------------------------------------------- */
function logEvent(event: string, data: Record<string, unknown>) {
    // Swap this for a structured logger (e.g., pino, winston) in production
    console.log(`[${event}]`, data);
}

/** ------------------------------------------------------------------------
 * Global point supply helpers
 * ---------------------------------------------------------------------- */

/**
 * Ensures the `point_supply` singleton row exists and returns it.
 * Initializes the table on first request with default values.
 */
export async function getOrInitPointSupply(
    db: Context["db"]
): Promise<typeof pointSupply.$inferSelect> {
    let row = await db.find(pointSupply, { id: "supply" });

    if (!row) {
        row = {
            id: "supply",
            totalDeposits: 0n,
            maxPoints: seasonYuzuStartAmount,
            pointsPerShare: 0n,
            pointReserve: 0n,
            updatedAt: seasonStart,
        };
        await db.insert(pointSupply).values(row);
    }

    return row;
}

/**
 * Computes newly accumulated points and the corresponding increase
 * in points-per-share (PPS), ensuring total points remain within
 * the configured maximum cap.
 */
export async function computeAccumulatedPoints(
    currentTimestamp: bigint,
    {
        totalDeposits,
        updatedAt = currentTimestamp,
        maxPoints,
        pointReserve,
    }: typeof pointSupply.$inferSelect
): Promise<{ points: bigint; ppsIncrease: bigint }> {
    const maxPointsToDistribute = (maxPoints * 90n) / 100n; // 90% hard cap

    if (totalDeposits === 0n || currentTimestamp <= updatedAt!) {
        return { points: 0n, ppsIncrease: 0n };
    }

    const timeElapsed = currentTimestamp - updatedAt!;
    let points = totalDeposits * POINTS_PER_SECOND * timeElapsed;

    // Enforce cap relative to current reserve
    if (pointReserve + points > maxPointsToDistribute) {
        points = maxPointsToDistribute - pointReserve;
        if (points < 0n) points = 0n; // guard against negative case
    }

    const ppsIncrease = (points * Q128) / totalDeposits; // mulDiv equivalent
    return { points, ppsIncrease };
}

/**
 * Updates the global point accounting by incorporating newly
 * accumulated points into the reserve and points-per-share (PPS).
 */
export async function updatePoints(
    db: Context["db"],
    currentTimestamp: bigint
): Promise<{ points: bigint; ppsIncrease: bigint; updatedPPS: bigint }> {
    const row = await getOrInitPointSupply(db);

    const { points, ppsIncrease } = await computeAccumulatedPoints(
        currentTimestamp,
        row
    );

    if (points === 0n) {
        return { points: 0n, ppsIncrease: 0n, updatedPPS: row.pointsPerShare };
    }

    const updatedReserve = row.pointReserve + points;
    const updatedPPS = row.pointsPerShare + ppsIncrease;

    if (updatedReserve > row.maxPoints) {
        throw new Error("pointReserve would exceed maxPoints");
    }
    if (updatedReserve < row.pointReserve) {
        throw new Error("pointReserve cannot decrease");
    }

    await db.update(pointSupply, { id: "supply" }).set({
        pointReserve: updatedReserve,
        pointsPerShare: updatedPPS,
        updatedAt: currentTimestamp,
    });

    logEvent("PointsUpdated", {
        points: points.toString(),
        ppsIncrease: ppsIncrease.toString(),
        newPointsPerShare: updatedPPS.toString(),
    });

    return { points, ppsIncrease, updatedPPS };
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
async function setUserRps(
    db: Context["db"],
    from: string,
    to: string,
    shares: bigint,
    rps: bigint
): Promise<void> {
    const global = await getOrInitPointSupply(db);

    await db
        .insert(userPoints)
        .values({ id: to, pointPerShare: rps, shares })
        .onConflictDoUpdate({ pointPerShare: rps, shares });

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
    await updatePoints(db, currentTimestamp);

    if (to !== "0x0000000000000000000000000000000000000000" && value > 0n) {
        const global = await getOrInitPointSupply(db);

        const fromUser = await db.find(userPoints, { id: from });
        const prevailingRps =
            from === "0x0000000000000000000000000000000000000000"
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

    if (from === "0x0000000000000000000000000000000000000000") {
        await db.update(pointSupply, { id: "supply" }).set((row) => ({
            totalDeposits: row.totalDeposits + value,
        }));
    } else {
        const fromUser = await db.find(userPoints, { id: from });
        if (!fromUser || fromUser.shares < value) {
            throw new Error(`Insufficient balance for ${from}`);
        }
        await db.update(userPoints, { id: from }).set((row) => ({
            shares: row.shares - value,
        }));
    }

    if (to === "0x0000000000000000000000000000000000000000") {
        await db.update(pointSupply, { id: "supply" }).set((row) => ({
            totalDeposits: row.totalDeposits - value,
        }));
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

    if (!userRow?.shares) {
        return { shares: 0n, claimable: 0n };
    }

    if (shares > userRow.shares) {
        throw new Error(
            `Invalid share amount: requested ${shares}, user has only ${userRow.shares}`
        );
    }

    const globalRps = global.pointsPerShare + ppsIncrease;
    const userRps = userRow.pointPerShare;

    const claimable = (shares * (globalRps - userRps)) / Q128;
    return { shares, claimable };
}
