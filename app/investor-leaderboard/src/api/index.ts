import { Hono } from "hono";
import { db } from "ponder:api";
import schema, { userPoints } from "ponder:schema";
import { and, client, count, desc, graphql, ne, sql } from "ponder";
import { yuzuAddition } from "../helpers/TextFileStore";
import { API_KEY } from "../../ponder.config";
import { formatEther, parseUnits } from "viem";
import { Q128 } from "../points/compute/constants";

// -----------------------------------------------------------------------------
// App Initialization
// -----------------------------------------------------------------------------
const app = new Hono();

// Debug + GraphQL API exposure
app.use("/sql/*", client({ db, schema }));
app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------
function requireApiKey(c: any) {
    const apiKey = c.req.header("x-api-key");
    if (apiKey !== API_KEY) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return null;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
export const normalizePoints = (value: string): number =>
    +formatEther(parseUnits(value, 0));

/**
 * Build SQL expression for pending rewards:
 * ((globalPPS - userPPS) * shares) / Q128
 */
export function pointsAccruedExpr(globalPPS: bigint) {
    return sql<string>`(
    (${userPoints.shares} * (${globalPPS} - ${userPoints.pointPerShare})) / ${Q128}
  )`;
}

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

/**
 * GET /addYuzu
 * Adds Yuzu points to queue. Requires API key.
 */
app.get("/addYuzu", async (c) => {
    try {
        const unauthorized = requireApiKey(c);
        if (unauthorized) return unauthorized;

        const addedAmountStr = c.req.query("addedAmount");
        if (!addedAmountStr) {
            return c.json({ error: "Missing addedAmount" }, 400);
        }

        let addedAmount: bigint;
        try {
            addedAmount = BigInt(addedAmountStr);
        } catch {
            return c.json({ error: "Invalid addedAmount format" }, 400);
        }

        if (addedAmount <= 0n) {
            return c.json({ error: "addedAmount must be greater than 0" }, 400);
        }

        const current = await yuzuAddition
            .read()
            .then((v) => (v ? BigInt(v) : 0n));
        const newTotal = current + addedAmount;
        await yuzuAddition.set(newTotal.toString());

        return c.json({
            success: true,
            addedAmount: addedAmount.toString(),
            totalQueued: newTotal.toString(),
            timestamp: Date.now(),
        });
    } catch (err) {
        console.error("Error in /addYuzu", err);
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * GET /leaderboard
 * Returns a paginated leaderboard sorted by pending points.
 */
app.get("/leaderboard", async (c) => {
    try {
        // Pagination
        const query = c.req.query();
        const page = Math.max(1, Number(query.page) || 1);
        let limit = Number(query.limit) || 10;
        if (limit > 100) limit = 100;
        const offset = (page - 1) * limit;

        // Load global state
        const global = await db.query.pointSupply.findFirst();
        if (!global) {
            return c.json({ error: "point_supply not initialized" }, 500);
        }

        const { pointsAccrued, pointsPerShare } = global;

        const maxPoints = (global.maxPoints * 9n) / 10n;
        const pointsAvailable = maxPoints - pointsAccrued;

        const effectivePointsExpr = pointsAccruedExpr(pointsPerShare);

        // Count users
        const totalUsers = await db.$count(
            userPoints,
            ne(userPoints.shares, 0n)
        );

        // Leaderboard slice
        const leaderboardRows = await db
            .select({
                walletAddress: userPoints.id,
                pendingPoints: effectivePointsExpr,
            })
            .from(userPoints)
            .where(ne(userPoints.shares, 0n))
            .orderBy(desc(effectivePointsExpr))
            .limit(limit)
            .offset(offset);

        const enriched = leaderboardRows.map((row, i) => ({
            walletAddress: row.walletAddress as `0x${string}`,
            pendingPoints: normalizePoints(row.pendingPoints),
            userPosition: offset + i + 1, // derive position without extra queries
        }));

        return c.json({
            page,
            limit,
            totalRecords: totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            totalDeposits: formatEther(global.totalDeposits),
            maxPoints: formatEther(maxPoints),
            pointsAccrued: formatEther(pointsAccrued),
            pointsAvailable: formatEther(pointsAvailable),
            pointsDistributed: enriched.reduce(
                (a, c) => a + c.pendingPoints,
                0
            ),
            result: enriched,
        });
    } catch (err) {
        console.error("Error in /leaderboard", err);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------
export default app;
