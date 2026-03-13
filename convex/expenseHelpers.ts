import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get the authenticated user or throw.
 */
export async function getAuthenticatedUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("You must be logged in to perform this action");

  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User not found");

  return user;
}

/**
 * Append a row to expenseHistory. Called on every status transition.
 */
export async function writeHistory(
  ctx: any,
  entry: {
    expenseId: any;
    changedBy: any;
    oldStatus: string;
    newStatus: string;
    comment?: string;
    versionNumber: number;
  }
) {
  await ctx.db.insert("expenseHistory", {
    expenseId: entry.expenseId,
    changedBy: entry.changedBy,
    oldStatus: entry.oldStatus,
    newStatus: entry.newStatus,
    comment: entry.comment,
    versionNumber: entry.versionNumber,
    changedAt: Date.now(),
  });
}