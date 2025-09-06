import Performance from "@/components/Performance";
import StakingCard from "@/components/StakingCard";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { yieldEduMetadata } from "@/utils/metadata";
import { Book, GraduationCap } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import StakingStats from "./StakingStats";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Stake tokens",
	description:
		"Stake your EDU tokens to earn rewards, track your staking stats, and boost your APY by completing lessons.",
};

const Page = () => {
	return (
		<div className="container space-y-6 mx-auto">
			<div className="flex justify-between flex-wrap gap-2 items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
						Stake Your EDU
					</h1>
					<p className="text-slate-500 dark:text-slate-400">
						Earn rewards by staking your EDU tokens
					</p>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				<StakingCard className="col-span-2 flex-1">
					<div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
						<div className="flex justify-between mb-2">
							<span className="text-slate-700 dark:text-slate-300 font-medium">
								Estimated Rewards
							</span>
							<span className="text-yellow-600 dark:text-yellow-400 font-medium">
								+168.75 EDU
							</span>
						</div>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Based on current APY and selected lock period
						</p>
					</div>
				</StakingCard>

				<div>
					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
						<CardHeader>
							<CardTitle className="text-slate-900 dark:text-white">
								Staking Stats
							</CardTitle>
							<CardDescription className="text-slate-500 dark:text-slate-400">
								Your current staking metrics
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<StakingStats />

							<div className="bg-gradient-to-r from-lime-100 to-yellow-100 dark:from-lime-500/20 dark:to-yellow-500/20 rounded-xl p-4 border border-lime-200 dark:border-lime-500/30">
								<div className="flex items-center gap-2 mb-2">
									<GraduationCap className="w-5 h-5 text-lime-600 dark:text-lime-400" />
									<span className="text-slate-700 dark:text-slate-200 font-medium">
										Learning Boost
									</span>
								</div>
								<p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
									Complete more lessons to increase your APY
								</p>
								<Link href={"/dashboard/learn"}>
									<Button variant="secondary" className="w-full">
										<Book className="w-4 h-4 mr-2" />
										Go to Learning Center
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<Performance />
		</div>
	);
};

export default Page;
