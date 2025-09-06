"use client";

import * as React from "react";

import {
	IconArrowDown,
	IconArrowUp,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconLayoutColumns,
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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const columns = (
	setShowWithDrawModal?: React.Dispatch<React.SetStateAction<boolean>>,
	showOptions?: boolean
): ColumnDef<z.infer<typeof tableSchema>>[] => [
	{
		accessorKey: "investmentId",
		header: "Investment Id",
		cell: ({ row }) => {
			return row.original?.investmentId?.slice(0, 7) + "...";
		},
		enableHiding: false,
	},

	{
		accessorKey: "shares",
		header: "YLDs (Shares)",
		cell: ({ row }) => {
			return row.original.shares ? (
				<span
					className={cn("flex items-center gap-1", {
						"text-lime-500 font-semibold": row.original.type === "staked",
						"text-red-500 font-semibold": row.original.type === "unstaked",
					})}
				>
					{row.original.type === "unstaked" ? "-" : "+"}
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
			return Number(row.original.tokenType) === 1
				? "Investor Token"
				: "Learner Token";
		},
		enableHiding: false,
	},
	{
		accessorKey: "investedAmount",
		header: "Investment Amount",
		cell: ({ row }) => {
			const value = row.original.investedAmount;
			if (!value) return "-";

			return row.original.shares ? (
				<span
					className={cn({
						"text-lime-500 font-semibold": row.original.type === "staked",
						"text-red-500 font-semibold": row.original.type === "unstaked",
					})}
				>
					{row.original.type === "unstaked" ? "-" : "+"}
					{row.original.investedAmount
						? parseFloat(
								formatUnits(BigInt(row.original.investedAmount), 18)
						  ).toFixed(4)
						: "0.00"}
				</span>
			) : (
				"0.00"
			);
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			return row.original.shares ? (
				<span
					className={cn("flex items-center gap-1", {
						"text-lime-500 font-semibold": row.original.type === "staked",
						"text-red-500 font-semibold": row.original.type === "unstaked",
					})}
				>
					{row.original.type === "staked" ? (
						<IconArrowUp size={20} />
					) : (
						<IconArrowDown size={20} />
					)}
					<span
						className={cn(
							" px-3 py-1 rounded-2xl",
							{
								"bg-red-500/15": row.original.type === "unstaked",
							},
							{ "bg-lime-500/15": row.original.type === "staked" }
						)}
					>
						{row.original.type === "unstaked" ? "Withdrawn" : "Invested"}
					</span>
				</span>
			) : (
				"0.00"
			);
		},
	},
	{
		accessorKey: "earnedYield",
		header: "Earned YLD",
		cell: ({ row }) => {
			return (
				<span
					className={cn("flex items-center gap-1", {
						"text-lime-500 font-semibold": row.original.type === "staked",
						"text-red-500 font-semibold": row.original.type === "unstaked",
					})}
				>
					{row.original.type === "unstaked" ? "-" : "+"}

					{parseFloat(
						formatUnits(row.original.earnedYield as unknown as bigint, 18)
					).toFixed(4)}
				</span>
			);
		},
	},
	{
		accessorKey: "associatedCourse",
		header: "Associated Course",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-muted-foreground px-1.5">
				{row.original.associatedCourse}
			</Badge>
		),
	},
	{
		accessorKey: "sTokenStatus",
		header: "sToken Status",
		cell: ({ row }) => row.original.sTokenStatus,
	},

	{
		id: "actions",
		cell: ({ row }) =>
			showOptions && (
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
								const searchParams = new URLSearchParams(
									window.location.search
								);
								const tokenId = row.original.tokenId;
								const params = new URLSearchParams(searchParams?.toString());
								params.set("tokenId", tokenId);
								window.history.pushState({}, "", `?${params?.toString()}`);
								setShowWithDrawModal?.(true);
							}}
						>
							Claim Position
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
	},
];

export function DataTable({
	data: initialData,
	isLoading,
	setShowWithDrawModal,
	showOptions = true,
}: {
	data: z.infer<typeof tableSchema>[];
	isLoading?: boolean;
	setShowWithDrawModal?: React.Dispatch<React.SetStateAction<boolean>>;
	showOptions?: boolean;
}) {
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

	const table = useReactTable({
		data: initialData,
		columns: columns(setShowWithDrawModal, showOptions),
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
															header?.getContext()
													  )}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className="**:data-[slot=table-cell]:first:w-8">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										onDoubleClick={() => {
											if (row.original.type === "staked" && showOptions) {
												const searchParams = new URLSearchParams(
													window.location.search
												);
												const tokenId = row.original.tokenId;
												const params = new URLSearchParams(
													searchParams?.toString()
												);
												params.set("tokenId", tokenId);
												window.history.pushState(
													{},
													"",
													`?${params?.toString()}`
												);
												setShowWithDrawModal?.(true);
											}
											return;
										}}
										key={row.id}
										title={row.original.type === "unstaked" ? "Withdrawn" : ""}
										className={cn(
											"relative z-0 bg-green-50 hover:bg-green-100 dark:bg-lime-300/10 dark:hover:bg-lime-300/20",
											{
												"bg-red-100 hover:bg-red-200 dark:bg-red-400/10 dark:hover:bg-red-400/20":
													row.original.type === "unstaked",
											}
										)}
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
