"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { type ExpenseStatus, EXPENSE_STATUSES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { AmountRangeSlider } from "@/components/ui/amount-range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseRow {
  _id: Id<"expenses">;
  title: string;
  amount: number;
  currencyCode: string;
  categoryId?: Id<"categories">;
  status: string;
  updatedAt: number;
  expenseDate?: number;
}

interface ExpenseTableProps {
  onRowClick: (expenseId: Id<"expenses">) => void;
}

export function ExpenseTable({ onRowClick }: ExpenseTableProps) {
  const expenses = useQuery(api.expenses.getMyExpenses);
  const categories = useQuery(api.categories.listCategories);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const amountBounds = useMemo(() => {
    if (!expenses || expenses.length === 0) return { min: 0, max: 5000 };
    const amounts = expenses.map((e) => e.amount ?? 0);
    return { min: 0, max: Math.ceil(Math.max(...amounts) / 100) * 100 || 5000 };
  }, [expenses]);

  const [amountRange, setAmountRange] = useState<[number, number] | null>(null);

  // Effective slider values (fall back to bounds when null = no filter)
  const sliderValue: [number, number] = amountRange ?? [amountBounds.min, amountBounds.max];

  const categoryMap = useMemo(() => {
    if (!categories) return {};
    const map: Record<string, string> = {};
    categories.forEach((c: { _id: string; name: string }) => {
      map[c._id] = c.name;
    });
    return map;
  }, [categories]);

  const filteredData = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((e) => {
      if (categoryFilter !== "all" && e.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (amountRange) {
        if (e.amount < amountRange[0] || e.amount > amountRange[1]) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        const date = e.expenseDate ?? e.updatedAt;
        if (date < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000 - 1;
        const date = e.expenseDate ?? e.updatedAt;
        if (date > to) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, statusFilter, amountRange, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<ExpenseRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title || "Untitled"}</span>
        ),
      },
      {
        accessorKey: "categoryId",
        header: "Category",
        cell: ({ row }) =>
          row.original.categoryId
            ? categoryMap[row.original.categoryId] ?? "—"
            : "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) =>
          row.original.amount
            ? `${row.original.amount.toFixed(2)} ${row.original.currencyCode}`
            : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status as ExpenseStatus} />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) =>
          formatDistanceToNow(new Date(row.original.updatedAt), {
            addSuffix: true,
          }),
      },
    ],
    [categoryMap]
  );

  const table = useReactTable({
    data: filteredData as ExpenseRow[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (expenses === undefined) {
    return (
      <div className="animate-pulse" role="status" aria-label="Loading expenses">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat: { _id: string; name: string }) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {EXPENSE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "UnderReview" ? "Under Review" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Amount range slider */}
        <AmountRangeSlider
          min={amountBounds.min}
          max={amountBounds.max}
          value={sliderValue}
          onValueChange={(v) => setAmountRange(v)}
          onReset={() => setAmountRange(null)}
        />

        {/* Date range */}
        <div className="flex items-center gap-1 rounded-md border border-input bg-background px-3 h-10">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm bg-transparent outline-none w-[130px] text-foreground"
            aria-label="Date from"
          />
          <span className="text-muted-foreground text-sm px-0.5">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm bg-transparent outline-none w-[130px] text-foreground"
            aria-label="Date to"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <table className="w-full" aria-label="My expenses">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " ↑" : ""}
                      {header.column.getIsSorted() === "desc" ? " ↓" : ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  No expenses match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onRowClick(row.original._id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
