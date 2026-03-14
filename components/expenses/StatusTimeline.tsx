"use client";

import { format } from "date-fns";
import { type ExpenseStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { VersionBadge } from "./VersionBadge";

interface HistoryEntry {
  _id: string;
  changedAt: number;
  changedByName: { firstName: string; lastName: string };
  oldStatus: string;
  newStatus: string;
  comment?: string;
  versionNumber: number;
}

interface StatusTimelineProps {
  history: HistoryEntry[];
}

const STATUS_DOT_COLORS: Record<string, string> = {
  Approved: "bg-green-400",
  Rejected: "bg-orange-400",
  Closed: "bg-red-400",
  Submitted: "bg-blue-400",
  UnderReview: "bg-amber-400",
  Withdrawn: "bg-slate-400",
  Draft: "bg-gray-300",
};

function getActionLabel(entry: HistoryEntry): string {
  if (!entry.oldStatus) return "created the expense";
  switch (entry.newStatus) {
    case "Approved":
      return "approved the expense";
    case "Rejected":
      return "rejected the expense";
    case "Closed":
      return "closed the expense";
    case "Submitted":
      return entry.versionNumber > 1 ? "resubmitted the expense" : "submitted the expense";
    case "UnderReview":
      return "opened for review";
    case "Withdrawn":
      return "withdrew the expense";
    default:
      return "changed status";
  }
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="space-y-0">
        <h4 className="text-base font-semibold text-gray-900 mb-3">Status Timeline</h4>
        <p className="text-xs text-muted-foreground py-3 px-1 italic">
          No status changes recorded yet.
        </p>
      </div>
    );
  }

  const reversed = [...history].reverse();

  return (
    <div className="space-y-0">
      <h4 className="text-base font-semibold text-gray-900 mb-3">Status Timeline</h4>
      <div className="relative space-y-0">
        {reversed.map((entry, index) => {
          const isLatest = index === 0;
          const dotColor = STATUS_DOT_COLORS[entry.newStatus] ?? "bg-gray-300";

          return (
            <div
              key={entry._id}
              className={cn(
                "relative pl-6 pb-4 last:pb-0",
                isLatest ? "border-l-2 border-gray-300" : "border-l-2 border-gray-100"
              )}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute -left-[7px] top-1 rounded-full",
                  dotColor,
                  isLatest ? "w-3.5 h-3.5 ring-2 ring-white" : "w-3 h-3"
                )}
              />

              {/* Header row */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {format(new Date(entry.changedAt), "dd MMM yyyy, HH:mm")}
                </span>
                {isLatest && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                    Latest
                  </span>
                )}
                <span className={cn("text-sm text-gray-700", !entry.oldStatus && "italic")}>
                  <span className="font-medium not-italic">
                    {entry.changedByName.firstName} {entry.changedByName.lastName}
                  </span>{" "}
                  {getActionLabel(entry)}
                </span>
                <VersionBadge versionNumber={entry.versionNumber} />
              </div>

              {/* Status transition */}
              {entry.oldStatus ? (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <StatusBadge status={entry.oldStatus as ExpenseStatus} />
                  <span>→</span>
                  <StatusBadge status={entry.newStatus as ExpenseStatus} />
                </div>
              ) : (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <StatusBadge status={entry.newStatus as ExpenseStatus} />
                </div>
              )}

              {/* Comment */}
              {entry.comment && (
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                  &ldquo;{entry.comment}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
