"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { type ExpenseStatus } from "@/lib/constants";
import { format } from "date-fns";
import { StatusBadge } from "@/components/expenses/StatusBadge";
import { ReviewModal } from "./ReviewModal";
import { Input } from "@/components/ui/input";
import { AmountRangeSlider } from "@/components/ui/amount-range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryRow {
  _id: Id<"expenses">;
  submitterName: string;
  title: string;
  amount: number;
  currencyCode: string;
  categoryId?: Id<"categories">;
  status: string;
  updatedAt: number;
  approvedAt?: number;
  rejectedAt?: number;
  closedAt?: number;
}

export function ReviewedHistory() {
  const categories = useQuery(api.categories.listCategories);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [nameSearch, setNameSearch] = useState("");
  const [amountRange, setAmountRange] = useState<[number, number] | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "decidedOn", desc: true },
  ]);
  const [reviewExpenseId, setReviewExpenseId] = useState<Id<"expenses"> | null>(null);

  const reviewed = useQuery(
    api.expenses.getReviewedHistory,
    {
      statusFilter: statusFilter === "all" ? undefined : statusFilter,
      categoryFilter: categoryFilter === "all" ? undefined : categoryFilter as Id<"categories">,
    }
  );

  const amountBounds = useMemo(() => {
    if (!reviewed || reviewed.length === 0) return { min: 0, max: 5000 };
    const amounts = reviewed.map((e: { amount: number }) => e.amount ?? 0);
    return { min: 0, max: Math.ceil(Math.max(...amounts) / 100) * 100 || 5000 };
  }, [reviewed]);

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
    if (!reviewed) return [];
    return reviewed.filter((r: { submitterName: string; amount: number; approvedAt?: number; rejectedAt?: number; closedAt?: number; updatedAt: number }) => {
      if (nameSearch && !r.submitterName.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      if (amountRange) {
        if (r.amount < amountRange[0] || r.amount > amountRange[1]) return false;
      }
      const decidedAt = r.approvedAt ?? r.rejectedAt ?? r.closedAt ?? r.updatedAt;
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (decidedAt < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000 - 1;
        if (decidedAt > to) return false;
      }
      return true;
    });
  }, [reviewed, nameSearch, amountRange, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<HistoryRow>[]>(
    () => [
      {
        accessorKey: "submitterName",
        header: "Employee Name",
        cell: ({ row }) => <span className="font-medium">{row.original.submitterName}</span>,
      },
      {
        accessorKey: "title",
        header: "Ticket Title",
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
          `${row.original.amount.toFixed(2)} ${row.original.currencyCode}`,
      },
      {
        accessorKey: "status",
        header: "Decision",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status as ExpenseStatus} />
        ),
      },
      {
        id: "decidedOn",
        header: "Decided On",
        accessorFn: (row) =>
          row.approvedAt ?? row.rejectedAt ?? row.closedAt ?? row.updatedAt,
        cell: ({ getValue }) =>
          format(new Date(getValue<number>()), "dd MMM yyyy"),
      },
    ],
    [categoryMap]
  );

  const table = useReactTable({
    data: filteredData as HistoryRow[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (reviewed === undefined) {
    return (
      <div className="animate-pulse mt-4" role="status" aria-label="Loading reviewed expenses">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
        {/* Name search */}
        <Input
          placeholder="Search by employee name..."
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="w-56"
        />

        {/* Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

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
        <table className="w-full" aria-label="Reviewed expenses history">
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
                  No reviewed expenses found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setReviewExpenseId(row.original._id)}
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

      {reviewExpenseId && (
        <ReviewModal
          open={reviewExpenseId !== null}
          onClose={() => setReviewExpenseId(null)}
          expenseId={reviewExpenseId}
          readOnly
        />
      )}
    </>
  );
}
