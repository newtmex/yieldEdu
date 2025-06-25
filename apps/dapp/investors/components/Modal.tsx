"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "./ui/skeleton";
import { formatUnits } from "viem";
import contractAddresses from "@/contract-deployments/deployments.json";
import yldABI from "@/contract-deployments/abis/YLDToken.json";
import { useAccount, useReadContract } from "wagmi";
import { useSearchParams } from "next/navigation";
import { useClaim } from "@/hooks/useClaim";

const WithdrawModal = ({
	showWithdrawModal,
	setShowWithDrawModal,
}: {
	showWithdrawModal: boolean;
	setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
}) => {
	const yldTokenAddress = contractAddresses.yldToken as `0x${string}`;

	const searchParams = useSearchParams();
	const tokenId = searchParams.get("tokenId");
	const { address } = useAccount();
	const queryClient = useQueryClient();

	const { data: activePosition, isPending: isPositionPending } = useQuery({
		queryKey: ["active-investments", tokenId],
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
		address: yldTokenAddress,
		abi: yldABI.abi,
		functionName: "previewRedeem",
		args: [activePosition?.[0]?.shares ?? 0],
		query: {
			enabled: !!activePosition?.[0]?.shares,
			select: (data: unknown) => (data as bigint).toString(),
		},
	});

	const { claim, isClaiming, isApproving } = useClaim({
		address,
		position: activePosition?.[0],
		tokenId,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["active-investments"] });
			window?.history.pushState({}, "", `/`);
			setShowWithDrawModal(false);
		},
	});

	return (
		<Dialog
			modal={true}
			open={showWithdrawModal}
			onOpenChange={(state) => (
				window?.history.pushState({}, "", `/`), setShowWithDrawModal(state)
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
											formatUnits(activePosition[0].amount, 18)
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
											formatUnits(activePosition[0].shares, 18)
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
									? parseFloat(formatUnits(BigInt(currentReturns), 18)).toFixed(
											4
									  ) + " YLD"
									: "0.00"}
							</p>
						</Card>
					</div>
				)}
				<Button
					disabled={
						isPositionPending || isRedeemPending || isApproving || isClaiming
					}
					onClick={claim}
					type="button"
					variant={"default"}
				>
					<>
						{(isApproving || isClaiming) && (
							<div className="size-4 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
						)}
						{isApproving
							? "Approving transaction..."
							: isClaiming
							? "Processing claim..."
							: "Claim Position"}
					</>
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default WithdrawModal;
