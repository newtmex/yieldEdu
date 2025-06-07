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
// import { handleUserUpdate } from "@/utils/supabase/helpers";
import { SidebarTrigger } from "./ui/sidebar";
import { NavUser } from "./nav-user";
import AppKitButton from "./appkit-button";
import FaucetButton from "./faucet-button";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";

const DashboardHeader = () => {
	const { open } = useAppKit();
	const { theme } = useTheme();
	const { setThemeMode } = useAppKitTheme();
	const { isConnected, address } = useAppKitAccount();
	const pathname = usePathname();

	useEffect(() => {
		setThemeMode(theme as ThemeMode);
	}, [theme, setThemeMode]);

	// useEffect(() => {
	// 	const updateUser = async () => {
	// 		if (isConnected && address) {
	// 			// Update the user in the database
	// 			await handleUserUpdate(isConnected, address);
	// 		} else {
	// 			console.error("Wallet connection failed or address is unavailable.");
	// 		}
	// 	};

	// 	updateUser();
	// }, [address, isConnected]);

	return (
		// <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
		<header className="rounded-lg sticky inset-0 bg-background z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<h1 className="text-base font-medium hidden md:flex">
					{pathname === "/" ? "Dashboard" : pathname.slice(1).toUpperCase()}
				</h1>
				<div className="flex w-full items-center justify-end gap-1 lg:gap-2">
					<FaucetButton userAddress={address} />

					{/* <Feedback className="hidden md:flex">
					<Button
						className="hover:bg-transparent border-none  font-semibold hover:text-slate-700 dark:hover:text-lime-500 text-xs"
						variant="ghost"
					>
						Feedback
					</Button>
				</Feedback> */}

					{!isConnected ? (
						<Button
							className=" dark:hover:!bg-lime-600/20 dark:bg-lime-500/10 dark:!text-lime-400"
							variant={"secondary"}
							type="button"
							onClick={() => open({ view: "Connect" })}
						>
							Connect Wallet
						</Button>
					) : (
						<AppKitButton />
					)}
					{/* <UserProfile showOCID={false} showTiggerIcon={false} /> */}
					<NavUser className="w-fit" showInfo={false} />
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
