import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Crown } from "lucide-react";
import Link from "next/link";
import { useOCAuth } from "@opencampus/ocid-connect-js";

const UserProfile = ({
	showOCID = true,
	showTiggerIcon = true,
}: {
	showOCID?: boolean;
	showTiggerIcon?: boolean;
}) => {
	const { ocAuth, OCId } = useOCAuth();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex gap-3 items-center justify-start">
					<Avatar className="cursor-pointer size-8">
						<AvatarImage src="/placeholder.png" className="rounded-full" />
						<AvatarFallback>YE</AvatarFallback>
					</Avatar>
					{showOCID && (
						<div className="text-xs">
							<pre className="text-lime-400 text-xs">{OCId}</pre>
						</div>
					)}
					{showTiggerIcon && <EllipsisVertical size={17} />}
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg dark:bg-slate-800 bg-white border-slate-200 dark:border-slate-700/50">
				<DropdownMenuLabel>
					{/* My Account */}
					<div className={cn("flex items-center gap-2")}>
						<div className="w-8 h-8 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
							<Crown className="size-4 text-lime-600 dark:text-lime-400" />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-900 dark:text-white">
								Level 2
							</p>
							<p className="text-[10px] text-slate-500 dark:text-slate-400">
								{OCId}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuGroup>
					<Link href={"/dashboard/profile"}>
						<DropdownMenuItem
							className={cn(
								"flex items-center cursor-pointer gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-lime-100 dark:hover:!bg-slate-700/60"
							)}
						>
							Profile
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>

				{/* <DropdownMenuItem
							className={cn(
								"flex items-center gap-2 p-2 w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-lime-100 dark:hover:!bg-slate-700/60"
							)}
						>
							Support
						</DropdownMenuItem> */}

				{ocAuth?.getAuthState()?.isAuthenticated ? (
					<DropdownMenuItem
						onClick={async () => await ocAuth?.logout(window.location.origin)}
						className={cn(
							"flex items-center gap-2 p-2 cursor-pointer w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-lime-100 dark:hover:!bg-slate-700/60"
						)}
					>
						Log out
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						onClick={async () =>
							await ocAuth?.signInWithRedirect({ state: "opencampus" })
						}
						className={cn(
							"flex items-center gap-2 p-2 cursor-pointer w-full overflow-x-clip py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:!bg-lime-100 dark:hover:!bg-slate-700/60"
						)}
					>
						Sign In With OCID
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserProfile;
