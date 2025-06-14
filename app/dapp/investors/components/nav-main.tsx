"use client";

import { IconLock, type Icon } from "@tabler/icons-react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
		locked?: boolean;
	}[];
}) {
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Main</SidebarGroupLabel>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) =>
						item.locked ? (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									disabled
									tooltip={item.title}
									className={cn(
										"text-slate-600 dark:text-slate-300 flex items-center gap-3 text-sm w-full px-3 overflow-x-clip py-2 rounded-lg cursor-pointer transition-colors"
									)}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<IconLock />
								</SidebarMenuButton>
							</SidebarMenuItem>
						) : (
							<SidebarMenuItem key={item.title}>
								<Link href={item.url}>
									<SidebarMenuButton
										tooltip={item.title}
										className={cn(
											"flex items-center gap-3 text-sm w-full px-3 overflow-x-clip py-2 rounded-lg cursor-pointer transition-colors",
											{
												"text-slate-600 dark:text-slate-300 hover:bg-lime-100 dark:hover:bg-lime-800/10":
													pathname !== item.url,
											},
											{
												"text-slate-800 bg-lime-300 hover:bg-lime-300 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400":
													pathname === item.url,
											}
										)}
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</SidebarMenuButton>
								</Link>
							</SidebarMenuItem>
						)
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
