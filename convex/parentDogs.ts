import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all parent dogs
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("parent_dogs").collect();
  },
});

// Get active parent dogs
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("parent_dogs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Get a single parent dog by ID
export const get = query({
  args: { id: v.id("parent_dogs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get parent dogs by gender
export const listByGender = query({
  args: { gender: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("parent_dogs")
      .withIndex("by_gender", (q) => q.eq("gender", args.gender))
      .collect();
  },
});

// Create a new parent dog
export const create = mutation({
  args: {
    name: v.string(),
    registered_name: v.optional(v.string()),
    color: v.optional(v.string()),
    gender: v.string(),
    date_of_birth: v.optional(v.string()),
    description: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    status: v.string(),
    health_testing: v.optional(v.string()),
    achievements: v.optional(v.string()),
    pedigree: v.optional(v.string()),
    microchip_id: v.optional(v.string()),
    registration_number: v.optional(v.string()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("parent_dogs", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update a parent dog
export const update = mutation({
  args: {
    id: v.id("parent_dogs"),
    name: v.optional(v.string()),
    registered_name: v.optional(v.string()),
    color: v.optional(v.string()),
    gender: v.optional(v.string()),
    date_of_birth: v.optional(v.string()),
    description: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    health_testing: v.optional(v.string()),
    achievements: v.optional(v.string()),
    pedigree: v.optional(v.string()),
    microchip_id: v.optional(v.string()),
    registration_number: v.optional(v.string()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
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

// Delete a parent dog
export const remove = mutation({
  args: { id: v.id("parent_dogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
