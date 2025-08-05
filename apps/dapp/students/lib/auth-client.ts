import { createAuthClient } from "better-auth/react";
import {
	inferAdditionalFields,
	magicLinkClient,
	adminClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth.ts";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	fetchOptions: {
		onError(context) {
			const { response } = context;
			if (response.status === 429) {
				const retryAfter = response.headers.get("X-Retry-After");
				console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
			}
		},
	},
	plugins: [
		magicLinkClient(),
		inferAdditionalFields<typeof auth>(),
		adminClient({
			ac,
			roles,
		}),
	],
});

export const { signIn, signOut, signUp, useSession } = authClient;
