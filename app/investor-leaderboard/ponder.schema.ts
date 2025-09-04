import { onchainTable } from "ponder";
import { seasonYuzuStartAmount } from "./src/points/compute/constants";

/**
 * Table: user_points
 * -------------------
 * Tracks per-user balances and reward-per-share snapshots.
 */
export const userPoints = onchainTable("user_points", (t) => ({
  /** User address (EVM hex string) */
  id: t.varchar().primaryKey(),

  /** User’s last recorded global points-per-share value */
  pointPerShare: t.bigint().notNull().default(0n),

  /** Number of shares (deposits) held by the user */
  shares: t.bigint().notNull().default(0n),
}));

/**
 * Table: point_supply
 * -------------------
 * Singleton table (id = "supply") tracking global accrual state.
 */
export const pointSupply = onchainTable("point_supply", (t) => ({
  /** Singleton row: always use key = "supply" */
  id: t.varchar().primaryKey().default("supply"),

  /** Total active deposits (basis for point accrual and PPS denominator) */
  totalDeposits: t.bigint().notNull().default(0n),

  /** Maximum number of points that can ever be distributed */
  maxPoints: t.bigint().notNull().default(seasonYuzuStartAmount),

  /** Global points-per-share accumulator (scaled by Q128 for precision) */
  pointsPerShare: t.bigint().notNull().default(0n),

  /** Points currently reserved but not yet distributed */
  pointReserve: t.bigint().notNull().default(0n),

  /** Last timestamp (in seconds) when the state was updated */
  updatedAt: t.bigint().notNull().default(0n),
}));
