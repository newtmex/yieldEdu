"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	ThemeMode,
	useAppKit,
	useAppKitAccount,
	useAppKitTheme,
} from "@reown/appkit/react";
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { NavUser } from "./nav-user";
import { Separator } from "./ui/separator";
import {
	IconBrandTelegram,
	IconBrandX,
	IconFlameFilled,
	IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import AppKitButton from "./appkit-button";
import Image from "next/image";
import yuzuIcon from "@/public/yuzu.png";
import { TooltipInfo } from "./tooltip-info";
import { useCourseSidebar } from "@/hooks/use-course-sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const DashboardHeader = () => {
	const { open } = useAppKit();
	const { theme } = useTheme();
	const { setThemeMode } = useAppKitTheme();
	const { isConnected } = useAppKitAccount();
	const { isMobile } = useSidebar();
	const { toggleCourseSidebar } = useCourseSidebar();
	const pathname = usePathname();

	const isLearningPage = pathname?.match(/^\/courses\/[^/]+\/learning$/);

	useEffect(() => {
		setThemeMode(theme as ThemeMode);
	}, [theme, setThemeMode]);

	return (
		<header className="rounded-t-lg sticky inset-0 bg-background z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				{isLearningPage && (
					<Button
						variant="outline"
						size="icon"
						className="lg:hidden"
						onClick={toggleCourseSidebar}
					>
						<Menu className="size-5" />
					</Button>
				)}

				<div className="flex w-full items-center justify-end gap-1 lg:gap-3">
					{/* <FaucetButton userAddress={address} /> */}

					{/* <Feedback className="hidden md:flex">
					<Button
						className="hover:bg-transparent border-none  font-semibold hover:text-slate-700 dark:hover:text-lime-500 text-xs"
						variant="ghost"
					>
						Feedback
					</Button>
				</Feedback> */}
					<div className="pr-5 flex gap-5">
						<div className="text-center">
							<div className="flex items-center justify-center gap-2">
								<IconFlameFilled className="size-3 md:size-5 text-orange-500" />
								<span className="text-xs md:text-sm font-bold">
									28 {isMobile ? "" : ""}
								</span>
								<TooltipInfo
									className="text-muted-foreground hidden md:flex"
									content="You earn a streak for each day you complete a course or activity. Keep your streak alive to boost your rewards and stay consistent in your learning!"
								/>
							</div>
						</div>

						<div className="text-center">
							<div className="flex items-center justify-center gap-2">
								<Image
									alt="yuzu points"
									src={yuzuIcon}
									className="w-3 md:w-5 h-auto"
								/>

								<span className="text-xs md:text-sm font-bold">
									2,840
									{isMobile ? "" : " "}
								</span>
								<TooltipInfo
									className="hidden md:flex text-muted-foreground"
									content="YUZU is your learning reward currency. Earn YUZU by completing lessons, challenges, and maintaining streaks. Use them to unlock premium content, get rewards, or redeem exclusive perks."
								/>
							</div>
						</div>
					</div>

					{!isConnected ? (
						<Button
							className="dark:hover:!bg-lime-600/20 dark:bg-lime-500/10 dark:!text-lime-400"
							variant={"default"}
							type="button"
							onClick={() => open({ view: "Connect" })}
						>
							{isMobile ? <IconWallet /> : "Connect wallet"}
						</Button>
					) : (
						<AppKitButton />
					)}
					<NavUser className="w-fit" showInfo={false} />
					<div className="hidden [@media(width>=25rem)]:flex gap-3">
						<Link
							className="text-primary"
							href={"https://t.me/+NO7thgSfAFQyMGY0"}
							target="_blank"
						>
							<IconBrandTelegram className="w-5 h-5" />
						</Link>
						<Link
							className="text-primary"
							href={"https://x.com/yield_edu"}
							target="_blank"
						>
							<IconBrandX className="w-5 h-5" />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
