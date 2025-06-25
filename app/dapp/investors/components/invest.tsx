"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ClassValue } from "clsx";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { IconCircleDottedLetterE } from "@tabler/icons-react";
import { useStake } from "@/hooks/useStake";
import { toast } from "sonner";
import { useAccount, useBalance } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import contractAddresses from "@/mainnet-deployments/deployments.json";
import { formatUnits } from "viem";
import WithdrawModal from "./Modal";
import { useQueryClient } from "@tanstack/react-query";

export enum STokenType {
	LEARNER,
	INVESTOR,
}

const InvestmentCard = ({
	children,
	refetchAll,
	setShowWithDrawModal,
	showWithdrawModal,
}: {
	className?: ClassValue;
	children?: React.ReactNode;
	refetchAll?: () => void;
	setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
	showWithdrawModal: boolean;
}) => {
	const [amount, setAmount] = useState("");
	const [selectedToken, setSelectedToken] = useState<
		"stakeEDU" | "stakeWEDU" | "stakeDEDU"
	>("stakeEDU");

	const { address } = useAccount();
	const eduTokenAddress = contractAddresses.yldToken as `0x${string}`;
	const deduTokenAddress = contractAddresses.dEDUToken as `0x${string}`;
	const weduTokenAddress = contractAddresses.wedu as `0x${string}`;
	const queryClient = useQueryClient();
	const {
		data: tokenBalance,
		refetch: refetchTokenBalance,
		isPending: isTokenBalanceLoading,
		isError: isTokenError,
		error: tokenBalanceError,
	} = useBalance({
		address: address as unknown as `0x${string}`,
		token:
			selectedToken == "stakeEDU"
				? eduTokenAddress
				: selectedToken === "stakeDEDU"
				? deduTokenAddress
				: weduTokenAddress,
		query: {
			enabled: !!address,
			select: (data) => ({
				value: data.value.toString(),
				decimals: data.decimals,
			}),
			refetchInterval: 5 * 60 * 1000,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	});

	const waitForStake = async (prevCount: number) => {
		let attempts = 0;

		while (attempts < 10) {
			await queryClient.invalidateQueries({ queryKey: ["active-investments"] });

			const updated =
				(queryClient.getQueryData(["active-investments"]) as []) || [];
			if (updated.length > prevCount) break;

			await new Promise((res) => setTimeout(res, 1000));
			attempts++;
		}
	};

	const { isApproving, isStaking, handleStake } = useStake({
		amount,
		address,
		STokenType: STokenType.INVESTOR,
		selectedToken,
		onStakeSuccess: async () => {
			setAmount("");
			const prevInvestments =
				(queryClient.getQueryData(["active-investments"]) as []) || [];
			const prevCount = prevInvestments.length;

			toast.success("Transaction submitted!", {
				description: "Waiting for confirmation...",
			});

			await waitForStake(prevCount); // Wait until data appears in DB

			refetchTokenBalance();
			refetchAll?.();
		},
	});

	// Validate input
	const validateInput = () => {
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			toast.error("Invalid amount", {
				description: "Please enter a valid amount greater than 0",
			});
			return false;
		}

		return true;
	};

	useEffect(() => {
		if (isTokenError && tokenBalanceError) {
			console.log(tokenBalanceError);
		}
	}, [isTokenError, tokenBalanceError]);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validateInput()) return;
		handleStake();
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex text-lg items-center gap-2 dark:text-white">
						<IconCircleDottedLetterE size={28} className="text-lime-500" />
						Invest In Education
					</CardTitle>
					<CardDescription>
						Invest in education and earn returns while supporting a smarter
						future. Your investment powers learning and rewards your impact.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="w-full">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
								Amount
							</label>
							<div className="flex gap-2">
								<Input
									disabled={isApproving || isStaking}
									type="number"
									min={0}
									step="any"
									required
									placeholder="Enter EDU amount"
									value={amount}
									onChange={(e) => {
										const value = e.target.value;
										// Only allow empty string or positive numbers (including decimals)
										if (
											value === "" ||
											(/^\d*\.?\d*$/.test(value) && Number(value) >= 0)
										) {
											setAmount(value);
										}
									}}
									className="focus:!ring-lime-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700"
								/>
								<Button
									type="button"
									variant="outline"
									className="px-3 py-1 text-xs"
									disabled={isApproving || isStaking || !tokenBalance?.value}
									onClick={() => {
										if (tokenBalance?.value) {
											const formatted = parseFloat(
												formatUnits(BigInt(tokenBalance.value), 18)
											).toString();
											setAmount(formatted);
										}
									}}
								>
									Max
								</Button>
							</div>
						</div>
						<div className="w-full">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
								Token
							</label>
							<Select
								value={selectedToken}
								onValueChange={(value) => {
									setSelectedToken(value as typeof selectedToken);
									refetchTokenBalance();
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a token" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Supported Tokens </SelectLabel>
										<SelectItem value="stakeEDU">EDU</SelectItem>
										<SelectItem value="stakeWEDU">
											WEDU (wrapped EDU)
										</SelectItem>
										<SelectItem value="stakeDEDU">dEDU</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>

							{isTokenBalanceLoading ? (
								<Skeleton className="mt-2 h-[14px] bg-gray-500/20 w-24" />
							) : (
								<p className="text-xs pt-1 text-muted-foreground">
									Balance:{" "}
									<span className="text-lime-400 font-medium">
										{tokenBalance?.value
											? parseFloat(
													formatUnits(BigInt(tokenBalance?.value), 18)
											  ).toFixed(4)
											: "0.0000"}{" "}
										{selectedToken === "stakeEDU"
											? "EDU"
											: selectedToken === "stakeWEDU"
											? "WEDU"
											: selectedToken === "stakeDEDU"
											? "DEDU"
											: "EDU"}
									</span>
								</p>
							)}
						</div>

						<Button
							type="submit"
							disabled={isApproving || isStaking}
							className="disabled:bg-green-700 mt-5 text-xs text-white hover:text-white bg-green-500 hover:bg-green-600 border-none font-semibold enabled:active:bg-green-600 w-full"
						>
							<>
								{(isApproving || isStaking) && (
									<div className="size-4 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
								)}

								{isApproving
									? "Waiting for approval..."
									: isStaking
									? "Waiting for Investment confirmation..."
									: "Invest In A Scholarship"}
							</>
						</Button>
						{children}
					</form>
				</CardContent>
			</Card>
			<WithdrawModal
				setShowWithDrawModal={setShowWithDrawModal}
				showWithdrawModal={showWithdrawModal}
			/>
		</>
	);
};

export default InvestmentCard;
