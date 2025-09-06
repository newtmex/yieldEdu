import { ponder } from "ponder:registry";
import {
  update,
  logEvent,
  mineGlobalPoints,
  getClaimablePointsForUser,
} from "./points/compute/functions";
import { isAddressEqual, zeroAddress } from "viem";
import { pointSupply, userPoints } from "ponder:schema";
import { yuzuAddition } from "./helpers/TextFileStore";
import { seasonDeadline, seasonStart } from "./points/compute/constants";

/**
 * Checks whether the given timestamp falls within the current season window.
 */
export function isWithinSeason(timestamp: bigint): boolean {
  return timestamp >= seasonStart && timestamp <= seasonDeadline;
}

/* --------------------------------------------------------------------------
 * Event Handlers
 * -------------------------------------------------------------------------- */

/**
 * Handles `YLDToken.Transfer` events and updates both global and user state.
 * 
 * Flow:
 * - Skip if event is outside the active season.
 * - Ensure sender’s state exists (backfill with on-chain balance if needed).
 * - Handle burns specially (deduct claimable points).
 * - Apply standard accounting via `update()`.
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
    const timestamp = event.block.timestamp;
    if (!isWithinSeason(timestamp)) return;

    const { from, to, value } = event.args;
    logEvent("Transfer event", { from, to, value, block: event.block.number });

    const isBurn = isAddressEqual(to, zeroAddress);

    // Ensure sender is tracked in DB with an accurate baseline balance
    if (!isAddressEqual(from, zeroAddress)) {
      const existing = await db.find(userPoints, { id: from });
      if (!existing) {
        const currentBal = await client.readContract({
          ...YLDToken,
          functionName: "balanceOf",
          args: [from],
          blockNumber: event.block.number,
        });

        // Initialise sender with on-chain balance + outgoing transfer
        await update({
          db,
          from: zeroAddress,
          to: from,
          value: currentBal + value,
          currentTimestamp: timestamp,
        });
      }
    }

    // Burn logic: mint global points and calculate claimable for sender
    let claimablePoints = 0n;
    if (isBurn) {
      await mineGlobalPoints(db, timestamp, 0n, "mint");

      claimablePoints = (
        await getClaimablePointsForUser({
          db,
          ppsIncrease: 0n,
          shares: value,
          userAddress: from,
        })
      ).claimable;
    }

    // Always update state (global + per-user)
    await update({ db, currentTimestamp: timestamp, from, to, value });

    // Adjust accrued points if burn consumed claimables
    if (isBurn && claimablePoints > 0n) {
      await db.update(pointSupply, { id: "supply" }).set((row) => ({
        pointsAccrued: row.pointsAccrued - claimablePoints,
        pointsReserve: row.pointsReserve - claimablePoints,

      }));
    }
  }
);

/**
 * Cron handler triggered every block.
 * - Applies pending Yuzu additions to `maxPoints`.
 * - Mints global points for the elapsed period.
 */
ponder.on("cron:block", async ({ event, context: { db } }) => {
  const timestamp = event.block.timestamp;
  if (!isWithinSeason(timestamp)) return;

  const addedYuzu = await yuzuAddition
    .read()
    .then((v) => (v ? BigInt(v) : 0n));

  if (addedYuzu > 0n) {
    await yuzuAddition.set("0");

    await db.update(pointSupply, { id: "supply" }).set((row) => ({
      maxPoints: row.maxPoints + addedYuzu,
    }));

    console.log("Yuzu addition applied", { added: addedYuzu.toString() });
  }

  await mineGlobalPoints(db, timestamp, 0n, "mint");
});
