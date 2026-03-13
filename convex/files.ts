import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generate a short-lived upload URL for receipt images.
 * The client POSTs the file directly to this URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in to upload files");

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a signed URL for viewing a receipt image.
 * Validates that the requesting user is authorised to view the receipt:
 * - Employee: must own the expense the receipt belongs to
 * - Manager: can view any receipt
 */
export const getReceiptUrl = query({
  args: {
    storageId: v.id("_storage"),
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, { storageId, expenseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in to view receipts");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    const expense = await ctx.db.get(expenseId);
    if (!expense) throw new ConvexError("Expense not found");

    // Employee can only view receipts for their own expenses
    if (user.role === "employee" && expense.submittedBy !== userId) {
      throw new ConvexError("You do not have permission to view this receipt");
    }

    // Verify the storageId actually belongs to a version of this expense
    const versions = await ctx.db
      .query("expenseVersions")
      .withIndex("by_expenseId", (q: any) => q.eq("expenseId", expenseId))
      .collect();

    const validStorageId = versions.some((ver) => ver.receiptStorageId === storageId);
    if (!validStorageId) {
      throw new ConvexError("This receipt does not belong to the specified expense");
    }

    return await ctx.storage.getUrl(storageId);
  },
});
