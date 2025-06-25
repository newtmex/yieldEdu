/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useReadContract, useSimulateContract } from "wagmi";
import { toast } from "sonner";
import contractAddresses from "@/mainnet-deployments/deployments.json";
import { erc20Abi } from "viem";
import { supabase } from "@/lib/supabaseClient";
import { handleTxError } from "./useStake";
import { getStakingConfig } from "@/lib/wagmi-helpers";

export const useClaim = ({
	address,
	position,
	tokenId,
	onSuccess,
}: {
	address: `0x${string}` | undefined;
	position?: {
		shares?: string | number | undefined;
	};
	tokenId: string | null;
	onSuccess?: () => void;
}) => {
	const [isClaiming, setIsUnstaking] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const stakingAddress = contractAddresses.staking as `0x${string}`;
	const yldTokenAddress = contractAddresses.yldToken as `0x${string}`;
	const { writeContract: claimWrite } = useWriteContract();
	const { writeContract } = useWriteContract();

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		abi: erc20Abi,
		address: yldTokenAddress,
		functionName: "allowance",
		args: [address!, stakingAddress],
		query: {
			select: (data) => (data as bigint).toString(),
		},
	});

	const { data: approveSimulator, error: approveSimulateError } =
		useSimulateContract({
			address: yldTokenAddress,
			abi: erc20Abi,
			functionName: "approve",
			args: [stakingAddress, position?.shares as unknown as bigint],
		});

	useEffect(() => {
		if (approveSimulateError) {
			console.log(approveSimulateError.message);
		}
	}, [approveSimulateError]);

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
				toast.warning(`${label} request timed out`, { id: "tx-timeout" });
				setLoading(false);
			}
		}, 35000);

		action(
			() => {
				resolved = true;
				clearTimeout(infoTimeout);
				clearTimeout(timeout);
				setLoading(false);
				toast.dismiss("tx-timeout");
				onSuccess();
			},
			(err) => {
				resolved = true;
				clearTimeout(infoTimeout);
				clearTimeout(timeout);
				setLoading(false);
				toast.dismiss("tx-timeout");
				onError(err);
			}
		);
	};

	const claim = async () => {
		if (!address || !position?.shares || !tokenId) {
			toast.error("Missing claim data");
			return;
		}

		const sharesBigInt = BigInt(position.shares);
		const needsApproval = !allowance || BigInt(allowance) < sharesBigInt;

		try {
			if (needsApproval) {
				if (!approveSimulator?.request) {
					toast.error("Approval simulation failed");
					return;
				}

				await handleTxWithTimeout(
					(onSuccess, onError) => {
						writeContract(approveSimulator.request, { onSuccess, onError });
					},
					{
						setLoading: setIsApproving,
						onSuccess: async () => {
							toast.success("Approval successful");
							await refetchAllowance?.();
							setIsApproving(false);
							await proceedToUnstake();
						},
						onError: (err) => {
							console.log(err);
							setIsApproving(false);
							handleTxError(err, "Approval failed");
						},
					}
				);
			} else {
				await proceedToUnstake();
			}
		} catch (err: any) {
			console.error(err);
			handleTxError(err, "Claim failed");
		}
	};

	const proceedToUnstake = async () => {
		await handleTxWithTimeout(
			(onSuccess, onError) => {
				claimWrite(
					{
						...getStakingConfig("unStake", [
							tokenId!,
							position!.shares! as string,
						]),
					},
					{
						onSuccess,
						onError,
					}
				);
			},
			{
				setLoading: setIsUnstaking,
				onSuccess: async () => {
					toast.success("Claim successful");
					const { error } = await supabase
						.from("staked_events")
						.update({ status: "inactive" })
						.eq("token_id", tokenId);
					if (error) {
						console.log(error);
						toast.error("Claim failed");
						return;
					}
					onSuccess?.();
				},

				onError: (err) => {
					console.log(err);
					setIsUnstaking(false);
					handleTxError(err, "Claiming failed");
				},
			}
		);
	};

	return {
		claim,
		isClaiming,
		isApproving,
	};
};
