"use client";

import * as React from "react";

import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconLayoutColumns,
	IconTrendingUp,
} from "@tabler/icons-react";
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
// import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	// DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatUnits } from "viem";

export const tableSchema = z.object({
	investmentId: z.string(),
	investedAmount: z.string(),
	earnedYield: z.string(),
	associatedCourse: z.string(),
	sTokenStatus: z.string(),
	shares: z.string(),
	timeStamp: z.string(),
	tokenId: z.string(),
	tokenType: z.string(),
	type: z.enum(["staked", "unstaked"]),
});
import contractAddresses from "@/contract-deployments/deployments.json";
import yldABI from "@/contract-deployments/abis/YLDToken.json";
import { readContract } from "@wagmi/core";

import { config } from "@/lib/wagmi";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const yldAddress = contractAddresses.yldToken as `0x${string}`;

const columns = (
	setShowWithDrawModal?: React.Dispatch<React.SetStateAction<boolean>>
): ColumnDef<z.infer<typeof tableSchema>>[] => [
	{
		accessorKey: "investmentId",
		header: "Investment Id",
		cell: ({ row }) => {
			return row.original.investmentId;
		},
		enableHiding: false,
	},
	// {
	// 	accessorKey: "tokenId",
	// 	header: "Token Id",
	// 	cell: ({ row }) => {
	// 		return row.original.tokenId;
	// 	},
	// 	enableHiding: false,
	// },
	{
		accessorKey: "shares",
		header: "YLDs (Shares)",
		cell: ({ row }) => {
			return row.original.shares ? (
				<span className="text-lime-500 font-semibold">
					{parseFloat(formatUnits(BigInt(row.original.shares), 18)).toFixed(4)}
				</span>
			) : (
				"0.00"
			);
		},
		enableHiding: false,
	},
	{
		accessorKey: "timeStamp",
		header: "TimeStamp",
		cell: ({ row }) => {
			const date = new Date(row.original.timeStamp);
			return isNaN(date.getTime())
				? row.original.timeStamp
				: `${date.getDate()}${
						["th", "st", "nd", "rd"][
							date.getDate() % 10 > 3 ||
							(date.getDate() % 100 >= 11 && date.getDate() % 100 <= 13)
								? 0
								: date.getDate() % 10
						]
				  } ${date.toLocaleString(undefined, {
						month: "long",
				  })} ${date.getFullYear()}, ${
						date.getHours() % 12 === 0 ? 12 : date.getHours() % 12
				  }:${date.getMinutes()?.toString().padStart(2, "0")}${
						date.getHours() < 12 ? "AM" : "PM"
				  }`;
		},
		enableHiding: false,
	},

	{
		accessorKey: "tokenType",
		header: "Token Type",
		cell: ({ row }) => {
			return (
				<TableCellViewer
					item={
						Number(row.original.tokenType) === 1
							? "Investor Token"
							: "Learner Token"
					}
				/>
			);
		},
		enableHiding: false,
	},
	{
		accessorKey: "investedAmount",
		header: "Investment Amount",
		cell: ({ row }) => {
			return row.original.shares ? (
				<span className="text-blue-500 font-semibold">
					{parseFloat(
						formatUnits(BigInt(row.original.investedAmount), 18)
					).toFixed(4)}
				</span>
			) : (
				"0.00"
			);
		},
		// <div className="w-32">
		// 	<Badge variant="outline" className="text-muted-foreground px-1.5">
		// 		{row.original.investedAmount}
		// 	</Badge>
		// </div>
	},
	{
		accessorKey: "earnedYield",
		header: "Earned YLD",
		cell: ({ row }) => {
			return (
				<span className="text-lime-500 font-semibold">
					{row.original.earnedYield}
				</span>
			);
		},

		// <Badge variant="outline" className="text-muted-foreground px-1.5">
		// 	{row.original.status === "Done" ? (
		// 		<IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
		// 	) : (
		// 		<IconLoader />
		// 	)}
		// 	{row.original.status}
		// </Badge>
	},
	{
		accessorKey: "associatedCourse",
		header: "Associated Course",
		cell: ({ row }) => <TableCellViewer item={row.original.associatedCourse} />,
	},
	{
		accessorKey: "sTokenStatus",
		header: "sToken Status",
		cell: ({ row }) => <TableCellViewer item={row.original.sTokenStatus} />,
	},

	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<IconDotsVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-32">
					{/* <DropdownMenuItem variant="destructive">Opt out</DropdownMenuItem> */}
					<DropdownMenuItem
						onClick={() => {
							const searchParams = new URLSearchParams(window.location.search);
							const tokenId = row.original.tokenId;
							const params = new URLSearchParams(searchParams.toString());
							params.set("tokenId", tokenId);
							window.history.pushState({}, "", `?${params.toString()}`);
							setShowWithDrawModal?.(true);
						}}
					>
						Claim Position
					</DropdownMenuItem>
					{/* <DropdownMenuSeparator /> */}
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

export function DataTable({
	data: initialData,
	isLoading,
	setShowWithDrawModal,
}: {
	data: z.infer<typeof tableSchema>[];
	isLoading?: boolean;
	setShowWithDrawModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [data, setData] = React.useState(() => initialData);

	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	React.useEffect(() => {
		const generateYLDs = async (value: string) => {
			const response = await readContract(config, {
				address: yldAddress,
				abi: yldABI.abi,
				functionName: "previewRedeem",
				args: [value],
			});
			return response;
		};

		const updateData = async () => {
			if (initialData.length >= 1) {
				const updatedData = await Promise.all(
					initialData.map(async (initData) => {
						const currentReturns = await generateYLDs(initData.earnedYield);
						return {
							...initData,
							earnedYield: currentReturns
								? parseFloat(formatUnits(currentReturns as bigint, 18)).toFixed(
										4
								  )
								: "0.00",
						};
					})
				);
				setData(updatedData);
			}
		};

		updateData();
	}, [initialData]);

	const table = useReactTable({
		data,
		columns: columns(setShowWithDrawModal),
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.investmentId?.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="grid grid-cols-1 gap-4">
			{isLoading ? (
				<Skeleton className="h-[32px] bg-gray-500/20 w-[160px] ml-auto" />
			) : (
				<div className="flex items-center ml-auto gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<IconLayoutColumns />
								<span className="hidden lg:inline">Customize Columns</span>
								<span className="lg:hidden">Columns</span>
								<IconChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide()
								)
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}

			{isLoading ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[250px] w-full *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
					<Skeleton className="h-[23px] bg-gray-500/20 w-[80%]" />
					<Skeleton className="grid bg-gray-500/20 grid-cols-1 place-content-center gap-3 pl-4 h-[50px] w-[98%] *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card" />
				</Skeleton>
			) : (
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="bg-muted sticky top-0 z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
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
						<TableBody className="**:data-[slot=table-cell]:first:w-8  dark:bg-lime-400/20">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										title={row.original.type === "unstaked" ? "Withdrawn" : ""}
										className={cn("relative z-0 dark:hover:bg-green-400/10", {
											"bg-blue-500/20 hover:bg-blue-500/25 dark:hover:bg-blue-500/25 dark:bg-blue-500/20 opacity-80":
												row.original.type === "unstaked",
										})}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={12} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}
			{isLoading ? (
				<Skeleton className="grid grid-cols-1 place-content-center gap-3 pl-4 h-[90px] w-full *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card" />
			) : (
				<div className="flex items-center justify-between px-4">
					<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight />
							</Button>
							<Button
								variant="outline"
								className="hidden size-8 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const chartData = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "var(--primary)",
	},
	mobile: {
		label: "Mobile",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: string }) {
	const isMobile = useIsMobile();

	return (
		<Drawer direction={isMobile ? "bottom" : "right"}>
			<DrawerTrigger asChild>
				<Button
					variant="link"
					className="text-foreground underline opacity-70 hover:opacity-100 w-fit px-0 text-left"
				>
					{item}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="gap-1">
					<DrawerTitle>{item}</DrawerTitle>
					<DrawerDescription>
						Showing total visitors for the last 6 months
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
					{!isMobile && (
						<>
							<ChartContainer config={chartConfig}>
								<AreaChart
									accessibilityLayer
									data={chartData}
									margin={{
										left: 0,
										right: 10,
									}}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="month"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(value) => value.slice(0, 3)}
										hide
									/>
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent indicator="dot" />}
									/>
									<Area
										dataKey="mobile"
										type="natural"
										fill="var(--color-mobile)"
										fillOpacity={0.6}
										stroke="var(--color-mobile)"
										stackId="a"
									/>
									<Area
										dataKey="desktop"
										type="natural"
										fill="var(--color-desktop)"
										fillOpacity={0.4}
										stroke="var(--color-desktop)"
										stackId="a"
									/>
								</AreaChart>
							</ChartContainer>
							<Separator />
							<div className="grid gap-2">
								<div className="flex gap-2 leading-none font-medium">
									Trending up by 5.2% this month{" "}
									<IconTrendingUp className="size-4" />
								</div>
								<div className="text-muted-foreground">
									Showing total visitors for the last 6 months. This is just
									some random text to test the layout. It spans multiple lines
									and should wrap around.
								</div>
							</div>
							<Separator />
						</>
					)}
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<Label htmlFor="header">Header</Label>
							<Input id="header" defaultValue={item} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="type">Type</Label>
								<Select defaultValue={item}>
									<SelectTrigger id="type" className="w-full">
										<SelectValue placeholder="Select a type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Table of Contents">
											Table of Contents
										</SelectItem>
										<SelectItem value="Executive Summary">
											Executive Summary
										</SelectItem>
										<SelectItem value="Technical Approach">
											Technical Approach
										</SelectItem>
										<SelectItem value="Design">Design</SelectItem>
										<SelectItem value="Capabilities">Capabilities</SelectItem>
										<SelectItem value="Focus Documents">
											Focus Documents
										</SelectItem>
										<SelectItem value="Narrative">Narrative</SelectItem>
										<SelectItem value="Cover Page">Cover Page</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="status">Status</Label>
								<Select defaultValue={""}>
									<SelectTrigger id="status" className="w-full">
										<SelectValue placeholder="Select a status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Done">Done</SelectItem>
										<SelectItem value="In Progress">In Progress</SelectItem>
										<SelectItem value="Not Started">Not Started</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="target">Target</Label>
								<Input id="target" defaultValue={""} />
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="limit">Limit</Label>
								<Input id="limit" defaultValue={""} />
							</div>
						</div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="reviewer">Reviewer</Label>
							<Select defaultValue={""}>
								<SelectTrigger id="reviewer" className="w-full">
									<SelectValue placeholder="Select a reviewer" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
									<SelectItem value="Jamik Tashpulatov">
										Jamik Tashpulatov
									</SelectItem>
									<SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</form>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Done</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
