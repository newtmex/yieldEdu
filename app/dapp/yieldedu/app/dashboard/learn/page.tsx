import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { yieldEduMetadata } from "@/utils/metadata";

import { Metadata } from "next";

import LearnClientPage from "./LearnClientPage";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Learning Center",
	description: "Learn and earn rewards with YieldEdu",
};

const Page = () => {
	return (
		<>
			<div className="flex justify-between flex-wrap items-center gap-5 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
						Learning Center
					</h1>
					<p className="text-slate-500 dark:text-slate-400">
						Complete lessons to earn rewards and boost your APY
					</p>
				</div>
				{/* <div className="flex flex-wrap items-center gap-3">
					<Badge className="bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-400/30 px-3 py-1">
						<GraduationCap className="w-4 h-4 mr-1" />
						Level 2 Scholar
					</Badge>
					<Badge className="bg-yellow-100 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30 px-3 py-1">
						<Trophy className="w-4 h-4 mr-1" />
						3/10 Lessons Complete
					</Badge>
				</div> */}
			</div>
			{/* Rewards for Learning */}
			{/* <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle className="text-slate-900 dark:text-white">
						Learning Rewards
					</CardTitle>
					<CardDescription className="text-slate-500 dark:text-slate-400">
						Complete lessons to earn these rewards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-gradient-to-br from-lime-50 to-yellow-50 dark:from-lime-500/10 dark:to-yellow-500/10 rounded-xl p-5 border border-lime-200 dark:border-lime-500/30">
							<div className="flex justify-between items-start mb-4">
								<div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
									<Sparkles className="w-5 h-5 text-yellow-500" />
								</div>
								<Badge className="bg-yellow-100 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30">
									Level 1-3
								</Badge>
							</div>
							<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
								APY Boost
							</h3>
							<p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
								Increase your staking APY by completing lessons
							</p>
							<div className="flex items-baseline">
								<span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
									+2.5%
								</span>
								<span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
									APY
								</span>
							</div>
						</div>

						<div className="bg-gradient-to-br from-lime-50 to-yellow-50 dark:from-lime-500/10 dark:to-yellow-500/10 rounded-xl p-5 border border-lime-200 dark:border-lime-500/30">
							<div className="flex justify-between items-start mb-4">
								<div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
									<Lock className="w-5 h-5 text-lime-500" />
								</div>
								<Badge className="bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-400/30">
									Level 4-6
								</Badge>
							</div>
							<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
								Reduced Lock Time
							</h3>
							<p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
								Shorter lock periods with the same rewards
							</p>
							<div className="flex items-baseline">
								<span className="text-2xl font-bold text-lime-600 dark:text-lime-400">
									-20%
								</span>
								<span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
									Lock Duration
								</span>
							</div>
						</div>

						<div className="bg-gradient-to-br from-lime-50 to-yellow-50 dark:from-lime-500/10 dark:to-yellow-500/10 rounded-xl p-5 border border-lime-200 dark:border-lime-500/30">
							<div className="flex justify-between items-start mb-4">
								<div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
									<Trophy className="w-5 h-5 text-yellow-500" />
								</div>
								<Badge className="bg-yellow-100 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30">
									Level 7-10
								</Badge>
							</div>
							<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
								Bonus Tokens
							</h3>
							<p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
								Earn bonus EDU tokens for completing all lessons
							</p>
							<div className="flex items-baseline">
								<span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
									50
								</span>
								<span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
									EDU Tokens
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card> */}

			{/* Learning Progress */}
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle className="text-slate-900 dark:text-white text-2xl">
						Your Learning Journey
					</CardTitle>
					<CardDescription className="text-slate-500 dark:text-slate-400">
						Track your progress and unlock rewards
					</CardDescription>
				</CardHeader>
				<LearnClientPage />
			</Card>
		</>
	);
};

export default Page;
