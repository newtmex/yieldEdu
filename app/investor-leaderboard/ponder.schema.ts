import { onchainTable } from "ponder";
import { seasonYuzuStartAmount } from "./src/points/compute/constants";

/**
 * Table: user_points
 * -------------------
 * Stores per-user state for share balances and reward tracking.
 */
export const userPoints = onchainTable("user_points", (t) => ({
    /**
     * Unique user identifier (EVM address in hex format).
     */
    id: t.varchar().primaryKey(),

    /**
     * Last recorded global `pointsPerShare` at which the user’s rewards were updated.
     * Used to calculate pending rewards.
     */
    pointPerShare: t.bigint().notNull().default(0n),

    /**
     * Current number of shares (deposits) held by the user.
     */
    shares: t.bigint().notNull().default(0n),
}));

/**
 * Table: point_supply
 * -------------------
 * Singleton table (id = "supply") tracking global reward accrual state.
 */
export const pointSupply = onchainTable("point_supply", (t) => ({
    /**
     * Singleton identifier (always set to "supply").
     */
    id: t.varchar().primaryKey().default("supply"),

    /**
     * Total active shares across all users.
     * Used as the denominator for points-per-share calculations.
     */
    totalDeposits: t.bigint().notNull().default(0n),

    /**
     * Maximum number of points that can be distributed for the season.
     */
    maxPoints: t.bigint().notNull().default(seasonYuzuStartAmount),

    /**
     * Global accumulator of distributed points, scaled by Q128 for precision.
     */
    pointsPerShare: t.bigint().notNull().default(0n),

    /**
     * Cumulative number of points distributed so far.
     */
    pointsAccrued: t.bigint().notNull().default(0n),

    /**
     * Points reserved (allocated but not yet distributed).
     */
    pointsReserve: t.bigint().notNull().default(0n),

    /**
     * Current emission rate of points (points per second).
     */
    pointsPerSec: t.bigint().notNull().default(0n),
}));
