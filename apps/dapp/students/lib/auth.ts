import EmailTemplate from "@/components/email-template";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { magicLink } from "better-auth/plugins/magic-link";
import { Pool } from "pg";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	rateLimit: {
		enabled: true,
		window: 60, // 1 minute
		max: 3, // Max 3 requests per minute
		customRules: {
			"/sign-in/magic-link": {
				window: 5,
				max: 1,
			},
		},
		storage: "memory",
		modelName: "rateLimit",
	},
	trustedOrigins: ["http://localhost:3000"],
	socialProviders: {
		// google: {
		// 	clientId: process.env.GOOGLE_CLIENT_ID!,
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		// },
		// twitter: {
		// 	clientId: process.env.TWITTER_CLIENT_ID!,
		// 	clientSecret: process.env.TWITTER_CLIENT_SECRET!,
		// },
	},
	plugins: [
		magicLink({
			async sendMagicLink({ email, url }) {
				// const { error } = await resend.emails.send({
				// 	from: "YieldEdu <onboarding@support.yieldedu.xyz>",
				// 	to: [email],
				// 	subject: "Your Magic Sign-In Link for YieldEdu",
				// 	react: EmailTemplate({ link: url }),
				// });
				// if (error) console.log(error);
			},
		}),

		admin({
			adminRoles: ["admin", "partner admin"],
		}),
	],
	/** if no database is provided, the user data will be stored in memory.
	 * Make sure to provide a database to persist user data **/
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
});
