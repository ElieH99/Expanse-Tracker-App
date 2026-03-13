import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("manager")),
    createdAt: v.number(), // UTC ms
  }).index("by_email", ["email"]),

  expenses: defineTable({
    submittedBy: v.id("users"),
    status: v.union(
      v.literal("Draft"),
      v.literal("Submitted"),
      v.literal("UnderReview"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Closed"),
      v.literal("Withdrawn")
    ),
    currentVersion: v.number(), // increments on each submit/resubmit; starts at 1
    // Approval fields
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    approvalNote: v.optional(v.string()),
    // Rejection fields
    rejectedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()), // categorised
    rejectionComment: v.optional(v.string()), // free-text, required on rejection
    // Close fields
    closedBy: v.optional(v.id("users")),
    closedAt: v.optional(v.number()),
    closeReason: v.optional(v.string()), // categorised
    closeComment: v.optional(v.string()), // free-text, required on close
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_submittedBy", ["submittedBy"])
    .index("by_status", ["status"])
    .index("by_submittedBy_status", ["submittedBy", "status"]),

  // append-only — rows are never updated or deleted
  expenseVersions: defineTable({
    expenseId: v.id("expenses"),
    versionNumber: v.number(),
    title: v.string(),
    description: v.string(),
    amount: v.number(),
    currencyCode: v.string(), // ISO 4217
    categoryId: v.id("categories"),
    expenseDate: v.number(), // UTC ms
    receiptStorageId: v.string(), // Convex file storage ID
    notes: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_expenseId", ["expenseId"])
    .index("by_expenseId_versionNumber", ["expenseId", "versionNumber"]),

  // append-only — rows are never updated or deleted
  expenseHistory: defineTable({
    expenseId: v.id("expenses"),
    changedBy: v.id("users"),
    oldStatus: v.string(),
    newStatus: v.string(),
    comment: v.optional(v.string()),
    versionNumber: v.number(), // version active at time of event
    changedAt: v.number(),
  }).index("by_expenseId", ["expenseId"]),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
  }).index("by_name", ["name"]),
});
