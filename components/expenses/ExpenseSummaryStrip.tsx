"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ExpenseSummaryStrip() {
  const expenses = useQuery(api.expenses.getMyExpenses);

  const pending = expenses?.filter((e) =>
    ["Submitted", "UnderReview"].includes(e.status)
  ).length ?? 0;

  const approved = expenses?.filter((e) => e.status === "Approved").length ?? 0;
  const drafts = expenses?.filter((e) => e.status === "Draft").length ?? 0;

  const stats = [
    { label: "Pending Review", value: pending, colour: "text-blue-600" },
    { label: "Approved", value: approved, colour: "text-green-600" },
    { label: "Drafts", value: drafts, colour: "text-gray-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-gray-100">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${stat.colour}`}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
