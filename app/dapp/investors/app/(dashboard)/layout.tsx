import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import WagmiContextProvider from "@/components/wagmi-provider";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { yieldEduMetadata } from "@/metadata";
import SyncUserToDb from "@/components/auth/sync-user";

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
});

export const metadata: Metadata = yieldEduMetadata;

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersObj = await headers();
	const cookies = headersObj.get("cookie");

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${montserrat.variable} ${geistMono.variable} antialiased`}
			>
				<NextTopLoader
					showSpinner={false}
					color="#84cc16"
					initialPosition={0.04}
					crawlSpeed={300}
					height={2}
					crawl={true}
					easing="ease"
					speed={350}
					shadow="0 0 10px #84cc16,0 0 5px #84cc16"
					zIndex={9999}
				/>

				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<SidebarProvider
						style={
							{
								"--sidebar-width": "calc(var(--spacing) * 72)",
								"--header-height": "calc(var(--spacing) * 12)",
							} as React.CSSProperties
						}
					>
						<WagmiContextProvider cookies={cookies}>
							<AppSidebar variant="inset" />
							<SidebarInset>
								<DashboardHeader />
								<div className="flex flex-1 flex-col">
									<main className="@container/main flex flex-1 flex-col gap-2">
										<SyncUserToDb />
										{children}
										<Toaster richColors />
									</main>
								</div>
							</SidebarInset>
						</WagmiContextProvider>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
