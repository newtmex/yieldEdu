"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "./ui/skeleton";
import { formatUnits } from "viem";
import contractAddresses from "@/contract-deployments/deployments.json";
import yldABI from "@/contract-deployments/abis/YLDToken.json";
import stakingABI from "@/contract-deployments/abis/Staking.json";
import { useReadContract, useSimulateContract } from "wagmi";
import { toast } from "sonner";
import { writeContract } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { useSearchParams } from "next/navigation";

const WithdrawModal = ({
	showWithdrawModal,
	setShowWithDrawModal,
}: {
	showWithdrawModal: boolean;
	setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
}) => {
	const yldAddress = contractAddresses.yldToken as `0x${string}`;
	const stakingAddress = contractAddresses.staking as `0x${string}`;
	const stakingAbi = stakingABI.abi;
	const [isPending, setIsPending] = useState(false);
	const searchParams = useSearchParams();
	const tokenId = searchParams.get("tokenId");

	const { data: activePosition, isPending: isPositionPending } = useQuery({
		queryKey: ["active-position", tokenId],
		queryFn: async () => {
			const response = await supabase
				.from("staked_events")
				.select("*")
				.eq("token_id", tokenId);
			return response.data;
		},
		enabled: !!tokenId,
	});

	const { data: currentReturns, isPending: isRedeemPending } = useReadContract({
		address: yldAddress,
		abi: yldABI.abi,
		functionName: "previewRedeem",
		args: [activePosition?.[0]?.shares ?? 0],
	});

	const { data, error } = useSimulateContract({
		abi: stakingAbi,
		address: stakingAddress,
		functionName: "unStake",
		args: [tokenId, activePosition?.[0]?.shares],
		query: {
			enabled: !!activePosition?.[0]?.shares,
		},
	});

	useEffect(() => {
		if (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	}, [error]);

	const handleWithdraw = async () => {
		try {
			if (data?.request) {
				setIsPending(true);
				const hash = await writeContract(config, data?.request);
				toast.success("Rewards has been successfully claimed", {
					description: `transaction hash: ${hash}`,
				});
				const { error } = await supabase
					.from("staked_events")
					.delete()
					.eq("token_id", tokenId);
				if (error) {
					console.log(error);
				}
				setShowWithDrawModal(false);
				return;
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.message.includes("User rejected the request")) {
				toast.error("User rejected the request", {
					description: "transaction has been rejected",
				});
				return;
			}

			console.log("could not claim rewards", error);
			toast.error("Could not claim rewards", {
				description: "Please try again later.",
			});
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog
			modal={true}
			open={showWithdrawModal}
			onOpenChange={(state) => (
				window.history.pushState({}, "", `/`), setShowWithDrawModal(state)
			)}
		>
			<DialogContent className="m-2 rounded-xl border bg-card dark:bg-card overflow-y-auto h-full md:h-fit">
				<DialogHeader>
					<DialogTitle className="text-foreground">
						Claim Investment Position
					</DialogTitle>
					<DialogDescription className="space-y-4 pt-3">
						<span>This process will take a few seconds.</span>
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
					{isPositionPending ? (
						<Skeleton className="w-full grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
							<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
							<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
						</Skeleton>
					) : (
						<Card className="w-full p-4 rounded-lg border">
							<p className="text-s">Deposited</p>
							<p className="text-xl font-bold">
								{activePosition && activePosition[0]?.amount
									? parseFloat(
											formatUnits(activePosition[0].amount as bigint, 18)
									  ).toFixed(4) + " EDU"
									: "0.00"}
							</p>
						</Card>
					)}
					{isPositionPending ? (
						<Skeleton className="w-full grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
							<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
							<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
						</Skeleton>
					) : (
						<Card className="w-full p-4 rounded-lg border">
							<p className="text-sm">YLDs (Shares)</p>
							<p className="text-xl font-bold">
								{activePosition && activePosition[0]?.shares
									? parseFloat(
											formatUnits(activePosition[0].shares as bigint, 18)
									  ).toFixed(4) + " YLD"
									: "0.00"}
							</p>
						</Card>
					)}
				</div>
				{isPositionPending || isRedeemPending ? (
					<Skeleton className="w-full grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
						<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
						<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
					</Skeleton>
				) : (
					<div className=" w-full *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
						<Card className="p-4 rounded-lg border">
							<p className="text-sm">Expected Earn</p>
							<p className="text-xl font-bold">
								{currentReturns
									? parseFloat(
											formatUnits(currentReturns as bigint, 18)
									  ).toFixed(4) + " YLD"
									: "0.00"}
							</p>
						</Card>
					</div>
				)}
				<Button
					disabled={isPositionPending || isRedeemPending || isPending}
					onClick={handleWithdraw}
					type="button"
					variant={"default"}
				>
					<>
						{isPending && (
							<div className="size-4 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
						)}
						{isPending ? "Please wait..." : "Claim Position"}
					</>
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default WithdrawModal;
