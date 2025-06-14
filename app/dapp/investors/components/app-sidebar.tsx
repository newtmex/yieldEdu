"use client";

import * as React from "react";
import {
	IconDashboard,
	IconGift,
	IconHelp,
	IconRectangularPrism,
	IconSettings,
} from "@tabler/icons-react";
import YieldEDUIcon from "@/public/icon2.png";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronsUpDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: IconDashboard,
		},
		{
			title: "Transactions",
			url: "/transactions",
			icon: IconRectangularPrism,
		},

		{
			title: "Rewards",
			url: "/rewards",
			icon: IconGift,
			locked: true,
		},
		// {
		//   title: "Analytics",
		//   url: "#",
		//   icon: IconChartBar,
		// },
		// {
		//   title: "Projects",
		//   url: "#",
		//   icon: IconFolder,
		// },
		// {
		//   title: "Team",
		//   url: "#",
		//   icon: IconUsers,
		// },
	],

	navSecondary: [
		{
			title: "Settings",
			url: "/settings",
			icon: IconSettings,
			locked: false,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
			locked: true,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const view = [
		{
			name: "Default",
			logo: null,
		},
		{
			name: "Investor",
			logo: null,
		},
	];

	const [activeView, setActiveView] = React.useState(view[1]);
	const { isMobile } = useSidebar();

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="flex">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Link href={"/"}>
								<Image
									src={YieldEDUIcon}
									alt="YieldEdu Logo"
									className="size-10 aspect-square"
									priority
								/>
							</Link>
							<div>
								<h1 className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
									YieldEDU
								</h1>
								<p className="text-[10px] text-slate-500 dark:text-slate-400">
									The future of on-chain education.
								</p>
							</div>
						</div>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<ChevronsUpDown className="size-4 cursor-pointer" />
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] space-y-1 min-w-56 rounded-lg "
								align="start"
								side={isMobile ? "bottom" : "right"}
								sideOffset={4}
							>
								<DropdownMenuLabel className="text-xs text-muted-foreground">
									Access Mode
								</DropdownMenuLabel>
								<DropdownMenuItem
									disabled
									// onClick={() =>
									// 	setActiveView({
									// 		name: "Default",
									// 		logo: null,
									// 	})
									// }
									// className={cn(
									// 	"flex items-center cursor-pointer gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-slate-100 hover:dark:!bg-slate-700/60",
									// 	{
									// 		"bg-lime-100  hover:!bg-lime-100 !text-lime-700 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400 ":
									// 			activeView.name === "Default",
									// 	}
									// )}
								>
									Default <Lock size={12} className="text-red-600" />
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setActiveView({
											name: "Investor",
											logo: null,
										})
									}
									className={cn(
										"flex items-center gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-slate-100 hover:dark:!bg-slate-700/60",
										{
											"bg-lime-100  hover:!bg-lime-100 !text-lime-700 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400 ":
												activeView.name === "Investor",
										}
									)}
								>
									Investor{" "}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
