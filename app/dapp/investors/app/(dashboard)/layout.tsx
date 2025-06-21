import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import WagmiContextProvider from "@/components/wagmi-provider";
import { headers } from "next/headers";
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

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersObj = await headers();
	const cookies = headersObj.get("cookie");

	return (
		<div className={`${montserrat.variable} ${geistMono.variable}`}>
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
							</main>
						</div>
					</SidebarInset>
				</WagmiContextProvider>
			</SidebarProvider>
		</div>
	);
}
