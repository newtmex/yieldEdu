"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useReadContract, useSimulateContract } from "wagmi";
import { Abi, parseEther } from "viem";
import { toast } from "sonner";
import contractAddresses from "@/contract-deployments/deployments.json";
import yldTokenAbi from "@/contract-deployments/abis/YLDToken.json";
import weduTokenAbi from "@/contract-deployments/abis/WEDU.json";
import deduTokenAbi from "@/contract-deployments/abis/MockDEDU.json";
import { getStakingConfig } from "@/lib/wagmi-helpers";
import { STokenType } from "@/components/invest";

export const useStake = ({
	amount,
	address,
	onStakeSuccess,
	STokenType,
	selectedToken,
}: {
	amount: string;
	address: `0x${string}` | undefined;
	onStakeSuccess?: () => void;
	STokenType: STokenType;
	selectedToken: "stakeEDU" | "stakeWEDU" | "stakeDEDU";
}) => {
	const [isApproving, setIsApproving] = useState(false);
	const [isStaking, setIsStaking] = useState(false);
	const stakingAddress = contractAddresses.staking as `0x${string}`;
	const yldTokenAddress = contractAddresses.yldToken as `0x${string}`;
	const weduTokenAddress = contractAddresses.wedu as `0x${string}`;
	const deduTokenAddress = contractAddresses.dEDUToken as `0x${string}`;

	const generateTokenAddressAndABI = () => {
		switch (selectedToken) {
			case "stakeEDU":
				return {
					address: yldTokenAddress,
					abi: yldTokenAbi.abi as Abi,
				};
				break;
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
				return {
					address: yldTokenAddress,
					abi: yldTokenAbi.abi as Abi,
				};
		}
	};

	// Get allowance
	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		abi: generateTokenAddressAndABI().abi,
		address: generateTokenAddressAndABI().address,
		functionName: "allowance",
		args: [address, stakingAddress],
	});

	// Simulate approve
	const {
		data: approveSimulator,
		isError: isApproveError,
		error: approveError,
	} = useSimulateContract({
		abi: generateTokenAddressAndABI().abi,
		address: generateTokenAddressAndABI().address,
		functionName: "approve",
		args: [stakingAddress, parseEther(amount || "0")],
	});

	const { writeContract: approveWrite } = useWriteContract();
	const { writeContract: stakeWrite } = useWriteContract();

	useEffect(() => {
		if (isApproveError && approveError) {
			console.log(approveError.message);
			if (approveError.message.includes("Connector not connected.")) {
				toast.error("Wallet not connected");
				return;
			}
			toast.error("Approval simulation error: " + approveError.message);
		}
	}, [isApproveError, approveError]);

	const handleStake = async () => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		const amountInWei = parseEther(amount);

		const needsApproval =
			!allowance || BigInt(allowance.toString()) < amountInWei;

		try {
			// Approve if needed
			if (needsApproval) {
				if (!approveSimulator?.request) {
					toast.error("Approval simulation failed. Try again.");
					return;
				}

				setIsApproving(true);

				approveWrite(approveSimulator.request, {
					onError(error) {
						setIsApproving(false);
						console.log(error);
						if (error.message.includes("User rejected the request")) {
							toast.error("User rejected the request", {
								description: "transaction has been rejected",
							});
							return;
						}
						toast.error("Approval failed: " + error.message);
					},
					onSuccess: async () => {
						toast.success("Approval successful");
						await refetchAllowance();
						setIsApproving(false);
						// Proceed to staking after approval
						stakeTokens();
					},
				});
			} else {
				// If already approved, stake directly
				stakeTokens();
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.log(error);
			setIsApproving(false);
			toast.error("Something went wrong: " + error?.message);
		}
	};

	const stakeTokens = async () => {
		if (!["stakeEDU", "stakeDEDU", "stakeWEDU"].includes(selectedToken)) {
			console.log("Unknown staking token");
			toast.error("Unknown staking token");
			return;
		}

		console.log(STokenType);

		try {
			setIsStaking(true);
			stakeWrite(
				selectedToken == "stakeEDU"
					? {
							...getStakingConfig("stakeEDU", [STokenType]),
							value: parseEther(amount),
					  }
					: selectedToken === "stakeDEDU"
					? {
							...getStakingConfig("stakeDEDU", [
								STokenType,
								parseEther(amount).toString(),
							]),
					  }
					: selectedToken === "stakeWEDU"
					? {
							...getStakingConfig("stakeWEDU", [
								STokenType,
								parseEther(amount).toString(),
							]),
					  }
					: {
							...getStakingConfig("stakeEDU", [STokenType]),
							value: parseEther(amount),
					  },
				{
					onError(error) {
						console.log(error.message);
						setIsStaking(false);
						if (error.message.includes("User rejected the request")) {
							toast.error("User rejected the request", {
								description: "transaction has been rejected",
							});
							return;
						}
						toast.error("Investment failed: " + error.message);
					},
					onSuccess: async () => {
						setIsStaking(false);
						onStakeSuccess?.();
						refetchAllowance();
					},
				}
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			setIsStaking(false);
			toast.error("Staking error: " + error.message);
		}
	};

	return {
		isApproving,
		isStaking,
		handleStake,
	};
};
