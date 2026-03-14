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
import { type ExpenseStatus } from "@/lib/constants";
import { format } from "date-fns";
import { StatusBadge } from "@/components/expenses/StatusBadge";
import { ReviewModal } from "./ReviewModal";
import { AmountRangeSlider } from "@/components/ui/amount-range-slider";

interface PendingRow {
  _id: Id<"expenses">;
  submitterName: string;
  title: string;
  amount: number;
  currencyCode: string;
  categoryId?: Id<"categories">;
  submittedAt: number;
  status: string;
}

export function PendingQueue() {
  const pending = useQuery(api.expenses.getPendingQueue);
  const categories = useQuery(api.categories.listCategories);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "submittedAt", desc: false },
  ]);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  const [amountRange, setAmountRange] = useState<[number, number] | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const amountBounds = useMemo(() => {
    if (!pending || pending.length === 0) return { min: 0, max: 5000 };
    const amounts = pending.map((e) => e.amount ?? 0);
    return { min: 0, max: Math.ceil(Math.max(...amounts) / 100) * 100 || 5000 };
  }, [pending]);

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
    if (!pending) return [];
    return pending.filter((e) => {
      if (amountRange) {
        if (e.amount < amountRange[0] || e.amount > amountRange[1]) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (e.submittedAt < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000 - 1;
        if (e.submittedAt > to) return false;
      }
      return true;
    });
  }, [pending, amountRange, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<PendingRow>[]>(
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
        accessorKey: "submittedAt",
        header: "Submitted On",
        cell: ({ row }) =>
          format(new Date(row.original.submittedAt), "dd MMM yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status as ExpenseStatus} />
        ),
      },
    ],
    [categoryMap]
  );

  const table = useReactTable({
    data: filteredData as PendingRow[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (pending === undefined) {
    return (
      <div className="animate-pulse mt-4" role="status" aria-label="Loading pending expenses">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No pending expenses</h3>
        <p className="text-sm text-gray-500">All caught up — new submissions will appear here</p>
      </div>
    );
  }

  const sortedRows = table.getRowModel().rows;

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
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

      <div className="rounded-md border bg-white mt-0 overflow-x-auto">
        <table className="w-full" aria-label="Pending expenses for review">
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
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  No expenses match the current filters.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
                    row.original.status === "UnderReview" ? "bg-amber-50/50" : ""
                  }`}
                  onClick={() => setReviewIndex(idx)}
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

      {reviewIndex !== null && pending && (
        <ReviewModal
          open={reviewIndex !== null}
          onClose={() => setReviewIndex(null)}
          expenseId={sortedRows[reviewIndex]?.original._id ?? null}
          queue={sortedRows.map((r) => r.original._id)}
          currentIndex={reviewIndex}
          onNavigate={setReviewIndex}
        />
      )}
    </>
  );
}
