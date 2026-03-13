import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { hasPermission, type Role } from "../lib/permissions";
import { getAuthenticatedUser, writeHistory } from "./expenseHelpers";
import {
  validateRejectionReason,
  validateCloseReason,
  validateStringLength,
} from "./authHelpers";

/**
 * Manager opens a submitted expense for review.
 */
export const openForReview = mutation({
  args: {
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, { expenseId }) => {
    const user = await getAuthenticatedUser(ctx);

    if (!hasPermission(user.role as Role, "expense:approve")) {
      throw new ConvexError("You do not have permission to review expenses");
    }

    const expense = await ctx.db.get(expenseId);
    if (!expense) throw new ConvexError("Expense not found");

    if (expense.submittedBy === user._id) {
      throw new ConvexError("You cannot review your own expense");
    }

    if (expense.status !== "Submitted") {
      throw new ConvexError("Only Submitted expenses can be opened for review");
    }

    await ctx.db.patch(expenseId, {
      status: "UnderReview",
      updatedAt: Date.now(),
    });

    await writeHistory(ctx, {
      expenseId,
      changedBy: user._id,
      oldStatus: "Submitted",
      newStatus: "UnderReview",
      versionNumber: expense.currentVersion,
    });
  },
});

/**
 * Manager approves an expense.
 */
export const approveExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
    approvalNote: v.optional(v.string()),
  },
  handler: async (ctx, { expenseId, approvalNote }) => {
    const user = await getAuthenticatedUser(ctx);

    if (!hasPermission(user.role as Role, "expense:approve")) {
      throw new ConvexError("You do not have permission to approve expenses");
    }

    const expense = await ctx.db.get(expenseId);
    if (!expense) throw new ConvexError("Expense not found");

    if (expense.submittedBy === user._id) {
      throw new ConvexError("You cannot approve your own expense");
    }

    if (expense.status !== "Submitted" && expense.status !== "UnderReview") {
      throw new ConvexError("Only Submitted or Under Review expenses can be approved");
    }

    if (approvalNote !== undefined) {
      validateStringLength(approvalNote, "Approval note", 0, 2000);
    }

    const now = Date.now();

    await ctx.db.patch(expenseId, {
      status: "Approved",
      approvedBy: user._id,
      approvedAt: now,
      approvalNote,
      updatedAt: now,
    });

    await writeHistory(ctx, {
      expenseId,
      changedBy: user._id,
      oldStatus: expense.status,
      newStatus: "Approved",
      comment: approvalNote,
      versionNumber: expense.currentVersion,
    });
  },
});

/**
 * Manager rejects an expense.
 */
export const rejectExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
    rejectionReason: v.string(),
    rejectionComment: v.string(),
  },
  handler: async (ctx, { expenseId, rejectionReason, rejectionComment }) => {
    const user = await getAuthenticatedUser(ctx);

    if (!hasPermission(user.role as Role, "expense:reject")) {
      throw new ConvexError("You do not have permission to reject expenses");
    }

    const expense = await ctx.db.get(expenseId);
    if (!expense) throw new ConvexError("Expense not found");

    if (expense.submittedBy === user._id) {
      throw new ConvexError("You cannot reject your own expense");
    }

    if (expense.status !== "Submitted" && expense.status !== "UnderReview") {
      throw new ConvexError("Only Submitted or Under Review expenses can be rejected");
    }

    if (!rejectionReason) throw new ConvexError("Rejection reason is required");
    validateRejectionReason(rejectionReason);
    if (!rejectionComment || rejectionComment.length < 10) {
      throw new ConvexError("Rejection comment must be at least 10 characters");
    }
    validateStringLength(rejectionComment, "Rejection comment", 10, 2000);

    const now = Date.now();

    await ctx.db.patch(expenseId, {
      status: "Rejected",
      rejectedBy: user._id,
      rejectedAt: now,
      rejectionReason,
      rejectionComment,
      updatedAt: now,
    });

    await writeHistory(ctx, {
      expenseId,
      changedBy: user._id,
      oldStatus: expense.status,
      newStatus: "Rejected",
      comment: rejectionComment,
      versionNumber: expense.currentVersion,
    });
  },
});

/**
 * Manager permanently closes an expense — irreversible.
 */
export const closeExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
    closeReason: v.string(),
    closeComment: v.string(),
  },
  handler: async (ctx, { expenseId, closeReason, closeComment }) => {
    const user = await getAuthenticatedUser(ctx);

    if (!hasPermission(user.role as Role, "expense:close")) {
      throw new ConvexError("You do not have permission to close expenses");
    }

    const expense = await ctx.db.get(expenseId);
    if (!expense) throw new ConvexError("Expense not found");

    if (expense.submittedBy === user._id) {
      throw new ConvexError("You cannot close your own expense");
    }

    if (expense.status !== "Submitted" && expense.status !== "UnderReview") {
      throw new ConvexError("Only Submitted or Under Review expenses can be closed");
    }

    if (!closeReason) throw new ConvexError("Close reason is required");
    validateCloseReason(closeReason);
    if (!closeComment || closeComment.length < 10) {
      throw new ConvexError("Close comment must be at least 10 characters");
    }
    validateStringLength(closeComment, "Close comment", 10, 2000);

    const now = Date.now();

    await ctx.db.patch(expenseId, {
      status: "Closed",
      closedBy: user._id,
      closedAt: now,
      closeReason,
      closeComment,
      updatedAt: now,
    });

    await writeHistory(ctx, {
      expenseId,
      changedBy: user._id,
      oldStatus: expense.status,
      newStatus: "Closed",
      comment: closeComment,
      versionNumber: expense.currentVersion,
    });
  },
});
