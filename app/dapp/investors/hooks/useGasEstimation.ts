"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { Abi, encodeFunctionData, formatUnits } from "viem";
import { toast } from "sonner";
import { STokenType } from "@/components/invest";
import {
	contractAddresses,
	weduTokenAbi,
	deduTokenAbi,
	stakingAbi,
} from "@/helpers/deployments";

interface UseGasEstimationProps {
	selectedToken: "stakeEDU" | "stakeWEDU" | "stakeDEDU";
	STokenType: STokenType;
	tokenBalance: string | null;
}

export const useGasEstimation = ({
	selectedToken,
	tokenBalance,
	STokenType,
}: UseGasEstimationProps) => {
	const [isEstimating, setIsEstimating] = useState(false);
	const { address } = useAccount();
	const weduTokenAddress = contractAddresses.wedu as `0x${string}`;
	const deduTokenAddress = contractAddresses.dEDUToken as `0x${string}`;
	const stakingAddress = contractAddresses.staking as `0x${string}`;
	const publicClient = getPublicClient(config);

	const generateTokenAddressAndABI = () => {
		switch (selectedToken) {
			case "stakeWEDU":
				return {
					address: weduTokenAddress,
					abi: weduTokenAbi.abi as Abi,
				};

			case "stakeDEDU":
				return {
					address: deduTokenAddress,
					abi: deduTokenAbi.abi as Abi,
				};
			default:
				return null;
		}
	};

	const tokenInfo = generateTokenAddressAndABI();

	const estimateMaxAmount = async (): Promise<string | null> => {
		if (!address || !tokenBalance || !publicClient) {
			toast.error("Missing required data for gas estimation");
			return null;
		}

		setIsEstimating(true);

		try {
			const balance = BigInt(tokenBalance);

			// For native EDU staking, we need to account for gas fees
			if (selectedToken === "stakeEDU") {
				const gasEstimate = await publicClient.estimateGas({
					account: address,
					to: stakingAddress,
					value: balance,
					data: encodeFunctionData({
						abi: stakingAbi.abi,
						functionName: selectedToken,
						args: [STokenType],
					}),
				});

				const gasPrice = await publicClient.getGasPrice();
				const gasFee = gasEstimate * gasPrice;

				// Add 10% buffer for gas price fluctuation
				const gasFeeWithBuffer = gasFee + (gasFee * BigInt(10)) / BigInt(100);

				const maxStake =
					balance > gasFeeWithBuffer ? balance - gasFeeWithBuffer : BigInt(0);

				if (maxStake <= 0) {
					toast.warning("Insufficient EDU to cover gas fees");
					return "0";
				}

				return formatUnits(maxStake, 18);
			} else {
				// For ERC-20 tokens, just check if we have enough EDU for gas fees
				// Don't check allowance - that's handled during the actual staking transaction
				if (!tokenInfo) {
					toast.error("Invalid token selected");
					return null;
				}

				// Check if we have enough native token (EDU) for gas fees
				const nativeBalance = await publicClient.getBalance({ address });

				// Estimate gas for the staking transaction (assuming approval exists)
				// This will give us the gas cost for the actual staking call
				try {
					const gasEstimate = await publicClient.estimateGas({
						account: address,
						to: stakingAddress,
						value: BigInt(0),
						data: encodeFunctionData({
							abi: stakingAbi.abi,
							functionName: selectedToken,
							args: [STokenType, balance],
						}),
					});

					const gasPrice = await publicClient.getGasPrice();
					const gasFee = gasEstimate * gasPrice;

					// Add 10% buffer for gas fees
					const gasFeeWithBuffer = gasFee + (gasFee * BigInt(10)) / BigInt(100);

					if (nativeBalance < gasFeeWithBuffer) {
						toast.warning("Insufficient EDU to cover gas fees");
						return null;
					}

					// For ERC-20 tokens, return the full token balance
					// The user can stake up to their full balance (once approved)
					return formatUnits(balance, 18);
				} catch (gasError) {
					// If gas estimation fails due to allowance, that's expected
					// Just return the full balance and let the user know they need approval
					console.log(
						"Gas estimation failed (likely due to allowance):",
						gasError
					);

					// Estimate gas cost using a mock transaction to get approximate gas needed
					const nativeBalance = await publicClient.getBalance({ address });
					const estimatedGasForApprovalAndStaking = BigInt(150000); // Rough estimate
					const gasPrice = await publicClient.getGasPrice();
					const estimatedGasFee = estimatedGasForApprovalAndStaking * gasPrice;

					if (nativeBalance < estimatedGasFee) {
						toast.warning("May not have enough EDU for gas fees");
					}

					// Return full token balance since that's the max they could stake
					return formatUnits(balance, 18);
				}
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Gas estimation failed:", error);

			// Enhanced error handling
			if (error.message?.includes("insufficient funds")) {
				toast.error("Insufficient funds for this transaction");
			} else if (error.message?.includes("execution reverted")) {
				toast.error("Transaction would fail", {
					description: "Check contract requirements or token approval",
				});
			} else if (
				error.message?.includes("network") ||
				error.message?.includes("internal error")
			) {
				toast.error("Network/RPC error", {
					description: "Please check your connection and try again",
				});
			} else if (
				error.message?.includes("allowance") ||
				error.message?.includes("ERC20InsufficientAllowance")
			) {
				// For ERC-20 tokens, allowance errors are expected when checking max
				// Just return the full balance and inform user about approval
				toast.info("Token approval will be required");
				return tokenBalance ? formatUnits(BigInt(tokenBalance), 18) : null;
			} else {
				toast.error("Gas estimation failed", {
					description: error.message?.slice(0, 100) || "Unknown error",
				});
			}

			return null;
		} finally {
			setIsEstimating(false);
		}
	};

	return {
		estimateMaxAmount,
		isEstimating,
	};
};
