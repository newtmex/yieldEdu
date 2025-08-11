"use client";

import * as React from "react";
import {
	IconBooks,
	IconCamera,
	IconChartBar,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconGymnastics,
	IconHelp,
	IconInnerShadowTop,
	IconLayersSelected,
	IconListDetails,
	IconReport,
	IconSearch,
	IconSettings,
	IconSpeakerphone,
	IconTrophy,
	IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import YieldEDUIcon from "@/public/yieldedu.png";
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
			title: "Hub",
			url: "/",
			icon: IconLayersSelected,
			locked: false,
		},
		{
			title: "Courses",
			url: "/courses",
			icon: IconBooks,
			locked: false,
		},
		{
			title: "Achievements",
			url: "/achievements",
			icon: IconTrophy,
			locked: true,
		},
		{
			title: "Performance",
			url: "/performance",
			icon: IconGymnastics,
			locked: true,
		},
		{
			title: "Leaderboards",
			url: "/leaderboards",
			icon: IconChartBar,
			locked: true,
		},
		{
			title: "Campaigns",
			url: "/campaigns",
			icon: IconSpeakerphone,
			locked: true,
		},
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
			name: "Student",
			logo: null,
		},
		{
			name: "Investor",
			logo: null,
		},
	];
	const [activeView, setActiveView] = React.useState(view[0]);
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
									alt="YieldEdu"
									className="h-auto w-8"
									priority
								/>
							</Link>
							<div>
								<h1 className="text-xs font-bold">YieldEDU</h1>
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
								<div className="flex flex-col gap-1">
									<Link href={"/"}>
										<DropdownMenuItem
											onClick={() =>
												setActiveView({
													name: "Student",
													logo: null,
												})
											}
											className={cn(
												"flex items-center gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors ",
												{
													"bg-primary hover:dark:!text-lime-400 hover:!bg-black hover:dark:!bg-lime-600/20 hover:!text-white text-white  dark:bg-lime-600/20 dark:text-lime-400":
														activeView.name === "Student",
												}
											)}
										>
											Student
										</DropdownMenuItem>
									</Link>
									<Link
										href={process.env.NEXT_PUBLIC_INVESTORS_DASHBOARD_LINK!}
									>
										<DropdownMenuItem
											onClick={() =>
												setActiveView({
													name: "Investor",
													logo: null,
												})
											}
											className={cn(
												"flex items-center gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors ",
												{
													" ": activeView.name === "Investor",
												}
											)}
										>
											Investor{" "}
										</DropdownMenuItem>
									</Link>
								</div>
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
