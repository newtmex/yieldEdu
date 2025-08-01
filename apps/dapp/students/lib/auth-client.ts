import { createAuthClient } from "better-auth/react";
import {
	inferAdditionalFields,
	magicLinkClient,
	adminClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth.ts";
// import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [
		magicLinkClient(),
		inferAdditionalFields<typeof auth>(),
		adminClient({
			// ac,
			// roles,
		}),
	],
});

export const { signIn, signOut, signUp, useSession } = authClient;
