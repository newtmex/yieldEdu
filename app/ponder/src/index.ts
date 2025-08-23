import { createClient } from "@supabase/supabase-js";
import { ponder } from "ponder:registry";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

ponder.on(
	"Staking:Staked",
	async ({
		event,
	}: {
		event: {
			args: {
				user: string;
				tokenId: string | number;
				amount: string | number;
				shares: string | number;
				tokenType: string | number;
			};
		};
	}) => {
		const { user, tokenId, amount, shares, tokenType } = event.args;

		const { data: existing, error } = await supabase
			.from("staked_events")
			.select("id")
			.eq("token_id", tokenId.toString())
			.eq("user_address", user)
			.eq("amount", amount.toString())
			.eq("shares", shares.toString())
			.maybeSingle();

		if (error) {
			console.error("Error checking existing staked event:", error.message);
		}

		if (!existing) {
			const { error } = await supabase.from("staked_events").insert({
				token_id: tokenId.toString(),
				user_address: user,
				amount: amount.toString(),
				shares: shares.toString(),
				token_type: tokenType.toString(),
				type: "staked",
				sTokenStatus: "unbounded",
				status: "active",
			});
			if (error) {
				console.error("Error inserting staked event:", error.message);
			}
		}
	}
);

ponder.on(
	"Staking:Unstaked",
	async ({
		event,
	}: {
		event: {
			args: {
				user: string;
				tokenId: string | number;
				withdrawnAmount: string | number;
				userAccrual: string | number;
				shares: string | number;
				protocolPloughBack: string | number;
			};
		};
	}) => {
		const {
			user,
			tokenId,
			withdrawnAmount,
			userAccrual,
			shares,
			protocolPloughBack,
		} = event.args;

		const { data: existing, error } = await supabase
			.from("unstaked_events")
			.select("id")
			.eq("token_id", tokenId.toString())
			.eq("user_address", user)
			.eq("amount", withdrawnAmount.toString())
			.eq("shares", shares.toString())
			.maybeSingle();
		if (error) {
			console.error("Error checking existing unstaked event:", error.message);
		}

		if (!existing) {
			const { error } = await supabase.from("unstaked_events").insert({
				token_id: tokenId.toString(),
				user_address: user,
				amount: withdrawnAmount.toString(),
				shares: shares.toString(),
				type: "unstaked",
				user_accrual: userAccrual.toString(),
				protocol_plough_back: protocolPloughBack.toString(),
			});

			if (error) {
				console.error("Error inserting unstaked event:", error.message);
			}
		}
	}
);
