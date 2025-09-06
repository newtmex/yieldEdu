"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import usePositions from "@/hooks/usePositions";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "./ui/button";

interface IchartData {
	date: string;
	apy?: number;
	rewards?: number;
	tvl?: number | string;
}

const Performance = () => {
	const [chartData, setChartData] = useState<IchartData[]>([
		{ date: "Jan 1", apy: 8.2 },
		{ date: "Jan 2", apy: 8.5 },
		{ date: "Jan 3", apy: 8.3 },
		{ date: "Jan 4", apy: 8.8 },
		{ date: "Jan 5", apy: 9.1 },
		{ date: "Jan 6", apy: 9.3 },
		{ date: "Jan 7", apy: 10.0 },
	]);

	const [activeTab, setActiveTab] = useState<string>("apy");
	const { userPositions } = usePositions();
	const { isConnected } = useAppKitAccount();
	const { open } = useAppKit();

	useEffect(() => {
		if (activeTab === "tvl" && userPositions) {
			const newChartData = userPositions.map((position) => {
				const startTime = new Date(position.startTime * 1000);
				const formattedDate = startTime.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
				return { date: formattedDate, tvl: position.amount };
			});
			// Only update if data actually changed
			setChartData((prev) => {
				const prevString = JSON.stringify(prev);
				const newString = JSON.stringify(newChartData);
				return prevString !== newString ? newChartData : prev;
			});
		} else if (activeTab === "apy") {
			setChartData([
				{ date: "Jan 1", apy: 8.2 },
				{ date: "Jan 2", apy: 8.5 },
				{ date: "Jan 3", apy: 8.3 },
				{ date: "Jan 4", apy: 8.8 },
				{ date: "Jan 5", apy: 9.1 },
				{ date: "Jan 6", apy: 9.3 },
				{ date: "Jan 7", apy: 10.0 },
			]);
		} else if (activeTab === "rewards") {
			setChartData([
				{ date: "Jan 1", rewards: 0 },
				{ date: "Jan 2", rewards: 0 },
				{ date: "Jan 3", rewards: 0 },
				{ date: "Jan 4", rewards: 0 },
				{ date: "Jan 5", rewards: 0 },
				{ date: "Jan 6", rewards: 0 },
				{ date: "Jan 7", rewards: 0 },
			]);
		}
	}, [activeTab]);

	return (
		<Card className="col-span-2 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
			<CardHeader>
				<div className="flex flex-wrap gap-2 justify-between items-start">
					<div>
						<CardTitle className="text-slate-900 dark:text-white">
							Performance
						</CardTitle>
						<CardDescription className="text-slate-500 dark:text-slate-400">
							Your staking performance and rewards
						</CardDescription>
					</div>
					<Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger
								value="apy"
								className="data-[state=active]:bg-lime-500 data-[state=active]:text-white dark:data-[state=active]:text-slate-900"
							>
								APY
							</TabsTrigger>
							<TabsTrigger
								value="rewards"
								className="data-[state=active]:bg-lime-500 data-[state=active]:text-white dark:data-[state=active]:text-slate-900"
							>
								Rewards
							</TabsTrigger>
							<TabsTrigger
								value="tvl"
								className="data-[state=active]:bg-lime-500 data-[state=active]:text-white dark:data-[state=active]:text-slate-900"
							>
								TVL
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-[300px] mt-4 ">
					{!isConnected ? (
						<div className="text-center py-10">
							<p className="text-slate-500 mb-2 dark:text-slate-400">
								Connect your wallet to see your data.
							</p>
							<Button
								onClick={() => open({ view: "Connect" })}
								className="bg-gradient-to-r from-lime-500 to-yellow-500 hover:to-yellow-500/60 text-white dark:text-slate-900"
							>
								Connect Wallet
							</Button>
						</div>
					) : chartData.length === 0 ? (
						<p className="text-slate-500 text-xl p-5 dark:text-slate-400">
							No data available.
						</p>
					) : (
						<ResponsiveContainer
							width="100%"
							height="100%"
							initialDimension={{ height: 100, width: 100 }}
						>
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#84cc16" stopOpacity={0.3} />
										<stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
								<YAxis
									stroke="#94a3b8"
									fontSize={12}
									tickFormatter={(value) => `${value}%`}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#ffffff",
										border: "1px solid #e2e8f0",
										borderRadius: "0.5rem",
										color: "#1e293b",
									}}
									labelStyle={{ color: "#64748b" }}
								/>
								<Area
									type="monotone"
									dataKey={activeTab}
									stroke="#84cc16"
									fill="url(#areaGradient)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default Performance;
