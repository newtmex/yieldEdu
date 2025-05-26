"use client";

import {
	BarChart2,
	Book,
	CreditCard,
	LineChart,
	Lock,
	Settings,
	Trophy,
	Wallet,
} from "lucide-react";

import Image from "next/image";
import React, { useEffect } from "react";
import YieldEDUIcon from "@/public/icon2.png";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClassValue } from "clsx";

import {
	SidebarHeader,
	Sidebar,
	SidebarMenu,
	SidebarMenuItem,
	SidebarContent,
	SidebarFooter,
	useSidebar,
} from "./ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { ChevronsUpDown } from "lucide-react";
import UserProfile from "./UserProfile";

const AppSidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { isMobile } = useSidebar();

	const teams = [
		{
			name: "Default",
			logo: null,
		},
		{
			name: "Investor",
			logo: null,
		},
	];

	const [activeTeam, setActiveTeam] = React.useState(teams[0]);

	useEffect(() => {
		if (pathname === "/dashboard/learn") {
			router.push("/dashboard");
		}
	}, [pathname, router]);

	return (
		<Sidebar variant="sidebar" className="border-none">
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
									Learn, Stake and Earn
								</p>
							</div>
						</div>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<ChevronsUpDown className="size-4 cursor-pointer" />
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] space-y-1 min-w-56 rounded-lg dark:bg-slate-800 bg-white border-none border-slate-200 dark:border-slate-700/50"
								align="start"
								side={isMobile ? "bottom" : "right"}
								sideOffset={4}
							>
								<DropdownMenuLabel className="text-xs text-muted-foreground">
									Access Mode
								</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() =>
										setActiveTeam({
											name: "Default",
											logo: null,
										})
									}
									className={cn(
										"flex items-center cursor-pointer gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-slate-100 hover:dark:!bg-slate-700/60",
										{
											"bg-lime-100  hover:!bg-lime-100 !text-lime-700 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400 ":
												activeTeam.name === "Default",
										}
									)}
								>
									Default
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled
									// onClick={() =>
									// 	setActiveTeam({
									// 		name: "Investor",
									// 		logo: null,
									// 	})
									// }
									// className={cn(
									// 	"flex items-center gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-slate-100 hover:dark:!bg-slate-700/60",
									// 	{
									// 		"bg-lime-100  hover:!bg-lime-100 !text-lime-700 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400 ":
									// 			activeTeam.name === "Investor",
									// 	}
									// )}
								>
									Investor <Lock size={12} className="text-red-600" />{" "}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<div className="flex-1 px-3">
					<div className="mb-6">
						<p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">
							Main
						</p>
						<nav className="space-y-0.5">
							<SidebarLink
								icon={<LineChart className="size-4" />}
								label="Dashboard"
								active={pathname === "/dashboard"}
								link={"/dashboard"}
							/>

							<SidebarLink
								className="opacity-25 cursor-not-allowed disabled"
								icon={<Book className="size-4" />}
								label="Learn"
								active={pathname === "/dashboard/learn"}
								link={"/dashboard"}
							/>

							<SidebarLink
								icon={<Lock className="size-4" />}
								label="Stake"
								active={pathname === "/dashboard/stake"}
								link={"/dashboard/stake"}
							/>

							<SidebarLink
								icon={<Trophy className="size-4" />}
								label="Rewards"
								active={pathname === "/dashboard/rewards"}
								link={"/dashboard/rewards"}
							/>
						</nav>
					</div>

					<hr className="border-slate-200 dark:border-slate-800/60 my-4" />

					<p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">
						Analytics
					</p>
					<div className="mb-6">
						<nav className="space-y-0.5">
							<SidebarLink
								icon={<BarChart2 className="size-4" />}
								label="Protocol Stats"
								active={pathname === "/dashboard/protocol-stats"}
								link={"/dashboard/protocol-stats"}
							/>
						</nav>
					</div>

					<hr className="border-slate-200 dark:border-slate-800/60 my-4" />
					<p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">
						Account
					</p>
					<div className="mb-6">
						<nav className="space-y-0.5">
							<SidebarLink
								icon={<Wallet className="size-4" />}
								label="Portfolio"
								active={pathname === "/dashboard/portfolio"}
								link={"/dashboard/portfolio"}
							/>

							<SidebarLink
								icon={<CreditCard className="size-4" />}
								label="Transactions"
								active={pathname === "/dashboard/transactions"}
								link={"/dashboard/transactions"}
							/>

							<SidebarLink
								icon={<Settings className="size-4" />}
								label="Settings"
								active={pathname === "/dashboard/settings"}
								link={"/dashboard/settings"}
							/>
						</nav>
					</div>
				</div>
			</SidebarContent>
			<SidebarFooter>
				<UserProfile />
			</SidebarFooter>
		</Sidebar>
	);
};

export default AppSidebar;

function SidebarLink({
	icon,
	label,
	active,
	link,
	className,
}: {
	active: boolean;
	label: string;
	icon: React.JSX.Element;
	link: string;
	className?: ClassValue;
}) {
	return label == "Learn" ? (
		<p
			className={cn(
				"flex items-center gap-3 text-sm w-full px-3 overflow-x-clip py-2 rounded-lg transition-colors",
				{
					"bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400":
						active,
					"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60":
						!active,
				},
				className
			)}
		>
			{icon} {label} <Lock size={15} className="text-red-600" />{" "}
		</p>
	) : (
		<Link
			href={link}
			
			className={cn(
				"flex items-center gap-3 w-full px-3 overflow-x-clip py-2 rounded-lg transition-colors",
				{
					"bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400":
						active,
					"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60":
						!active,
				},
				className
			)}
		>
			<span
				className={cn({
					"text-lime-600 dark:text-lime-400": active,
					"text-slate-500 dark:text-slate-400": !active,
				})}
			>
				{icon}
			</span>

			<span className="font-medium text-xs">{label}</span>
		</Link>
	);
}
