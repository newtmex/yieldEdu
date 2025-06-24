import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { yieldEduMetadata } from "@/metadata";
import NextTopLoader from "nextjs-toploader";

const montserrat = Montserrat({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = yieldEduMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const learnersDashboardUrl = process.env.NEXT_PUBLIC_LEARNERS_DASHBOARD_URL;
	const investorsDashboardUrl = process.env.NEXT_PUBLIC_INVESTORS_DASHBOARD_URL;
	const supportUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
	const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
	const telegramCommunityUrl = process.env.NEXT_PUBLIC_TWITTER_URL;
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonkeyUrl = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!websiteUrl) {
		throw new Error("Environment variable for website URL is not set.");
	}

	if (!supabaseUrl || !anonkeyUrl) {
		throw new Error(
			"Environment variable for Supabase URL and anonkey is not set."
		);
	}

	if (!telegramCommunityUrl || !supportUrl) {
		throw new Error(
			"Environment variable for Telegram community and support URL is not set."
		);
	}

	if (!learnersDashboardUrl || !investorsDashboardUrl) {
		throw new Error("Environment variables for dashboard URLs are not set.");
	}

	return (
		<html lang="en">
			<body className={`${montserrat.variable} antialiased`}>
				<NextTopLoader
					showSpinner={false}
					color="#1E67C6"
					initialPosition={0.04}
					crawlSpeed={300}
					height={2}
					crawl={true}
					easing="ease"
					speed={350}
					shadow="0 0 10px #1E67C6,0 0 5px #1E67C6"
					zIndex={9999}
				/>
				{children}
				<Toaster theme="dark" richColors />
			</body>
		</html>
	);
}
