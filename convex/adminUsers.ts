import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get admin user by username (for login)
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    return user;
  },
});

// Get all admin users
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_users").collect();
  },
});

// Get admin user by ID
export const get = query({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update last login
export const updateLastLogin = mutation({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      last_login_at: new Date().toISOString(),
    });
  },
});
