"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import {
	ThemeMode,
	useAppKit,
	useAppKitAccount,
	useAppKitTheme,
} from "@reown/appkit/react";
import { useTheme } from "next-themes";
import AppKitButton from "./AppKitButton";
import Feedback from "./Feedback";
import { handleUserUpdate } from "@/utils/supabase/helpers";
import FaucetButton from "@/components/ui/FaucetButton";
import { SidebarTrigger } from "./ui/sidebar";
import UserProfile from "./UserProfile";

const DashboardHeader = () => {
	const { open } = useAppKit();
	const { theme } = useTheme();
	const { setThemeMode } = useAppKitTheme();
	const { isConnected, address } = useAppKitAccount();

	useEffect(() => {
		setThemeMode(theme as ThemeMode);
	}, [theme, setThemeMode]);

	useEffect(() => {
		const updateUser = async () => {
			if (isConnected && address) {
				// Update the user in the database
				await handleUserUpdate(isConnected, address);
			} else {
				console.error("Wallet connection failed or address is unavailable.");
			}
		};

		updateUser();
	}, [address, isConnected]);

	return (
		<header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
			<SidebarTrigger className="-ml-1" />
			<div className="flex w-full items-center justify-end gap-1 lg:gap-2">
				<FaucetButton userAddress={address} />

				<Feedback className="hidden md:flex">
					<Button
						className="hover:bg-transparent border-none  font-semibold hover:text-slate-700 dark:hover:text-lime-500 text-xs"
						variant="ghost"
					>
						Feedback
					</Button>
				</Feedback>
				<Button
					variant="ghost"
					className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs hover:text-lime-500 hover:bg-lime-500/10"
				>
					<Crown className="size-4" />
					<span>Level 2</span>
				</Button>
				{!isConnected ? (
					<Button
						type="button"
						onClick={() => open({ view: "Connect" })}
						className="bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90 text-xs"
					>
						Connect Wallet
					</Button>
				) : (
					<AppKitButton />
				)}
				<UserProfile showOCID={false} showTiggerIcon={false} />
			</div>
		</header>
	);
};

export default DashboardHeader;
