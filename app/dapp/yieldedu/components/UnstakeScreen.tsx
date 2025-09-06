"use client";

import { toast } from "@/hooks/use-toast";
import { getYieldPoolConfig } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useWriteContract } from "wagmi";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { removeTransaction } from "@/utils/supabase/helpers";

const UnstakeScreen = ({
	amount,
	expectedYield,
	position_id,
	setShowWithDrawModal,
	transaction_hash,
	owner,
}: {
	amount?: number;
	expectedYield?: number;
	position_id: string | null;
	setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
	transaction_hash?: string;
	owner?: string;
}) => {
	const queryClient = useQueryClient();

	let penalty;
	let amountToReturn;
	if (amount) {
		penalty = amount / 10; // 10% penalty
		amountToReturn = amount - penalty;
	}

	const { writeContract: Unstake, isPending: unstakePending } =
		useWriteContract();

	const handleUnstake = async () => {
		try {
			Unstake(
				{ ...getYieldPoolConfig("unstake", [position_id]) },
				{
					async onSuccess() {
						await queryClient.invalidateQueries();
						// Explicitly invalidate the transactions query
						await queryClient.invalidateQueries({
							queryKey: ["transactions"],
						});

						const { error } = await removeTransaction(
							transaction_hash!,
							owner!
						);
						if (error) {
							console.log(error);
						}

						toast({
							title: "Transaction Successful",
							description: "Unstake was a success",
						});
						window.history.pushState({}, "", `/dashboard`);
						setShowWithDrawModal(false);
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.log(error);
		}
	};
	return (
		<DialogContent className="m-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
			<DialogHeader>
				<DialogTitle className="text-foreground">Unstake</DialogTitle>
				<DialogDescription className="space-y-4 pt-3 text-red-400">
					Continuing this process will result in a 10% penalty on your staked
					amount, reducing your expected yields.
				</DialogDescription>
			</DialogHeader>
			<div className="flex items-center gap-3 w-full">
				<div className="bg-slate-200 dark:bg-slate-900/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
					<p className="text-sm text-slate-400">Deposited</p>
					<p className="text-xl font-bold">
						{amount ? `${amount} FYT` : "N/A"}
					</p>
				</div>
				<div className="bg-slate-200 dark:bg-slate-900/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
					<p className="text-sm  text-slate-400">Current Yield</p>
					<p className="text-xl font-bold">
						{expectedYield ? `${Number(expectedYield).toFixed(8)} FYT` : "N/A"}
					</p>
				</div>
			</div>
			<div className="bg-slate-300 dark:bg-slate-700/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
				<p className="text-sm  text-slate-400">Expected Earn</p>
				<p className="text-xl font-bold">
					{amountToReturn ? `${Number(amountToReturn).toFixed(4)} FYT` : "N/A"}
				</p>
			</div>
			<Button
				disabled={unstakePending}
				onClick={handleUnstake}
				type="button"
				variant={"default"}
				className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-800 font-semibold hover:opacity-90"
			>
				<>
					{unstakePending && (
						<div className="size-6 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
					)}
					{unstakePending ? "Please wait..." : "Unstake"}
				</>
			</Button>
		</DialogContent>
	);
};

export default UnstakeScreen;
