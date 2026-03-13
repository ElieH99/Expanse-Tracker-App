import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the current authenticated user's full profile.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return user;
  },
});

/**
 * Get a user by ID — used for resolving names in history/detail views.
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new ConvexError("You must be logged in to perform this action");

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  },
});

/**
 * List all users — manager only, used for filter dropdowns.
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in to perform this action");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    if (user.role !== "manager") {
      throw new ConvexError("You do not have permission to view all users");
    }

    return await ctx.db.query("users").collect();
  },
});
