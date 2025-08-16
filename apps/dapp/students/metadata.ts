import icon from "@/public/icon2.png";
import { Metadata } from "next";
import ogImage from "@/public/opengraph.png";

export const yieldEduMetadata: Metadata = {
	title: "YieldEdu - Students",
	description:
		"YieldEdu is the future of on-chain education. Learn and earn with bite-sized lessons. Track progress with YUZU points, student tokens, and streaks to unlock rewards.",
	applicationName: "YieldEdu",
	icons: [icon.src],

	keywords: [
		"Web3 Education",
		"DeFi Learning",
		"On-chain Education",
		"Earn While You Learn",
		"EduChain",
		"Crypto Education",
		"Learn and Earn",
		"Education dApp",
		"AI-Powered Learning",
		"YieldEdu",
	],
	creator: "Kamasah Dickson",

	openGraph: {
		title: "YieldEdu",
		type: "website",
		emails: ["kamasahdickson@gmail.com"],
		siteName: "YieldEdu",
		description:
			"YieldEdu is the future of on-chain education. Learn and earn with bite-sized lessons. Track progress with YUZU points, student tokens, and streaks to unlock rewards.",
		images: [
			{
				url: ogImage.src,
				width: ogImage.width,
				height: ogImage.height,
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "YieldEdu",
		description:
			"YieldEdu is the future of on-chain education. Learn and earn with bite-sized lessons. Track progress with YUZU points, student tokens, and streaks to unlock rewards.",
		images: ["/opengraph.png"],
		creator: "@bruh_codes",
	},
	metadataBase: new URL(process.env.BETTER_AUTH_URL as string),

	category: "education",

	alternates: {
		canonical: "./",
		languages: {
			"en-US": "/en-US",
		},
	},
};
