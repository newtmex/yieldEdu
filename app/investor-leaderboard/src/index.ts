import { ponder } from "ponder:registry";
import {
    update,
    updatePoints,
    getClaimablePointsForUser,
    getOrInitPointSupply,
} from "./points/compute/functions";
import { isAddressEqual, zeroAddress } from "viem";
import { pointSupply, userPoints } from "ponder:schema";
import { yuzuAddition } from "./helpers/TextFileStore";
import { seasonStart } from "./points/compute/constants";

/** ------------------------------------------------------------------------
 * Event Handlers
 * ---------------------------------------------------------------------- */

/**
 * Handles YLDToken Transfer events and updates point accounting.
 */
ponder.on(
    "YLDToken:Transfer",
    async ({
        event,
        context: {
            db,
            client,
            contracts: { YLDToken },
        },
    }) => {
        const { from, to, value } = event.args;
        const timestamp = event.block.timestamp;

        // Skip any transfers before the configured season start
        if (timestamp < seasonStart) return;

        // Ensure both sender and recipient are initialized in userPoints table
        await Promise.all(
            [from, to].map(async (userAddr) => {
                if (!isAddressEqual(userAddr, zeroAddress)) {
                    const existing = await db.find(userPoints, {
                        id: userAddr,
                    });
                    if (!existing) {
                        const bal = await client.readContract({
                            abi: YLDToken.abi,
                            address: YLDToken.address,
                            functionName: "balanceOf",
                            args: [userAddr],
                            blockNumber: event.block.number - 1n, // snapshot balance before tx
                        });

                        await update({
                            db,
                            from: zeroAddress,
                            to: userAddr,
                            currentTimestamp: timestamp,
                            value: bal,
                        });
                    }
                }
            })
        );

        // Handle burn case: tokens transferred to zero address
        if (isAddressEqual(to, zeroAddress)) {
            await updatePoints(db, timestamp);

            const { claimable } = await getClaimablePointsForUser({
                db,
                ppsIncrease: 0n,
                shares: value,
                userAddress: from,
            });

            if (claimable > 0n) {
                const global = await getOrInitPointSupply(db);

                if (global.pointReserve < claimable) {
                    throw new Error(
                        `Invariant violation: reserve (${global.pointReserve}) < claimable (${claimable})`
                    );
                }

                await db.update(pointSupply, { id: "supply" }).set((row) => ({
                    pointReserve: row.pointReserve - claimable,
                    updatedAt: timestamp,
                }));
            } else {
                console.warn("Burn with no claimable points", {
                    from,
                    to,
                    value,
                });
            }
        }

        // Always apply global + per-user balance updates
        await update({ db, currentTimestamp: timestamp, from, to, value });
    }
);

/**
 * Cron job handler triggered every block.
 * - Applies any external Yuzu additions to maxPoints.
 * - Advances global point state.
 */
ponder.on("cron:block", async ({ event, context: { db } }) => {
    const addedYuzu = await yuzuAddition
        .read()
        .then((v) => (!v ? 0n : BigInt(v)));

    if (addedYuzu > 0n) {
        await yuzuAddition.set("0");

        await db.update(pointSupply, { id: "supply" }).set((row) => ({
            maxPoints: row.maxPoints + addedYuzu,
        }));

        console.log("YuzuAdded", { added: addedYuzu.toString() });
    }

    await updatePoints(db, event.block.timestamp);
});
