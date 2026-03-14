"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingQueue } from "./PendingQueue";
import { ReviewedHistory } from "./ReviewedHistory";
import { ManagerSummaryStrip } from "./ManagerSummaryStrip";
import { ExpenseSummaryStrip } from "@/components/expenses/ExpenseSummaryStrip";
import { EmployeeDashboard } from "@/components/expenses/EmployeeDashboard";

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>

      {/* Summary strip — swaps based on active tab, always in same position */}
      {activeTab === "my-expenses" ? <ExpenseSummaryStrip /> : <ManagerSummaryStrip />}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="history">Reviewed History</TabsTrigger>
          <TabsTrigger value="my-expenses">My Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingQueue />
        </TabsContent>
        <TabsContent value="history">
          <ReviewedHistory />
        </TabsContent>
        <TabsContent value="my-expenses">
          <EmployeeDashboard hideSummaryStrip />
        </TabsContent>
      </Tabs>
    </div>
  );
}
