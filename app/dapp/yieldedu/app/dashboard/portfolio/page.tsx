import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { yieldEduMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Portfolio",
	description:
		"View and track your portfolio performance and asset allocations with YieldEdu.",
};

const page = () => {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
						Your Portfolio
					</h1>
					<p className="text-slate-500 dark:text-slate-400">
						Track your assets and performance
					</p>
				</div>
			</div>

			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle className="text-slate-900 dark:text-white">
						Asset Overview
					</CardTitle>
					<CardDescription className="text-slate-500 dark:text-slate-400">
						Your current holdings and allocations
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
						<p className="text-slate-500 dark:text-slate-400">
							Portfolio data will appear here after connecting your wallet
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default page;
