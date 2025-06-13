"use client";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
	const { address } = useAccount();

	const { data, isLoading, error } = useQuery({
		queryKey: ["active-investments"],
		queryFn: async () => {
			const [stakedRes, unstakedRes] = await Promise.all([
				supabase
					.from("staked_events")
					.select("*")
					.eq("user_address", address)
					.order("timestamp", { ascending: false }),

				supabase
					.from("unstaked_events")
					.select("*")
					.eq("user_address", address)
					.order("timestamp", { ascending: false }),
			]);

			const merged = [...(stakedRes.data ?? []), ...(unstakedRes.data ?? [])];
			const response = merged.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			);

			const processedData = (response ?? []).map((transaction) => {
				return {
					investmentId: transaction.id,
					associatedCourse: transaction.associatedCourse,
					earnedYield: transaction.shares,
					investedAmount: transaction.amount,
					shares: transaction.shares,
					timeStamp: transaction.timestamp,
					tokenId: transaction.token_id,
					tokenType: transaction.token_type,
					sTokenStatus: transaction.sTokenStatus,
					userAddress: transaction.user_address,
					type: transaction.type,
				};
			});

			return processedData;
		},
		enabled: !!address,
		refetchInterval: 10000, // auto refetch every 10 seconds
	});

	if (error) {
		console.log(error);
	}

	return (
		<div className="p-4">
			<DataTable data={data ?? []} isLoading={isLoading} showOptions={false} />
		</div>
	);
}
