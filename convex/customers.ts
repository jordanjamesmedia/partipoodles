import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all customers
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").collect();
  },
});

// Get customer by ID
export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get customer by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Create customer
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("customers", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update customer
export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    last_contact_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  },
});
