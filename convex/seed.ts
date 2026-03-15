import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { createAccount } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const CATEGORIES = [
  { name: "Travel", description: "Flights, trains, buses for business purposes" },
  { name: "Accommodation", description: "Hotels and short-term lodging" },
  { name: "Meals & Entertainment", description: "Client lunches, team dinners, business meals" },
  { name: "Transportation", description: "Taxis, rideshares, fuel, parking" },
  { name: "Software & Subscriptions", description: "Tools, licenses, SaaS subscriptions" },
  { name: "Office Supplies", description: "Hardware accessories, stationery" },
  { name: "Other", description: "Expenses not covered by other categories" },
] as const;

const TEST_ACCOUNTS = [
  {
    firstName: "Miles",
    lastName: "Morales",
    email: "miles@employee.dev",
    password: "MilesEmployee@2026!",
    role: "employee" as const,
  },
  {
    firstName: "Peter",
    lastName: "Parker",
    email: "peter@employee.dev",
    password: "PeterEmployee@2026!",
    role: "employee" as const,
  },
  {
    firstName: "Jack",
    lastName: "Black",
    email: "jack@manager.dev",
    password: "JackManager@2026!",
    role: "manager" as const,
  },
  {
    firstName: "Mike",
    lastName: "Tyson",
    email: "mike@manager.dev",
    password: "MikeManager@2026!",
    role: "manager" as const,
  },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

export const seedCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const category of CATEGORIES) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", category.name))
        .unique();
      if (!existing) {
        await ctx.db.insert("categories", {
          name: category.name,
          description: category.description,
        });
      }
    }
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const patchUserRole = internalMutation({
  args: { email: v.string(), role: v.union(v.literal("employee"), v.literal("manager")) },
  handler: async (ctx, { email, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (user) {
      await ctx.db.patch(user._id, { role });
    }
  },
});

// ── Main Seed Action ──────────────────────────────────────────────────────────

/**
 * Seed categories and test user accounts with working passwords.
 * Idempotent — safe to run multiple times.
 *
 * Usage:
 *   npx convex run seed:seed        # dev
 *   npx convex run seed:seed --prod # production
 */
export const seed = internalAction({
  args: {},
  handler: async (ctx) => {
    // Seed categories
    await ctx.runMutation(internal.seed.seedCategories, {});

    // Seed test accounts
    for (const account of TEST_ACCOUNTS) {
      const existing = await ctx.runQuery(internal.seed.getUserByEmail, {
        email: account.email,
      });

      if (existing) {
        console.log(`Skipping ${account.email} — already exists`);
        continue;
      }

      await createAccount(ctx, {
        provider: "password",
        account: {
          id: account.email,
          secret: account.password,
        },
        profile: {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          role: "employee" as const, // profile() hardcodes employee; patch managers below
          createdAt: Date.now(),
        },
      });

      // Patch role for managers (Password provider profile() always returns "employee")
      if (account.role === "manager") {
        await ctx.runMutation(internal.seed.patchUserRole, {
          email: account.email,
          role: "manager",
        });
      }

      console.log(`Created ${account.email} (${account.role})`);
    }

    return { success: true, message: "Seed complete" };
  },
});

export default seed;
