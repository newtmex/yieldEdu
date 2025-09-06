import { parseEther } from "viem";
import { DateTime } from "luxon";

export const SECS_IN_A_DAY = 24n * 60n * 60n;

// -------------------------------------------------------------------
// Points emission parameters
// -------------------------------------------------------------------
export const POINTS_PER_DAY = parseEther("0.12"); // 0.12 points/day
export const POINTS_PER_SECOND = POINTS_PER_DAY / SECS_IN_A_DAY; // bigint division

// -------------------------------------------------------------------
// Season timing
// -------------------------------------------------------------------
export const seasonStart = BigInt(
    Math.floor(DateTime.fromISO("2025-07-27").toSeconds())
);
export const seasonDeadline = BigInt(
    Math.floor(DateTime.fromISO("2025-10-31").toSeconds())
);
export const seasonDuration = seasonDeadline - seasonStart;

// -------------------------------------------------------------------
// Season allocation
// -------------------------------------------------------------------
const TOTAL_ALLOCATION = parseEther("1409628");
const RESERVED_AMOUNT = parseEther("600000");

export const seasonYuzuStartAmount = TOTAL_ALLOCATION - RESERVED_AMOUNT;

// Optional: when initial accrual would end
export const initialAccrualEndTimestamp =
    seasonYuzuStartAmount / POINTS_PER_SECOND + seasonStart;

// -------------------------------------------------------------------
// Fixed-point math constants
// -------------------------------------------------------------------
export const Q128 = 0x100000000000000000000000000000000n;
