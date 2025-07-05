import { createAuthClient } from "better-auth/react";
import { magicLinkClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [magicLinkClient(), adminClient()],
	fetchOptions: {
		onError: async (context) => {
			const { response } = context;
			console.log(response.status);
			// if (response.status === 429) {
			// 	const retryAfter = response.headers.get("X-Retry-After");
			// 	console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
			// }
		},
	},
});

export const { signIn, signOut, signUp, useSession } = authClient;
