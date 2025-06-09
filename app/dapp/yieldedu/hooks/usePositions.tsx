"use client";

import { ActivePosition } from "@/components/PositionOverview";
import { getYieldPoolConfig } from "@/lib/utils";
import { getTransactions } from "@/utils/supabase/helpers";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";

const usePositions = () => {
	const [positions, setPositions] = useState<ActivePosition[] | []>([]);
	const { address } = useAppKitAccount();

	const calculateYield = (amount: number, duration: number) => {
		const YIELD_RATE = 10;
		const YEAR = 365 * 24 * 60 * 60; // 365 days in seconds

		if (!amount || !duration) return "0";

		const amountBigInt = BigInt(amount);
		//tis is how I calculate yield in my contract
		const yieldAmount =
			(amountBigInt * BigInt(duration) * BigInt(YIELD_RATE)) /
			(BigInt(YEAR) * BigInt(100));

		return formatEther(yieldAmount);
	};

	const { data: activePositionsData }: { data: ActivePosition[] | undefined } =
		useReadContract({
			...getYieldPoolConfig("getActivePositions", []),
		});

	const { data: transactionsData } = useQuery({
		queryKey: ["transactions"],
		queryFn: async () => {
			const { data, error } = await getTransactions();
			if (error) {
				console.error("Error fetching transactions:", error);
				return [];
			}

			return data || [];
		},
	});

	const userPositions = positions.filter(
		(position) =>
			position.positionAddress?.toLowerCase() === address?.toLowerCase()
	);

	useEffect(() => {
		if (activePositionsData) {
			const stakers = activePositionsData.map(
				(positionData: ActivePosition): ActivePosition => {
					const startTimeInSeconds = Number(positionData.startTime);
					const lockDurationInSeconds = Number(positionData.lockDuration);
					const currentTime = Math.floor(Date.now() / 1000);
					const timeLeft = Math.max(
						startTimeInSeconds + lockDurationInSeconds - currentTime,
						0
					);

					// Find matching transaction for this position
					const matchingTransaction = transactionsData?.find((transaction) => {
						// Convert blockchain timestamp to seconds
						const positionStartTime = Number(positionData.startTime);
						// Convert transaction created_at to seconds
						const transactionTime = Math.floor(
							new Date(transaction.created_at).getTime() / 1000
						);

						// More strict matching criteria
						const isMatch =
							// Check address match
							transaction.owner.toLowerCase() ===
								positionData.positionAddress?.toLowerCase() &&
							// Check amount match
							Number(positionData.amount) === Number(transaction.amount) &&
							// Check lock duration match
							(!transaction.lock_duration ||
								Number(transaction.lock_duration) ===
									Number(positionData.lockDuration)) &&
							// Reduce time window to 30 seconds and ensure transaction is not already used
							Math.abs(positionStartTime - transactionTime) < 30 &&
							!transaction.used;

						// Mark transaction as used if it matches
						if (isMatch) {
							transaction.used = true;
						}

						return isMatch;
					});

					return {
						id: positionData.id,
						positionAddress: positionData.positionAddress,
						amount: Number(formatEther(BigInt(positionData?.amount))),
						lockDuration: lockDurationInSeconds,
						startTime: startTimeInSeconds,
						timeLeft: Math.ceil(timeLeft / (24 * 60 * 60)), // Convert to days for display
						expectedYield: parseFloat(
							calculateYield(positionData.amount, lockDurationInSeconds)
						),
						status: timeLeft > 0 ? "Locked" : "Active",
						transactionHash: matchingTransaction?.transaction_hash,
					};
				}
			);

			if (stakers) {
				setPositions(stakers);
			}
		}
	}, [activePositionsData, setPositions, transactionsData]);

	return { positions, setPositions, userPositions };
};

export default usePositions;
