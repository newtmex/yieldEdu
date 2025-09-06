"use client";
import React, { useState } from "react";
import { Sparkles, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import Link from "next/link";
const AchievementBanner = () => {
	const [progress] = useState(1);

	return (
		<div className="dark:bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden">
			<div className="absolute bg-white dark:bg-transparent inset-0 dark:bg-gradient-to-r from-lime-400/10 to-yellow-400/10 dark:opacity-20"></div>
			<div className="relative flex flex-col sm:flex-row gap-5 items-center">
				<div className="flex w-full items-center gap-4 justify-center md:justify-start">
					<div className="p-3 bg-lime-500/20 rounded-xl">
						<Book className="w-8 h-8 text-lime-400" />
					</div>
					<div>
						<h2 className="text-md text-foreground font-semibold mb-1">
							Your Learning Progress
						</h2>
						<div className="flex items-center gap-4 w-full">
							<Progress
								value={progress}
								className="w-full md:w-52 lg:w-52 h-4 bg-slate-200 dark:bg-slate-700/50"
							/>
							<span className="text-lime-400 font-medium">{progress}%</span>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-wrap max-w-[450px] flex-row items-center justify-center md:justify-end gap-3">
					<Badge
						variant="outline"
						className="bg-yellow-400/20 w-fit dark:bg-slate-800/50 text-yellow-600 dark:text-yellow-400 border-yellow-400/30 px-3 py-1"
					>
						<Sparkles className="w-4 h-4 mr-1" />
						<p>+10% APY Boost</p>
					</Badge>
					<Button asChild size="sm">
						<Link href="/dashboard/learn">Continue</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AchievementBanner;
