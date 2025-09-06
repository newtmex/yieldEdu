"use client";
import React from "react";
import { LineChart, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import usePositions from "@/hooks/usePositions";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";

const StakingStats = () => {
	const { userPositions } = usePositions();
	const { address } = useAppKitAccount();
	const { open } = useAppKit();
	const totalUserStakes = userPositions.reduce(
		(prev, acc) => prev + acc.amount,
		0
	);

	return !address ? (
		<div className="text-center py-10">
			<p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
				connect your wallet to view your stats.
			</p>
			<Button
				onClick={() => open({ view: "Connect" })}
				className="bg-gradient-to-r from-lime-500 to-yellow-500 hover:to-yellow-500/60 text-white dark:text-slate-900"
			>
				Connect Wallet
			</Button>
		</div>
	) : (
		<>
			<div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
				<div className="flex justify-between items-center mb-3">
					<span className="text-slate-500 dark:text-slate-400 text-sm">
						Total Staked
					</span>
					{userPositions?.length && (
						<Badge className="bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-400/30">
							{userPositions.length}{" "}
							{userPositions.length > 1 ? "Positions" : "Position"}
						</Badge>
					)}
				</div>
				<div className="text-2xl flex justify-between font-bold text-slate-900 dark:text-white">
					{totalUserStakes} tokens
					<LineChart />
				</div>
			</div>

			<div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
				<div className="text-slate-500 dark:text-slate-400 text-sm mb-3">
					Total Rewards Earned
				</div>
				<div className="text-2xl flex justify-between font-bold text-yellow-600 dark:text-yellow-400">
					0.00
					<Trophy />
				</div>
			</div>

			<div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
				<div className="text-slate-500 dark:text-slate-400 text-sm mb-3">
					Average APY
				</div>
				<div className="text-2xl flex justify-between font-bold text-lime-600 dark:text-lime-400">
					11.8%
					<Sparkles />
				</div>
			</div>
		</>
	);
};

export default StakingStats;
