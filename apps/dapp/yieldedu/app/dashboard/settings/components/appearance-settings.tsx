"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

export function AppearanceSettings() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="space-y-6">
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Theme</CardTitle>
					<CardDescription>
						Customize how YieldEdu looks on your device
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<RadioGroup
						value={theme}
						onValueChange={(value) => setTheme(value)}
						className="grid grid-cols-1 gap-4 sm:grid-cols-3"
					>
						<Label
							htmlFor="light"
							className="flex flex-col dark:!bg-slate-800 !bg-slate-100  border-slate-200 dark:border-slate-700/50 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:!bg-opacity-90 transition-all ease-in-out dark:hover:!bg-opacity-90 cursor-pointer hover:text-accent-foreground [&:has([data-state=checked])]:border-primary dark:border-slate-700"
						>
							<RadioGroupItem value="light" id="light" className="sr-only" />
							<Sun className="mb-3 h-6 w-6" />
							<div className="text-center space-y-2">
								<p className="font-medium">Light</p>
								<p className="text-xs text-muted-foreground">
									Light mode for bright environments
								</p>
							</div>
						</Label>
						<Label
							htmlFor="dark"
							className="flex flex-col dark:!bg-slate-950 !bg-slate-700  hover:!bg-opacity-90 transition-all ease-in-out dark:hover:!bg-opacity-90 cursor-pointer border-slate-200 dark:border-slate-700/50 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-slate-400"
						>
							<RadioGroupItem value="dark" id="dark" className="sr-only" />
							<Moon className="mb-3 h-6 w-6 text-white" />
							<div className="text-center space-y-2">
								<p className="font-medium text-white">Dark</p>
								<p className="text-xs text-white/60">
									Dark mode for low-light environments
								</p>
							</div>
						</Label>
						<Label
							htmlFor="system"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-tr from-transparent to-slate-900 from-0% to-90% p-4 [&:has([data-state=checked])]:border-slate-800 cursor-pointer hover:opacity-90 border-slate-200 dark:border-slate-700/50"
						>
							<RadioGroupItem value="system" id="system" className="sr-only" />
							<div className="mb-3 flex items-center">
								<Sun className="h-5 w-5" />
								<span className="mx-1 text-xs">/</span>
								<Moon className="h-5 w-5" />
							</div>
							<div className="text-center space-y-2">
								<p className="font-medium">System</p>
								<p className="text-xs text-gray-700 dark:text-white/60">
									Follow your system preferences
								</p>
							</div>
						</Label>
					</RadioGroup>
				</CardContent>
			</Card>
		</div>
	);
}
