"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Timer } from "lucide-react";
import { ClassValue } from "clsx";

export const ExploreTransactionButton = ({
	transaction_hash,
	className,
}: {
	transaction_hash: string;
	className?: ClassValue;
}) => {
	const blockScout = process.env.NEXT_PUBLIC_EDU_BLOCKSCOUT_URL;
	return (
		<a
			href={`${blockScout}/${transaction_hash}`}
			target="_blank"
			rel="noreferrer"
			className={cn(
				"flex items-center gap-2 ml-7 text-slate-700 underline dark:text-slate-300 hover:text-yellow-900 dark:hover:text-yellow-500 transition-colors duration-200",
				className
			)}
		>
			<ExternalLink className="size-5" />
			<span className="font-medium">Explore Transaction</span>
		</a>
	);
};

const CountDownTimer = ({
	startTime,
	lockDuration,
	isConnected,
	setShowWithDrawModal,
	positionId,
	transaction_hash,
}: {
	startTime: number;
	lockDuration: number;
	isConnected: boolean;
	positionId: string;
	transaction_hash?: string;
	setShowWithDrawModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [timeLeft, setTimeLeft] = useState<number>(() => {
		const currentTime = Math.floor(Date.now() / 1000);
		const startTimeInSeconds = Math.floor(startTime);
		const unlockTime = startTimeInSeconds + lockDuration;
		return Math.max(unlockTime - currentTime, 0);
	});
	const searchParams = useSearchParams();

	useEffect(() => {
		const calculateTimeLeft = () => {
			if (
				!startTime ||
				!lockDuration ||
				isNaN(startTime) ||
				isNaN(lockDuration)
			) {
				setTimeLeft(0);
				return;
			}

			const currentTime = Math.floor(Date.now() / 1000);
			const startTimeInSeconds = Math.floor(startTime);
			const unlockTime = startTimeInSeconds + lockDuration;
			const remainingTime = Math.max(unlockTime - currentTime, 0);
			setTimeLeft(remainingTime);
		};

		calculateTimeLeft();
		const interval = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, [startTime, lockDuration, timeLeft]);

	const formatNumber = (n: number): string => n.toString().padStart(2, "0");

	const handleWithdrawClick = () => {
		const params = new URLSearchParams(searchParams?.toString());
		params.set("positionId", positionId);
		window.history.pushState({}, "", `?${params.toString()}`);
		setShowWithDrawModal(true);
	};

	const formatTimeLeft = () => {
		if (timeLeft <= 0) {
			return (
				<div className="flex items-center text-lime-600 gap-3">
					<Timer className="w-5 h-5" />
					<p className="text-lime-600 font-medium text-sm">
						Your position is available for withdrawal
					</p>
					<Button
						onClick={handleWithdrawClick}
						type="button"
						variant={"default"}
						className="w-fit bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-800 font-semibold hover:opacity-90"
					>
						Withdraw
					</Button>
					{transaction_hash && (
						<ExploreTransactionButton transaction_hash={transaction_hash} />
					)}
				</div>
			);
		}

		const days = Math.floor(timeLeft / (24 * 60 * 60));
		const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
		const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
		const seconds = timeLeft % 60;

		if (days > 0) {
			return (
				<>
					<span className="text-sm text-center w-full">
						Your position will be available for withdrawal in{" "}
					</span>
					<span className="dark:text-yellow-400 text-center w-full text-slate-800 font-semibold text-md">
						{days}d {formatNumber(hours)}h {formatNumber(minutes)}m{" "}
						{formatNumber(seconds)}s
					</span>
				</>
			);
		}
		if (hours > 0) {
			return (
				<span>
					Your position will be available for withdrawal in{" "}
					<span className="dark:text-yellow-400 text-lg text-slate-800 font-semibold">
						{hours}h {formatNumber(minutes)}m {formatNumber(seconds)}s
					</span>
				</span>
			);
		}
		if (minutes > 0) {
			return (
				<span>
					Your position will be available for withdrawal in{" "}
					<span className="dark:text-yellow-400 text-lg text-slate-800 font-semibold">
						{minutes}m {formatNumber(seconds)}s
					</span>
				</span>
			);
		}
		return (
			<span>
				Your position will be available for withdrawal in{" "}
				<span className="dark:text-yellow-400 text-lg text-slate-800 font-semibold">
					{formatNumber(seconds)}s
				</span>
			</span>
		);
	};

	return (
		<p
			className={cn(
				"font-normal text-md flex items-center flex-wrap justify-between text-center dark:text-white text-lime-700"
			)}
		>
			{!isConnected ? "Connect your wallet!" : formatTimeLeft()}
			{transaction_hash && (
				<ExploreTransactionButton transaction_hash={transaction_hash} />
			)}
		</p>
	);
};

export default CountDownTimer;
