import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import contractAddresses from "@/mainnet-deployments/deployments.json";
import yldABI from "@/mainnet-deployments/abis/YLDToken.json";
import {
	IconActivity,
	IconCurrencyDollar,
	IconDropletBolt,
	IconTrendingUp,
} from "@tabler/icons-react";
export function SectionCards({
	isUserYldsPending,
	userYLDs,
	totalInvestment,
	activeInvestments,
	investmentsPending,
}: {
	isUserYldsPending?: boolean;
	userYLDs?: { value: string; decimals: number };
	totalInvestment?: bigint;
	activeInvestments?: number;
	investmentsPending?: boolean;
}) {
	const yldAddress = contractAddresses.yldToken as `0x${string}`;

	const { data: currentReturns, isPending: isRedeemPending } = useReadContract({
		address: yldAddress,
		abi: yldABI.abi,
		functionName: "previewRedeem",
		args: [userYLDs?.value],
		query: {
			enabled: !!userYLDs?.value,
			select: (data: unknown) => (data as bigint).toString(),
			refetchInterval: 5 * 60 * 1000,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	});

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
			{investmentsPending ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] w-[218px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
					<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
					<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
				</Skeleton>
			) : (
				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="flex items-center gap-2 text-lime-400">
							<IconCurrencyDollar size={20} />
							Total Investments
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{currentReturns
								? parseFloat(
										formatUnits(totalInvestment as bigint, 18)
								  ).toFixed(4)
								: "0.00"}
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
			{investmentsPending ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] w-[218px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
					<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
					<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
				</Skeleton>
			) : (
				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="flex text-lime-400 items-center gap-2">
							<IconActivity size={20} />
							Active Investments
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{activeInvestments}
						</CardTitle>
						{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingDown />
							-20%
						</Badge>
					</CardAction> */}
					</CardHeader>
					{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Down 20% this period <IconTrendingDown className="size-4" />
					</div>
					<div className="text-muted-foreground">
						Acquisition needs attention
					</div>
				</CardFooter> */}
				</Card>
			)}
			{isRedeemPending ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] w-[218px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
					<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
					<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
				</Skeleton>
			) : (
				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="flex text-lime-400 items-center gap-2">
							<IconTrendingUp size={20} />
							Current Returns
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{currentReturns
								? parseFloat(formatUnits(BigInt(currentReturns), 18)).toFixed(4)
								: "0.00"}
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
						Strong user retention <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">Engagement exceed targets</div>
				</CardFooter> */}
				</Card>
			)}
			{isUserYldsPending ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[107px] w-[218px] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
					<Skeleton className="h-[23px] bg-gray-500/20 w-[150px]" />
					<Skeleton className="h-[15px] bg-gray-500/20 w-[100px]" />
				</Skeleton>
			) : (
				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="flex text-lime-400 items-center gap-2">
							<IconDropletBolt size={20} />
							YLDs (Shares)
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{userYLDs?.value
								? parseFloat(
										formatUnits(BigInt(userYLDs.value), userYLDs.decimals)
								  ).toFixed(4)
								: "0.00"}
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
	);
}
