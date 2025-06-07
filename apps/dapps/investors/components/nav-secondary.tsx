"use client";

import * as React from "react";
import { IconLock, type Icon } from "@tabler/icons-react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
// import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: Icon;
		locked?: boolean;
	}[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const pathname = usePathname();
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
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
								<SidebarMenuButton
									tooltip={item.title}
									className={cn(
										"flex items-center gap-3 text-sm w-full px-3 overflow-x-clip py-2 rounded-lg cursor-pointer transition-colors",
										{
											"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60":
												pathname !== item.url,
										},
										{
											"bg-primary/10 text-primary  hover:text-primary hover:bg-primary/10 dark:hover:!bg-lime-500/10 dark:bg-lime-500/10 dark:!text-lime-400":
												pathname === item.url,
										}
									)}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
