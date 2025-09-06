import React, { Dispatch, SetStateAction, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
// import { Badge } from "./ui/badge";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	ArrowDown,
	ArrowUp,
	ChevronsUpDown,
	MoreHorizontal,
} from "lucide-react";
import {
	CellContext,
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	SortingState,
	getSortedRowModel,
	Column,
} from "@tanstack/react-table";
import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter, useSearchParams } from "next/navigation";
import CountDownTimer, { ExploreTransactionButton } from "./CountDownTimer";
import { ActivePosition } from "./PositionOverview";
import { Badge } from "./ui/badge";

interface ActivePositionTableProps {
	positions: ActivePosition[];
	setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
	setModalType: Dispatch<SetStateAction<"withdraw" | "unstake" | null>>;
}

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className, "hover:bg-transparent")}>{title}</div>;
	}

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8 data-[state=open]:bg-lime-400/20 hover:bg-transparent"
					>
						<span>{title}</span>
						{column.getIsSorted() === "desc" ? (
							<ArrowDown />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUp />
						) : (
							<ChevronsUpDown />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="dark:bg-slate-900">
					<DropdownMenuItem
						onClick={() => column.toggleSorting(false)}
						className="cursor-pointer"
					>
						<ArrowUp className="h-3.5  w-3.5 text-muted-foreground/70" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => column.toggleSorting(true)}
						className="cursor-pointer"
					>
						<ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
						Desc
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

const ActivePositions = ({
	positions,
	setShowWithDrawModal,
	setModalType,
}: ActivePositionTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "startTime",
			desc: true,
		},
	]);
	const { isConnected, address } = useAppKitAccount();
	const searchParams = useSearchParams();
	const router = useRouter();

	const handleUnstake = (positionId: string) => {
		setModalType("unstake");
		const params = new URLSearchParams(searchParams?.toString());
		params.set("positionId", positionId);
		window.history.pushState({}, "", `?${params.toString()}`);
		setShowWithDrawModal(true);
	};

	const columns: ColumnDef<
		ActivePosition,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any
	>[] = [
		{
			accessorKey: "amount",
			id: "amount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Amount" />
			),
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue("amount"));

				return <div className="font-medium">{amount}</div>;
			},
		},

		{
			accessorKey: "lockDuration",
			id: "lockDuration",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="LockDuration" />
			),
			cell: ({ row }) => {
				const lockDuration = row.getValue("lockDuration") as string;
				const formatted = Math.floor(Number(lockDuration) / (60 * 60 * 24));
				return (
					<div className="font-medium">
						{formatted} {Number(formatted) > 1 ? "days" : "day"}
					</div>
				);
			},
		},
		{
			accessorKey: "startTime",
			id: "startTime",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Start Date" />
			),
			cell: ({ row }) => {
				const startTimeUnix = row.getValue("startTime") as number;
				if (!startTimeUnix) return <div className="font-medium">-</div>;

				const startTime = new Date(startTimeUnix * 1000);
				const formattedDate = startTime.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});

				return <div className="font-medium">{formattedDate}</div>;
			},
		},
		{
			accessorKey: "timeLeft",
			id: "timeLeft",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="End Date" />
			),
			cell: ({ row }) => {
				const startTime = row.getValue("startTime") as number;
				const lockDuration = row.getValue("lockDuration") as number;

				if (!startTime || !lockDuration)
					return <div className="font-medium">-</div>;

				const endTime = new Date((startTime + lockDuration) * 1000);

				const formattedDate = endTime.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});

				return <div className="font-medium">{formattedDate}</div>;
			},
		},
		{
			accessorKey: "expectedYield",
			id: "expectedYield",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="ExpectedYield" />
			),
			cell: ({ row }) => {
				const expectedYield = row.getValue("expectedYield") as number;
				return (
					<div className="font-medium dark:text-yellow-400 text-lime-600">
						{expectedYield.toFixed(8)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			id: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={"default"}
						className={cn(
							"bg-yellow-100 dark:bg-yellow-400/20 hover:bg-yellow-100 hover:dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30",
							{
								"bg-lime-100 hover:bg-lime-100 hover:dark:bg-lime-400/20 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-400/30":
									status === "Active",
							}
						)}
					>
						{status}
					</Badge>
				);
			},
		},
		{
			accessorKey: "Actions",
			id: "actions",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			cell: ({ row }: CellContext<ActivePosition, any>) => {
				// =row data using row.original
				// const payment = row.original;

				return (
					<DropdownMenu modal={false}>
						{row.original.positionAddress === address ? (
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0 group dark:hover:bg-slate-900 hover:bg-lime-500"
								>
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4 group-hover:text-white" />
								</Button>
							</DropdownMenuTrigger>
						) : (
							"-"
						)}

						{row.original.positionAddress === address && (
							<DropdownMenuContent
								className="border-slate-200  dark:border-slate-700 !bg-white dark:!bg-slate-900 flex flex-col gap-2 p-2 text-white"
								align="end"
							>
								{row.original.transactionHash && (
									<ExploreTransactionButton
										transaction_hash={row.original.transactionHash}
										className="bg-slate-800 text-white w-full dark:hover:bg-lime-400/30 rounded-sm p-2 justify-center ml-0 shadow hover:bg-primary/90"
									/>
								)}
								<Button
									onClick={() => handleUnstake(row.original.id)}
									type="button"
									variant={"default"}
									className="bg-slate-800 text-white w-full dark:hover:bg-lime-400/30"
								>
									Unstake
								</Button>
								<CountDownTimer
									positionId={row.original.id}
									transaction_hash={row.original.transactionHash}
									setShowWithDrawModal={setShowWithDrawModal}
									isConnected={isConnected}
									lockDuration={Number(row.original.lockDuration)}
									startTime={Number(row.original.startTime)}
								/>
							</DropdownMenuContent>
						)}
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: positions,
		columns,
		getPaginationRowModel: getPaginationRowModel(),
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	const sortedRows = table.getSortedRowModel().rows;

	return (
		<Card className="bg-white my-4 w-full overflow-auto dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
			<CardHeader>
				<CardTitle className="text-slate-900 dark:text-white">
					Active Positions
				</CardTitle>
				<CardDescription className="text-slate-500 dark:text-slate-400">
					Your current staking positions and rewards
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								className="hover:bg-transparent border-slate-800/20 dark:border-slate-700/50"
								key={headerGroup.id}
							>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{sortedRows?.length ? (
							<>
								{sortedRows.map((row) => (
									<TableRow
										onDoubleClick={() =>
											router.push(
												`${process.env.NEXT_PUBLIC_EDU_BLOCKSCOUT_URL}/${row.original.transactionHash}`
											)
										}
										key={row.id}
										className={cn(
											"border-slate-800/20 text-slate-500 dark:text-slate-300",
											{
												"bg-lime-500/20":
													row.original.positionAddress === address,
											}
										)}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => {
											return (
												<>
													<TableCell key={cell.id}>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												</>
											);
										})}
									</TableRow>
								))}
							</>
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export default ActivePositions;
