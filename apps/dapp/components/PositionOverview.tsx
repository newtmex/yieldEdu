"use state";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppKitAccount } from "@reown/appkit/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import CountDownTimer from "@/components/CountDownTimer";
import Analytics from "@/components/Analytics";
import { Button } from "./ui/button";
import usePositions from "@/hooks/usePositions";

export interface ActivePosition {
	//string because of BigInt Values
	id: string;
	positionAddress?: string;
	amount: number;
	lockDuration: number;
	startTime: number;
	timeLeft: number;
	expectedYield: number;
	status: "Active" | "Locked";
	transactionHash?: string;
	created_at?: string;
}

const PositionOverview = ({
	positions,
	setShowWithDrawModal,
}: {
	positions: [] | ActivePosition[];
	setShowWithDrawModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { isConnected } = useAppKitAccount();
	const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
	const { userPositions } = usePositions();

	// Update userPosition to use currentPositionIndex
	const userPosition = userPositions[currentPositionIndex];

	const handlePrevPosition = () => {
		setCurrentPositionIndex((prev) =>
			prev > 0 ? prev - 1 : userPositions.length - 1
		);
	};

	const handleNextPosition = () => {
		setCurrentPositionIndex((prev) =>
			prev < userPositions.length - 1 ? prev + 1 : 0
		);
	};

	return (
		<Card className="bg-white flex-1 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
			<Tabs className="flex flex-col h-full" defaultValue="overview">
				<CardHeader>
					<div className="flex gap-2 flex-wrap justify-between items-center">
						<CardTitle>Position overview</CardTitle>
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="analytics">Analytics</TabsTrigger>
						</TabsList>
					</div>
				</CardHeader>
				<CardContent>
					<TabsContent value="overview">
						<div className="space-y-6 h-full">
							<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
								<div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
									<p className="text-sm text-slate-400">Deposited</p>
									<p className="text-md font-bold">
										{userPosition?.amount
											? `${userPosition.amount} FYT`
											: "N/A"}
									</p>
								</div>
								<div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
									<p className="text-sm text-slate-400">Current Yield</p>
									<p className="text-md font-bold">
										{userPosition?.expectedYield
											? `${Number(userPosition.expectedYield).toFixed(8)} FYT`
											: "N/A"}
									</p>
								</div>
								<div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
									<p className="text-sm text-slate-400">Lock Duration</p>
									<p className="text-md font-bold">
										{userPosition?.lockDuration !== undefined
											? `${Math.floor(
													Number(userPosition.lockDuration) / (60 * 60 * 24)
											  )} ${
													Math.floor(
														Number(userPosition.lockDuration) / (60 * 60 * 24)
													) === 1
														? "day"
														: "days"
											  }`
											: "N/A"}
									</p>
								</div>
								<div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
									<p className="text-sm text-slate-400">Time Left</p>
									<p className="text-md font-bold">
										{userPosition?.timeLeft !== undefined
											? `${userPosition.timeLeft} ${
													userPosition.timeLeft === 1 ? "day" : "days"
											  }`
											: "N/A"}
									</p>
								</div>
							</div>

							{userPositions.length > 1 && (
								<div className="flex justify-between items-center gap-4 mt-4">
									<Button
										onClick={handlePrevPosition}
										type="button"
										className={cn(
											"flex px-3 text-sm disabled:bg-gray-400  bg-lime-700 enabled:hover:bg-lime-600 enabled:active:bg-lime-600/90 text-white border-none w-fit rounded-md"
										)}
									>
										Previous Position
									</Button>
									<span className="text-lime-600 text-sm font-semibold dark:text-green-400">
										Position {currentPositionIndex + 1} of{" "}
										{userPositions.length}
									</span>
									<Button
										onClick={handleNextPosition}
										type="button"
										className={cn(
											"flex px-3 text-sm disabled:bg-gray-400  bg-lime-700 enabled:hover:bg-lime-600 enabled:active:bg-lime-600/90 text-white border-none w-fit rounded-md"
										)}
									>
										Next Position
									</Button>
								</div>
							)}

							<Alert className="bg-lime-500/20 border border-lime-500/20">
								<AlertDescription>
									{!isConnected ? (
										"Connect your wallet to see this info"
									) : userPositions.length > 0 ? (
										<>
											<CountDownTimer
												transaction_hash={userPosition?.transactionHash}
												positionId={userPosition.id}
												setShowWithDrawModal={setShowWithDrawModal}
												isConnected={isConnected}
												lockDuration={Number(userPosition?.lockDuration)}
												startTime={Number(userPosition?.startTime)}
											/>
										</>
									) : (
										"You have no active positions. Stake to see this info"
									)}
								</AlertDescription>
							</Alert>
						</div>
					</TabsContent>
					<TabsContent value="analytics">
						<Analytics positions={positions} />
					</TabsContent>
				</CardContent>
			</Tabs>
		</Card>
	);
};

export default PositionOverview;
