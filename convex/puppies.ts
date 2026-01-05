import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all puppies
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("puppies").collect();
  },
});

// Get available puppies
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("puppies")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();
  },
});

// Get puppies by litter
export const listByLitter = query({
  args: { litterId: v.id("litters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("puppies")
      .withIndex("by_litter_id", (q) => q.eq("litter_id", args.litterId))
      .collect();
  },
});

// Get a single puppy by ID
export const get = query({
  args: { id: v.id("puppies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new puppy
export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    gender: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    parent_dam: v.optional(v.string()),
    parent_sire: v.optional(v.string()),
    parent_dam_id: v.optional(v.id("parent_dogs")),
    parent_sire_id: v.optional(v.id("parent_dogs")),
    health_testing: v.optional(v.string()),
    microchip_id: v.optional(v.string()),
    litter_name: v.optional(v.string()),
    litter_date_of_birth: v.optional(v.string()),
    litter_id: v.optional(v.id("litters")),
    price_min: v.optional(v.number()),
    price_max: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("puppies", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update a puppy
export const update = mutation({
  args: {
    id: v.id("puppies"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    gender: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    parent_dam: v.optional(v.string()),
    parent_sire: v.optional(v.string()),
    parent_dam_id: v.optional(v.id("parent_dogs")),
    parent_sire_id: v.optional(v.id("parent_dogs")),
    health_testing: v.optional(v.string()),
    microchip_id: v.optional(v.string()),
    litter_name: v.optional(v.string()),
    litter_date_of_birth: v.optional(v.string()),
    litter_id: v.optional(v.id("litters")),
    price_min: v.optional(v.number()),
    price_max: v.optional(v.number()),
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

// Delete a puppy
export const remove = mutation({
  args: { id: v.id("puppies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
