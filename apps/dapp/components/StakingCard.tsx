"use client";

import React, { useEffect, useRef, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
	cn,
	getYieldPoolConfig,
	getYieldTokenConfig,
	YieldPoolAddress,
	YieldTokenAddress,
} from "@/lib/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { toast } from "@/hooks/use-toast";
import {
	useBalance,
	useReadContract,
	useSimulateContract,
	useWriteContract,
} from "wagmi";
import Modal from "./Modal";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { storeTransaction } from "@/utils/supabase/helpers";
import { ClassValue } from "clsx";

const StakingCard = ({
	className,
	children,
}: {
	className?: ClassValue;
	children?: React.ReactNode;
}) => {
	const [amount, setAmount] = useState("");
	const [lockDuration, setLockDuration] = useState(30);
	const [lockDurationCustom, setLockDurationCustom] = useState(0);
	const [showCustomInput, setShowCustomInput] = useState(false);
	const [customInputActive, setCustomInputActive] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const { isConnected, address } = useAppKitAccount();
	const durationInSeconds =
		Number(customInputActive ? lockDurationCustom : lockDuration) *
		24 *
		60 *
		60;
	const customInputRef = useRef<HTMLInputElement | null>(null);
	const buttonGridRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();
	const { open } = useAppKit();
	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		...getYieldTokenConfig("allowance", [address, YieldPoolAddress]),
	});

	// Approve hook
	const { writeContract: approve, isPending: isApprovePending } =
		useWriteContract();

	// Simulate approve
	const {
		data: approveSimulator,
		isError: isApproveError,
		error: approveError,
	} = useSimulateContract({
		...getYieldTokenConfig("approve", [
			YieldPoolAddress,
			parseEther(amount || "0"),
		]),
	});

	useEffect(() => {
		if (isApproveError) {
			console.error("Approval simulation error:", approveError);
		}
	}, [isApproveError, approveError]);

	const { writeContract: deposit, isPending: isDepositPending } =
		useWriteContract();

	const results = useBalance({
		address: address as unknown as `0x${string}`,
		token: YieldTokenAddress,
	});

	// Validate input
	const validateInput = () => {
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			toast({
				variant: "destructive",
				title: "Invalid amount",
				description: "Please enter a valid amount greater than 0",
			});
			return false;
		}

		if (
			!durationInSeconds ||
			isNaN(Number(durationInSeconds)) ||
			Number(durationInSeconds) < 1
		) {
			toast({
				variant: "destructive",
				title: "Invalid duration",
				description: "Please enter a valid duration in days",
			});
			return false;
		}

		const hasBalance = results?.data?.formatted
			? Number(results?.data?.formatted) > 0
			: false;
		if (!hasBalance && isConnected) {
			setShowModal(true);
			return false;
		}

		return true;
	};

	const handleStake = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isConnected) {
			open();
			return;
		}

		if (!validateInput()) {
			return;
		}
		const balance = results?.data?.formatted;
		if (Number(balance) < Number(amount)) {
			toast({
				variant: "destructive",
				title: "Transaction Rejected",
				description: "You don't have enough FYT tokens for the transaction",
			});
			return;
		}

		try {
			const amountInWei = parseEther(amount);

			// Check if we need approval
			if (!allowance || Number(allowance) < Number(amountInWei)) {
				if (approveSimulator?.request) {
					approve(approveSimulator.request, {
						onError(error) {
							console.log(error);
							toast({
								variant: "destructive",
								title: "Transaction Rejected",
								description: "You rejected the transaction",
							});
							return;
						},
						onSuccess: () => {
							toast({
								title: "Transaction Successful",
								description: "Transaction Approved",
							});
							// After approval succeeds, proceed with deposit
							// console.log("success open deposit");
							deposit(
								{
									...getYieldPoolConfig("deposit", [
										parseEther(amount),
										durationInSeconds,
									]),
								},
								{
									async onSuccess(data) {
										await queryClient.invalidateQueries();

										try {
											// Store transaction with the new position ID if found
											const { error } = await storeTransaction({
												transaction_hash: data,
												owner: address!,
												amount: Number(parseEther(amount)),
											});

											if (error) {
												console.error("Database error:", error);
												toast({
													variant: "destructive",
													title: "Database Error",
													description: "Failed to store transaction",
												});
											}
										} catch (err) {
											console.error("Error storing transaction:", err);
										}

										toast({
											title: "Deposit Successful",
											description: "Transaction Successful",
										});
										setAmount("");
										await queryClient.refetchQueries({
											queryKey: ["transactions"],
										});
									},
									onError(error) {
										console.log(error);
										if (error.message.includes("User rejected the request")) {
											toast({
												variant: "destructive",
												title: "Transaction Rejected",
												description: "You rejected the transaction",
											});
										}
									},
								}
							);
						},
					});
				}
				refetchAllowance();
			} else {
				// If already approved deposit
				deposit(
					{
						...getYieldPoolConfig("deposit", [
							parseEther(amount),
							durationInSeconds,
						]),
					},
					{
						async onSuccess(data) {
							await queryClient.invalidateQueries();

							try {
								// Store transaction with the new position ID if found
								const { error } = await storeTransaction({
									transaction_hash: data,
									owner: address!,
									amount: Number(parseEther(amount)),
								});

								if (error) {
									console.error("Database error:", error);
									toast({
										variant: "destructive",
										title: "Database Error",
										description: "Failed to store transaction",
									});
								}
							} catch (err) {
								console.error("Error storing transaction:", err);
							}

							toast({
								title: "Deposit Successful",
								description: "Transaction Successful",
							});

							// Explicitly invalidate the transactions query
							await queryClient.invalidateQueries({
								queryKey: ["transactions"],
							});
							setAmount("");
						},
						onError(error) {
							console.log(error);
							if (error.message.includes("User rejected the request")) {
								toast({
									variant: "destructive",
									title: "Transaction Rejected",
									description: "You rejected the transaction",
								});
							}
						},
					}
				);
			}
		} catch (error) {
			console.error("Transaction failed:", error);
			toast({
				variant: "destructive",
				title: "Transaction failed",
				description:
					error instanceof Error ? error.message : "Unknown error occurred",
			});
		}
	};

	useEffect(() => {
		if (showCustomInput) customInputRef.current?.focus();
	}, [showCustomInput]);

	useEffect(() => {
		const customInput = customInputRef.current;

		const handleFocus = () => (setCustomInputActive(true), setLockDuration(1));
		const handleBlur = (e: FocusEvent) => {
			const clickedElement = e.relatedTarget as Node;
			const isClickInsideGrid = buttonGridRef.current?.contains(clickedElement);
			if (!isClickInsideGrid) return;

			if (lockDuration) {
				setCustomInputActive(false);
			}
		};

		customInput?.addEventListener("focus", handleFocus);
		customInput?.addEventListener("blur", handleBlur);

		return () => {
			customInput?.removeEventListener("focus", handleFocus);
			customInput?.removeEventListener("blur", handleBlur);
		};
	}, [customInputActive, lockDuration, showCustomInput]);

	const isTransactionInProgress = isApprovePending || isDepositPending;

	return (
		<>
			<Card
				className={cn(
					className,
					"pb-0 xl:mb-0 dark:bg-slate-800/50 bg-white border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm"
				)}
			>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 dark:text-white">
						<GraduationCap className="size-7 text-lime-500" />
						Stake EDU
					</CardTitle>
					<CardDescription className="text-slate-500 dark:text-slate-400">
						Stake your EDU tokens to earn rewards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleStake} className="space-y-4">
						<div>
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
								Amount
							</label>
							<Input
								disabled={isTransactionInProgress}
								type="text"
								required
								placeholder="Enter EDU amount"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
								Lock Duration
							</label>
							<div
								ref={buttonGridRef}
								className="flex flex-wrap justify-between xl:grid-cols-2 2xl:grid-cols-4 gap-2"
							>
								{["30", "60", "90"].map((days) => (
									<Button
										type="button"
										disabled={isTransactionInProgress}
										key={days}
										variant="outline"
										className={cn(
											"flex-1 border-slate-200 dark:border-slate-700",
											{
												"bg-gradient-to-r from-lime-500 hover:text-slate-900 to-yellow-500 text-slate-900 border-transparent":
													lockDuration === parseFloat(days),
												"bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800":
													lockDuration !== parseFloat(days),
											}
										)}
										onClick={() => (
											setLockDuration(parseFloat(days)),
											setShowCustomInput(lockDurationCustom ? true : false),
											setCustomInputActive(false)
										)}
									>
										{days} Days
									</Button>
								))}
								{!showCustomInput ? (
									<Button
										variant="outline"
										className={cn(
											"bg-white border-slate-200 dark:border-slate-700  dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
										)}
										onClick={() => (
											setLockDuration(1),
											setShowCustomInput(true),
											setLockDurationCustom(1),
											setCustomInputActive(true)
										)}
									>
										Custom
									</Button>
								) : (
									<Input
										disabled={isTransactionInProgress}
										ref={customInputRef}
										type="number"
										min={1}
										max={365}
										maxLength={3}
										placeholder="Custom"
										value={lockDurationCustom}
										onChange={(e) =>
											setLockDurationCustom(parseFloat(e.target.value))
										}
										className={cn(
											"bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent dark:caret-white hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700",
											{
												"bg-gradient-to-tr !text-slate-900 from-lime-500 to-yellow-500":
													lockDurationCustom && customInputActive,

												"bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800":
													!lockDurationCustom,
											}
										)}
									/>
								)}
							</div>
						</div>
						<div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-slate-500 dark:text-slate-400">
									Duration
								</span>
								<span className="text-slate-900 dark:text-slate-100">
									{customInputActive ? lockDurationCustom : lockDuration}{" "}
									{lockDurationCustom > 1 || lockDuration > 1 ? "days" : "day"}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-slate-500 dark:text-slate-400">
									Base APY
								</span>
								<span className="text-lime-600 dark:text-lime-400">10.0%</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-slate-500 dark:text-slate-400">
									Bonus APY
								</span>
								<span className="text-lime-600 dark:text-lime-400">+2.5%</span>
							</div>
							<div className="border-t border-slate-200 dark:border-slate-700/50 pt-2 mt-2">
								<div className="flex justify-between font-medium">
									<span className="text-slate-700 dark:text-slate-300">
										Total APY
									</span>
									<span className="text-yellow-600 dark:text-yellow-400">
										12.5%
									</span>
								</div>
							</div>
						</div>
						<Button
							type="submit"
							disabled={isTransactionInProgress}
							className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-800 font-semibold hover:opacity-90"
						>
							{isTransactionInProgress ? (
								<>
									<div className="size-6 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-green-950" />
									{isApprovePending
										? "Waiting for Approval..."
										: isDepositPending
										? "Waiting For Deposit Approval..."
										: "Checking..."}
								</>
							) : (
								"Stake Now"
							)}
						</Button>
						{children}
					</form>
				</CardContent>
			</Card>
			<Modal setShowModal={setShowModal} showModal={showModal} />
		</>
	);
};

export default StakingCard;
