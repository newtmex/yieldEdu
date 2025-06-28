"use client";

import { useEffect, useState } from "react";
import {
	useWriteContract,
	useReadContract,
	useSimulateContract,
	useBalance,
} from "wagmi";
import { Abi, parseEther } from "viem";
import { toast } from "sonner";
import {
	contractAddresses,
	yieldTokenAbi,
	weduTokenAbi,
	deduTokenAbi,
} from "@/helpers/deployments";

import { getStakingConfig } from "@/lib/wagmi-helpers";
import { STokenType } from "@/components/invest";

export const extractRevertReason = (message: string) => {
	const match = message.match(/reverted with reason string ['"](.+?)['"]/);
	return match ? match[1] : "Transaction reverted.";
};

export const handleTxError = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any,
	fallbackMsg = "Something went wrong"
) => {
	const msg = error?.message || "";

	if (msg.includes("User rejected")) {
		toast.error("Transaction rejected", {
			description: "You rejected the transaction.",
		});
	} else if (msg.toLowerCase().includes("insufficient funds")) {
		toast.error("Insufficient funds", {
			description: "You don't have enough ETH for gas.",
		});
	} else if (msg.toLowerCase().includes("execution reverted")) {
		toast.error("Transaction failed", {
			description: extractRevertReason(msg),
		});
	} else if (msg.toLowerCase().includes("chain not supported")) {
		toast.error("Wrong network", {
			description: "Please switch to the supported network.",
		});
	} else {
		toast.error(fallbackMsg, {
			description: "something went wrong",
		});
	}
};
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
					abi: yieldTokenAbi.abi as Abi,
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
					abi: yieldTokenAbi.abi as Abi,
				};
		}
	};

	// Get allowance
	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		abi: generateTokenAddressAndABI().abi,
		address: generateTokenAddressAndABI().address,
		functionName: "allowance",
		args: [address, stakingAddress],
		query: {
			select: (data) => (data as bigint).toString(),
		},
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
		args: [stakingAddress, parseEther(amount || "0").toString()],
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
		}
	}, [isApproveError, approveError]);

	const handleTxWithTimeout = async (
		action: (onSuccess: () => void, onError: (err: Error) => void) => void,
		{
			onSuccess,
			onError,
			setLoading,
			label = "transaction",
		}: {
			onSuccess: () => void;
			onError: (err: Error) => void;
			setLoading: (b: boolean) => void;
			label?: string;
		}
	) => {
		setLoading(true);

		let timedOut = false;
		let resolved = false;

		const infoTimeout = setTimeout(() => {
			if (!resolved) {
				toast.info(`Please confirm the ${label} in your wallet`, {
					id: "tx-info",
				});
			}
		}, 15000);

		const timeout = setTimeout(() => {
			if (!resolved) {
				timedOut = true;
				toast.warning(`${label} request timed out`, { id: "tx-timeout" });
				setLoading(false);
			}
		}, 35000);

		action(
			() => {
				resolved = true;
				clearTimeout(timeout);
				clearTimeout(infoTimeout);
				setLoading(false);
				onSuccess();
			},
			(err) => {
				if (timedOut) return;
				resolved = true;
				clearTimeout(timeout);
				clearTimeout(infoTimeout);
				setLoading(false);
				onError(err);
			}
		);
	};

	const { refetch: refetchBalance } = useBalance({
		address: address as unknown as `0x${string}`,
		token:
			selectedToken == "stakeEDU"
				? yldTokenAddress
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

	const formatBalance = (balance: string, decimals: number) => {
		return Number(balance) / Math.pow(10, decimals);
	};

	const handleStake = async () => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		// Await the fresh balance fetch
		const freshBalanceResult = await refetchBalance();
		const freshBalance = freshBalanceResult.data;

		if (!freshBalance || !freshBalance.value) {
			toast.error("Failed to fetch token balance. Please try again.");
			return;
		}

		const amountInWei = parseEther(amount);
		const balanceInWei = BigInt(freshBalance.value);

		if (balanceInWei < amountInWei) {
			const balanceFormatted = formatBalance(
				freshBalance.value,
				freshBalance.decimals
			);
			toast.error("Insufficient balance", {
				description: `You need ${amount} tokens but only have ${balanceFormatted.toFixed(
					6
				)} available.`,
			});
			return;
		}

		const needsApproval =
			!allowance || BigInt(allowance?.toString()) < amountInWei;

		try {
			if (needsApproval) {
				if (!approveSimulator?.request) {
					toast.error("Approval simulation failed. Try again.");
					return;
				}

				await handleTxWithTimeout(
					(onSuccess, onError) => {
						approveWrite(approveSimulator.request, {
							onSuccess,
							onError,
						});
					},
					{
						onSuccess: async () => {
							toast.success("Approval successful");
							await refetchAllowance();
							setIsApproving(false);
							await stakeTokens();
						},
						onError: (err) => {
							console.log(err);
							setIsApproving(false);
							if (err.message.includes("User rejected")) {
								toast.error("User rejected the request");
								return;
							}
							toast.error("Approval failed: " + err.message);
						},
						setLoading: setIsApproving,
					}
				);
			} else {
				await stakeTokens();
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error(err);
			toast.error("Stake process failed: " + err?.message);
			setIsApproving(false);
		}
	};

	const stakeTokens = async () => {
		if (!["stakeEDU", "stakeDEDU", "stakeWEDU"].includes(selectedToken)) {
			toast.error("Unknown staking token");
			return;
		}

		const stakeArgs =
			selectedToken === "stakeEDU"
				? {
						...getStakingConfig("stakeEDU", [STokenType]),
						value: parseEther(amount),
				  }
				: {
						...getStakingConfig(selectedToken, [
							STokenType,
							parseEther(amount).toString(),
						]),
				  };

		await handleTxWithTimeout(
			(onSuccess, onError) => {
				stakeWrite(stakeArgs, {
					onSuccess,
					onError,
				});
			},
			{
				onSuccess: () => {
					toast.success("Transaction successful!", {
						description: "Your investment was successful!",
					});

					refetchAllowance();
					refetchBalance();
					onStakeSuccess?.();
					setIsStaking(false);
				},
				onError: (err) => {
					console.log(err);
					setIsApproving(false);
					handleTxError(err, "Approval failed");
				},
				setLoading: setIsStaking,
			}
		);
	};

	return {
		isApproving,
		isStaking,
		handleStake,
	};
};
