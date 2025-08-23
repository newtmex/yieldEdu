import icon from "@/public/icon2.png";
import { Metadata } from "next";
import ogImage from "@/public/opengraph.png";

export const yieldEduMetadata: Metadata = {
	title: "YieldEdu | The Future of On-Chain Education",
	description:
		"YieldEdu is a revolutionary where education meets Web3. Complete interactive lessons, Invest in education, and earn rewards",
	applicationName: "YieldEdu",
	icons: [icon.src],

	authors: [{ name: "Kamasah Dickson", url: "https://github.com/Bruh-Codes" }],
	keywords: [
		"Web3 Education",
		"DeFi Learning",
		"On-chain Education",
		"Guaranteed Yield",
		"Yield Farming",
		"Decentralized Finance",
		"Earn While You Learn",
		"EduChain",
		"Staking Rewards",
		"Crypto Education",
		"Learn and Earn",
		"Education dApp",
		"AI in Education",
		"DeFi AI",
		"AI Web3",
		"AI-Powered Learning",
		"YieldEdu",
		"Web3 AI Assistant",
	],
	creator: "Kamasah Dickson",

	openGraph: {
		title: "YieldEdu",
		type: "website",
		emails: ["kamasahdickson@gmail.com"],
		siteName: "YieldEdu",
		description:
			"YieldEdu is a revolutionary where education meets Web3. Complete interactive lessons, Invest in education, and earn rewards",
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
			"Invest in education and earn returns while supporting a smarter future. Your investment powers learning and rewards your impact.",
		images: ["/opengraph.png"],
		creator: "@bruh_codes",
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL as string),

	category: "education",

	alternates: {
		canonical: "./",
		languages: {
			"en-US": "/en-US",
		},
	},
};
