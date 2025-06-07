import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { yieldEduMetadata } from "@/utils/metadata";
import { BarChart2, Lock, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Protocol stats",
	description:
		"Explore key metrics and performance indicators of the YieldEdu protocol, including Total Value Locked, Active Stakers, and Average APY.",
};

function StatsCard({
	title,
	value,
	change,
	icon,
}: {
	title: string;
	value: string;
	change: string;
	icon: React.ReactNode;
}) {
	const isPositive = change.startsWith("+");
	return (
		<div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
			<div className="flex justify-between items-start mb-2">
				<span className="text-slate-500 dark:text-slate-400 text-sm">
					{title}
				</span>
				<div className="p-2 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
					{icon}
				</div>
			</div>
			<div className="flex items-baseline gap-2">
				<span className="text-xl font-semibold text-slate-900 dark:text-white">
					{value}
				</span>
				<span
					className={`text-sm ${
						isPositive
							? "text-lime-600 dark:text-lime-400"
							: "text-red-500 dark:text-red-400"
					}`}
				>
					{change}
				</span>
			</div>
		</div>
	);
}

const page = () => {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
						Protocol Statistics
					</h1>
					<p className="text-slate-500 dark:text-slate-400">
						Overview of YieldEdu protocol metrics
					</p>
				</div>
			</div>

			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle className="text-slate-900 dark:text-white">
						Protocol Overview
					</CardTitle>
					<CardDescription className="text-slate-500 dark:text-slate-400">
						Key metrics and performance indicators
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<StatsCard
							title="Total Value Locked"
							value="$12.5M"
							change="+15.3%"
							icon={<Lock className="w-4 h-4" />}
						/>
						<StatsCard
							title="Active Stakers"
							value="4,321"
							change="+8.7%"
							icon={<Users className="w-4 h-4" />}
						/>
						<StatsCard
							title="Average APY"
							value="14.2%"
							change="+1.5%"
							icon={<BarChart2 className="w-4 h-4" />}
						/>
					</div>

					<div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
						<p className="text-slate-500 dark:text-slate-400">
							Protocol statistics charts will appear here
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default page;
