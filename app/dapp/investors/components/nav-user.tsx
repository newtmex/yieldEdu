"use client";

import {
	IconDotsVertical,
	IconLogin,
	IconLogout,
	IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import {
	useAppKit,
	useAppKitAccount,
	useDisconnect,
} from "@reown/appkit/react";
import { toast } from "sonner";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function NavUser({
	showInfo = true,
	className,
}: {
	showInfo?: boolean;
	className?: ClassValue;
}) {
	const { isMobile } = useSidebar();
	const { open } = useAppKit();
	const { disconnect } = useDisconnect();
	const { isConnected, caipAddress, address, embeddedWalletInfo } =
		useAppKitAccount();

	const queryClient = useQueryClient();
	const handleDisconnect = async () => {
		try {
			await disconnect();
			toast.success("Disconnected successfully");
			queryClient.removeQueries({
				queryKey: ["profile-details", address],
			});
		} catch (error) {
			console.error("Failed to disconnect:", error);
			toast.error("Failed to disconnect.");
		}
	};

	const { data: profileDetails } = useQuery({
		queryKey: ["profile-details", address],
		queryFn: async () => {
			const response = await supabase
				.from("investors")
				.select("*")
				.eq("address", address)
				.single();

			return response.data;
		},
		enabled: !!address,
	});
	return (
		<SidebarMenu className={cn(className)}>
			<SidebarMenuItem>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className={cn(
								"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
								className
							)}
						>
							<Avatar className="h-8 w-8 rounded-full grayscale">
								<AvatarImage src={""} alt={""} />
								<AvatarFallback className="rounded-full">
									{(embeddedWalletInfo?.user?.username?.charAt(0) ||
										profileDetails?.username?.charAt(0)) ??
										"AN"}
								</AvatarFallback>
							</Avatar>
							{showInfo && (
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{(embeddedWalletInfo?.user?.username ||
											profileDetails?.username) ??
											address}
									</span>
									<span className="text-muted-foreground truncate text-xs">
										{(() => {
											if (
												embeddedWalletInfo?.user?.email &&
												embeddedWalletInfo.authProvider === "google"
											) {
												return embeddedWalletInfo.user.email;
											}
											if (profileDetails?.email) {
												return profileDetails.email;
											}
											return caipAddress;
										})()}
									</span>
								</div>
							)}
							{showInfo && <IconDotsVertical className="ml-auto size-4" />}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-full">
									<AvatarImage src={""} alt={""} />
									<AvatarFallback className="rounded-full">
										{(embeddedWalletInfo?.user?.username?.charAt(0) ||
											profileDetails?.username?.charAt(0)) ??
											"AN"}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{(embeddedWalletInfo?.user?.username ||
											profileDetails?.username) ??
											address}
									</span>
									<span className="text-muted-foreground truncate text-xs">
										{(() => {
											if (
												embeddedWalletInfo?.user?.email &&
												embeddedWalletInfo.authProvider === "google"
											) {
												return embeddedWalletInfo.user.email;
											}
											if (profileDetails?.email) {
												return profileDetails.email;
											}
											return caipAddress;
										})()}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<Link href={"/settings?tab=profile"}>
								<DropdownMenuItem>
									<IconUserCircle />
									Profile
								</DropdownMenuItem>
							</Link>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						{!isConnected ? (
							<DropdownMenuItem onClick={() => open()}>
								<IconLogin />
								Log In
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={handleDisconnect}>
								<IconLogout />
								Log out
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
