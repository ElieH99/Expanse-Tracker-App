import { query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all expense categories, ordered by name.
 */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in to perform this action");

    return await ctx.db
      .query("categories")
      .withIndex("by_name")
      .collect();
  },
});
