import EmailTemplate from "@/components/email-template";
import { betterAuth, string } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { Pool } from "pg";
import { Resend } from "resend";
import { admin } from "better-auth/plugins";
import { ac, roles } from "@/lib/permissions";
const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
	throw new Error("RESEND_API_KEY is not set");
}

enum UserRoles {
	admin = "admin",
	partner = "partner",
	creator = "creators",
	user = "user",
}

export const auth = betterAuth({
	user: {
		additionalFields: {
			OCId: {
				type: "string",
				input: false,
			},
			ethAddress: {
				type: "string",
				input: false,
			},
			role: {
				type: ["admin", "partner", "creator", "user"],
				input: false,
			},
		},
	},

	session: {
		additionalFields: {
			OCId: {
				type: "string",
			},
			ethAddress: {
				type: "string",
			},
			role: {
				type: "string",
			},
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "twitter"],
		},
	},
	rateLimit: {
		enabled: true,
		window: 900, // 15  minutes
		max: 20, // Max 20 requests per minute
		storage: "database",
		customRules: {
			"/sign-in/magic-link": {
				window: 600, // 10 minutes
				max: 3, // 3 magic links per 10 minutes
			},
		},
	},
	trustedOrigins: ["https://students.yieldedu.xyz"],
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		twitter: {
			clientId: process.env.TWITTER_CLIENT_ID!,
			clientSecret: process.env.TWITTER_CLIENT_SECRET!,
		},
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
			disableIpTracking: false,
		},
	},
	plugins: [
		magicLink({
			async sendMagicLink({ email, url }) {
				const { error } = await resend.emails.send({
					from: "YieldEdu <onboarding@support.yieldedu.xyz>",
					to: [email],
					subject: "Your Magic Sign-In Link for YieldEdu",
					react: EmailTemplate({ link: url }),
				});
				if (error) console.log(error);
			},
		}),
		admin({
			defaultRole: UserRoles.user,
			adminRoles: [UserRoles.admin, UserRoles.creator, UserRoles.partner],
			ac,
			roles,
		}),
	],
	/** if no database is provided, the user data will be stored in memory.
	 * Make sure to provide a database to persist user data **/
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
});
