import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { yuzuAddition } from "../helpers/TextFileStore";
import { API_KEY } from "../../ponder.config";

const app = new Hono();

// Expose SQL + GraphQL APIs
app.use("/sql/*", client({ db, schema }));
app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

/**
 * GET /addYuzu
 * Adds Yuzu points if API key is valid.
 * Expects:
 *   - Header: x-api-key
 *   - Query param: addedAmount (stringified bigint)
 */
app.get("/addYuzu", async (c) => {
    try {
        // ✅ Validate API key from header
        const apiKey = c.req.header("x-api-key");
        if (apiKey !== API_KEY) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // ✅ Parse query param
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

        // ✅ Accumulate rather than overwrite
        const current = await yuzuAddition
            .read()
            .then((v) => (!v ? 0n : BigInt(v)));
        await yuzuAddition.set((current + addedAmount).toString());

        return c.json({
            success: true,
            addedAmount: addedAmount.toString(),
            totalQueued: (current + addedAmount).toString(),
            timestamp: Date.now(),
        });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

export default app;
