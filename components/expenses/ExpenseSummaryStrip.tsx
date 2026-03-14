"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExpenseSummaryStrip() {
  const expenses = useQuery(api.expenses.getMyExpenses);

  const submitted = expenses?.filter((e) => e.status === "Submitted").length ?? 0;
  const underReview = expenses?.filter((e) => e.status === "UnderReview").length ?? 0;

  const approved = expenses?.filter((e) => e.status === "Approved").length ?? 0;
  const drafts = expenses?.filter((e) => e.status === "Draft").length ?? 0;
  const rejected = expenses?.filter((e) => e.status === "Rejected").length ?? 0;
  const closed = expenses?.filter((e) => e.status === "Closed").length ?? 0;
  const withdrawn = expenses?.filter((e) => e.status === "Withdrawn").length ?? 0;
  const total = expenses?.length ?? 0;

  const segments = [
    { count: submitted, color: "bg-blue-300" },
    { count: underReview, color: "bg-amber-300" },
    { count: drafts, color: "bg-gray-300" },
    { count: approved, color: "bg-green-300" },
    { count: rejected, color: "bg-orange-300" },
    { count: closed, color: "bg-red-300" },
    { count: withdrawn, color: "bg-slate-300" },
  ];

  return (
    <div className="rounded-xl border border-border bg-white px-5 py-3 mb-6">
      <div className="flex items-center gap-6">
        {/* Actionable statuses — badges */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "bg-gray-100 text-gray-700 border-gray-200 font-medium"
            )}
          >
            {drafts} Drafts
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "bg-blue-100 text-blue-700 border-blue-200 font-medium"
            )}
          >
            {submitted} Submitted
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "bg-amber-100 text-amber-700 border-amber-200 font-medium"
            )}
          >
            {underReview} Under Review
          </Badge>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-border" />

        {/* Terminal statuses — muted text */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-green-700">{approved}</span>{" "}
            Approved
          </span>
          <span>
            <span className="font-medium text-orange-700">{rejected}</span>{" "}
            Rejected
          </span>
          <span>
            <span className="font-medium text-red-800">{closed}</span>{" "}
            Closed
          </span>
          {withdrawn > 0 && (
            <span>
              <span className="font-medium text-slate-600">{withdrawn}</span>{" "}
              Withdrawn
            </span>
          )}
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
