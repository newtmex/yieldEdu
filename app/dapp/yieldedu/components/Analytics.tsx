"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useAppKitAccount } from "@reown/appkit/react";
import { ActivePosition } from "./PositionOverview";

interface AnalyticsProps {
	positions: ActivePosition[];
}

const chartConfig = {
	amount: {
		label: "Amount Staked",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

const Analytics = ({ positions }: AnalyticsProps) => {
	const [activeChart] = React.useState<keyof typeof chartConfig>("amount");
	const { address } = useAppKitAccount();

	const chartData = positions.map((position) => ({
		date: new Date(Number(position.startTime) * 1000).toISOString(),
		amount: position.amount,
		isUser: position.positionAddress?.toLowerCase() === address?.toLowerCase(),
		fill: position.positionAddress === address ? "#22c55e" : "#0E76FD",
	}));

	if (!positions || positions.length === 0) {
		return (
			<Card className="bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
				<CardContent className="px-2 sm:p-6 flex items-center justify-center h-[200px]">
					<p className="text-slate-400">No data available</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-slate-100 dark:bg-slate-900/50 border-none">
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[300px] w-full"
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} strokeOpacity={0.2} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => {
								const date = new Date(value);
								return date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								});
							}}
							fontSize={12}
							fill="#ffffff"
							fillRule="evenodd"
							stroke="#ffffff"
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[150px] bg-slate-200 dark:bg-slate-800/95 border-zinc-800 dark:text-white text-slate-900"
									nameKey="amount"
									labelFormatter={(value) => {
										const date = new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										});
										const dataPoint = chartData.find((d) => d.date === value);
										return `Date: ${date}${dataPoint?.isUser ? " (You)" : ""}`;
									}}
								/>
							}
							formatter={(value) => "Value: " + Number(value)}
						/>
						<Bar dataKey={activeChart} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};

export default Analytics;
