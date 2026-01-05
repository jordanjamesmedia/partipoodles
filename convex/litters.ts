import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all litters
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("litters").collect();
  },
});

// Get active litters
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("litters")
      .withIndex("by_is_active", (q) => q.eq("is_active", true))
      .collect();
  },
});

// Get a single litter by ID
export const get = query({
  args: { id: v.id("litters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new litter
export const create = mutation({
  args: {
    name: v.string(),
    date_of_birth: v.optional(v.string()),
    dam_id: v.optional(v.string()),
    sire_id: v.optional(v.string()),
    description: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("litters", {
      ...args,
      is_active: args.is_active ?? true,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update a litter
export const update = mutation({
  args: {
    id: v.id("litters"),
    name: v.optional(v.string()),
    date_of_birth: v.optional(v.string()),
    dam_id: v.optional(v.string()),
    sire_id: v.optional(v.string()),
    description: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      ...updates,
      updated_at: now,
    });
  },
});

// Delete a litter
export const remove = mutation({
  args: { id: v.id("litters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
