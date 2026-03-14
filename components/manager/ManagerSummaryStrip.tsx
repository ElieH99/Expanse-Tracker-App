"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export function ManagerSummaryStrip() {
  const stats = useQuery(api.expenses.getManagerStats);

  const pending = stats?.pending ?? 0;
  const approvedBudget = stats?.approvedBudgetThisMonth ?? 0;
  const approvedCount = stats?.approvedThisMonth ?? 0;
  const rejectedCount = stats?.rejectedThisMonth ?? 0;
  const closedCount = stats?.closedCount ?? 0;
  const submittedCount = stats?.submittedCount ?? 0;
  const underReviewCount = stats?.underReviewCount ?? 0;
  const total = stats?.totalUnderManagement ?? 0;

  // Segmented bar: submitted (blue), under review / pending (amber), approved (green), rejected (orange), closed (red), rest (gray)
  const rest = Math.max(0, total - submittedCount - underReviewCount - approvedCount - rejectedCount - closedCount);
  const segments = [
    { count: submittedCount, color: "bg-blue-300" },
    { count: underReviewCount, color: "bg-amber-300" },
    { count: approvedCount, color: "bg-green-300" },
    { count: rejectedCount, color: "bg-orange-300" },
    { count: closedCount, color: "bg-red-300" },
    { count: rest, color: "bg-gray-200" },
  ];

  return (
    <div className="rounded-xl border border-border bg-white px-5 py-3 mb-6">
      <div className="flex items-center gap-6">
        {/* Badges: Submitted → Pending (Under Review) → Approved */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("bg-blue-100 text-blue-700 border-blue-200 font-medium")}
          >
            {submittedCount} Submitted
          </Badge>
          <Badge
            variant="outline"
            className={cn("bg-amber-100 text-amber-700 border-amber-200 font-semibold")}
          >
            {pending} Pending
          </Badge>
          <Badge
            variant="outline"
            className={cn("bg-green-100 text-green-700 border-green-200 font-medium")}
          >
            {approvedCount} Approved
          </Badge>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-border" />

        {/* Approved budget this month */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
          <span>
            <span className="font-semibold text-green-700">
              ${approvedBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>{" "}
            approved this month
          </span>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-border" />

        {/* Rejected + Closed — no separator between them */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-orange-700">{rejectedCount}</span>{" "}
            rejected
          </span>
          <span>
            <span className="font-medium text-red-800">{closedCount}</span>{" "}
            closed
          </span>
        </div>

        {/* Total — pushed to far right */}
        <div className="ml-auto text-sm text-muted-foreground">
          {total} total expense{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Segmented bar */}
      {total > 0 && (
        <div className="mt-2.5 flex h-1 rounded-full overflow-hidden gap-0.5">
          {segments.map((seg, i) =>
            seg.count > 0 ? (
              <div
                key={i}
                className={cn("rounded-full", seg.color)}
                style={{ width: `${(seg.count / total) * 100}%` }}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
