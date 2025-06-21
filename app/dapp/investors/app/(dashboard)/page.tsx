"use client";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import InvestmentCard from "@/components/invest";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAccount, useBalance, useReadContract } from "wagmi";
import contractAddresses from "@/contract-deployments/deployments.json";
import { Abi, formatUnits } from "viem";
import { useEffect, useState } from "react";
import sTokenAbi from "@/contract-deployments/abis/SToken.json";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import yldABI from "@/contract-deployments/abis/YLDToken.json";
import { IconFingerprint } from "@tabler/icons-react";

export default function Page() {
	const sTokenAddress = contractAddresses.sToken as `0x${string}`;
	const YLDtokenAddress = contractAddresses.yldToken as `0x${string}`;
	const { address } = useAccount();
	const [totalStaked, setTotalStaked] = useState<string>("");
	const [showWithdrawModal, setShowWithDrawModal] = useState(false);
	const yldAddress = contractAddresses.yldToken as `0x${string}`;

	const { data, isPending, error } = useQuery({
		queryKey: ["active-investments"],
		queryFn: async () => {
			const response = await supabase
				.from("staked_events")
				.select("*")
				.eq("user_address", address)
				.order("timestamp", { ascending: false });

			const rawData = response?.data ?? [];

			// Call previewRedeem for each and format
			const processedData = await Promise.all(
				rawData.map(async (transaction) => {
					const preview = (await readContract(config, {
						address: yldAddress,
						abi: yldABI.abi,
						functionName: "previewRedeem",
						args: [transaction.shares.toString()],
					})) as bigint;

					return {
						investmentId: transaction.id,
						associatedCourse: "N/A",
						earnedYield: parseFloat(formatUnits(BigInt(preview), 18)).toFixed(
							4
						),
						investedAmount: transaction.amount.toString(),
						shares: transaction.shares,
						timeStamp: transaction.timestamp,
						tokenId: transaction.token_id,
						tokenType: transaction.token_type,
						type: "staked" as const,
						sTokenStatus: transaction.sTokenStatus,
					};
				})
			);

			return processedData;
		},
		enabled: !!address,
		refetchInterval: 5 * 60 * 1000, // 5 minutes
		staleTime: 5 * 60 * 1000, // 5 minutes, marks data fresh
		refetchOnWindowFocus: false,
	});

	if (error) {
		console.log(error);
	}
	//  nonces array for the user
	const {
		data: nonces,
		isPending: noncesLoading,
		error: noncesError,
		refetch: refetchNonces,
	} = useReadContract({
		address: sTokenAddress,
		abi: sTokenAbi.abi as Abi,
		functionName: "getNonces",
		args: [address as `0x${string}`],
		query: {
			enabled: !!address,
			select: (data: unknown) =>
				(data as bigint[])?.map((n: bigint) => n.toString()),
			refetchInterval: 5 * 60 * 1000,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	});

	useEffect(() => {
		if (!nonces || !Array.isArray(nonces)) return;
		const nonceArray = Array.isArray(nonces) ? nonces : [];
		async function fetchBalances() {
			const balances = (await Promise.all(
				nonceArray.map((nonce) =>
					readContract(config, {
						address: sTokenAddress,
						abi: sTokenAbi.abi as Abi,
						functionName: "balanceOf",
						args: [address as `0x${string}`, nonce],
					}).catch(() => BigInt(0))
				)
			)) as bigint[];

			const total = balances.reduce(
				(acc: bigint, bal: bigint) => acc + bal,
				BigInt(0)
			);
			setTotalStaked(total.toString());
		}

		fetchBalances();
	}, [nonces, address, sTokenAddress]);

	if (noncesError) {
		console.log(noncesError);
	}

	const {
		data: userYLDs,
		refetch: refetchUserYLDs,
		isPending: isUserYldsPending,
	} = useBalance({
		address: address as unknown as `0x${string}`,
		token: YLDtokenAddress,
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

	const totalInvestment = data?.reduce(
		(acc, curr) => acc + BigInt(curr.investedAmount),
		BigInt(0)
	);

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<SectionCards
				investmentsPending={isPending}
				totalInvestment={totalInvestment}
				isUserYldsPending={isUserYldsPending}
				userYLDs={userYLDs}
				activeInvestments={data?.length ?? 0}
			/>
			<div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
					<InvestmentCard
						setShowWithDrawModal={setShowWithDrawModal}
						showWithdrawModal={showWithdrawModal}
						refetchAll={() => {
							refetchNonces();
							refetchUserYLDs();
						}}
					/>
				</div>
				<div
					className="grid grid-cols-2 gap-5 h-fit	*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs
				"
				>
					{noncesLoading ? (
						<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] w-[218px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
							<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
							<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
						</Skeleton>
					) : (
						<Card className="@container/card">
							<CardHeader>
								<CardDescription className="flex text-lime-400 items-center gap-2">
									<IconFingerprint />
									Granted sTokens
								</CardDescription>
								<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
									{totalStaked
										? parseFloat(formatUnits(BigInt(totalStaked), 18)).toFixed(
												4
										  )
										: "0.0000"}
								</CardTitle>
								{/* <CardAction>
					<Badge variant="outline">
						<IconTrendingUp />
						+12.5%
					</Badge>
				</CardAction> */}
							</CardHeader>
							{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					Trending up this month <IconTrendingUp className="size-4" />
				</div>
				<div className="text-muted-foreground">
					Visitors for the last 6 months
				</div>
			</CardFooter> */}
						</Card>
					)}
				</div>
				{/* <ChartAreaInteractive /> */}
			</div>
			<div className="px-4">
				<DataTable
					data={data ?? []}
					isLoading={isPending}
					setShowWithDrawModal={setShowWithDrawModal}
				/>
			</div>
		</div>
	);
}
