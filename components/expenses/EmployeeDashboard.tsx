"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { ExpenseDetailModal } from "./ExpenseDetailModal";
import { ExpenseSummaryStrip } from "./ExpenseSummaryStrip";
import { Button } from "@/components/ui/button";
import { Plus, ReceiptText, FilePlus, Send, CheckCircle } from "lucide-react";

export function EmployeeDashboard({ hideSummaryStrip = false }: { hideSummaryStrip?: boolean } = {}) {
  const expenses = useQuery(api.expenses.getMyExpenses);

  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<Id<"expenses"> | null>(null);

  const hasExpenses = expenses && expenses.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Expenses</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Ticket
        </Button>
      </div>

      {expenses !== undefined && !hasExpenses ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-5">
            <ReceiptText className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No expense tickets yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Submit your first expense to get started.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Button>

          {/* How it works — 3-step mini guide */}
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg text-left">
            {[
              {
                icon: <FilePlus className="h-4 w-4 text-indigo-500" />,
                title: "1. Create",
                body: "Fill in the expense details and attach your receipt.",
              },
              {
                icon: <Send className="h-4 w-4 text-blue-500" />,
                title: "2. Submit",
                body: "Send it to your manager for review.",
              },
              {
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                title: "3. Get approved",
                body: "Track status in real time — no chasing needed.",
              },
            ].map((step) => (
              <div key={step.title} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  {step.icon}
                  <span className="text-xs font-semibold text-gray-700">{step.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {hasExpenses && !hideSummaryStrip && <ExpenseSummaryStrip />}
          <ExpenseTable onRowClick={(id) => setDetailId(id)} />
        </>
      )}

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode="create"
      />

      <ExpenseDetailModal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        expenseId={detailId}
      />
    </div>
  );
}
