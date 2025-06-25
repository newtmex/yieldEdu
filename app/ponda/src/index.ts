// import { createClient } from "@supabase/supabase-js";
import { ponder } from "ponder:registry";

// const supabase = createClient(
// 	process.env.NEXT_PUBLIC_SUPABASE_URL!,
// 	process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

ponder.on("Staking:Staked", async ({ event }) => {
	console.log(event.args);
	// event Staked(
	//     address indexed user,
	//     uint256 indexed tokenId,
	//     uint256 amount,
	//     uint256 shares,
	//     ISToken.TokenType tokenType
	// );

	// const { user, tokenId, amount, shares, tokenType, sTokenStatus } =
	// 	event.args;

	// const { data: existing, error } = await supabase
	// 	.from("staked_events")
	// 	.select("id")
	// 	.eq("token_id", tokenId.toString())
	// 	.eq("user_address", user.toLowerCase()) // normalize casing
	// 	.maybeSingle();

	// if (!existing) {
	// 	await supabase.from("staked_events").insert({
	// 		token_id: tokenId.toString(),
	// 		user_address: user.toLowerCase(),
	// 		amount: amount.toString(),
	// 		shares: shares.toString(),
	// 		token_type: tokenType,
	// 		created_at: new Date().toISOString(),
	// 		type: "stake",
	// 		stokenstatus: sTokenStatus,
	// 		status: "active",
	// 	});
	// }
});
