import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import YieldEDUIcon from "@/public/icon2.png";
import Header from "@/components/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const roboto = Roboto({
	variable: "--font-roboto",
	subsets: [
		"latin",
		"cyrillic",
		"latin-ext",
		"vietnamese",
		"cyrillic-ext",
		"greek",
		"latin",
	],
	weight: "400",
});

export const metadata: Metadata = {
	title: "YieldEDU - Earn Guaranteed Yields",
	description:
		"A decentralized fixed-yield protocol that earns users guaranteed yields on their EDU tokens.",
	icons: [YieldEDUIcon.src],
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider className={cn("max-w-7xl mx-auto", roboto.className)}>
			<AppSidebar />
			<SidebarInset className="p-5">
				<div className="bg-slate-100 dark:bg-slate-800/40 p-7 rounded-3xl">
					<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
						<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
						<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
					</div>
					
					 <Header />
					<main className="flex pt-3 flex-1 flex-col">{children}</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
