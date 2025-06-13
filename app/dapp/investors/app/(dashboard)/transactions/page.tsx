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

			const response = [...(stakedRes.data ?? []), ...(unstakedRes.data ?? [])];

			const processedData = (response ?? []).map((transaction) => {
				return {
					investmentId: transaction.id,
					associatedCourse: "N/A",
					earnedYield: transaction.shares.toString(),
					investedAmount: transaction.amount.toString(),
					shares: transaction.shares,
					timeStamp: transaction.timestamp,
					tokenId: transaction.token_id,
					tokenType: transaction.token_type,
					sTokenStatus: "N/A",
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
			<DataTable data={data ?? []} isLoading={isLoading} />
		</div>
	);
}
