import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all inquiries (for admin)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inquiries").order("desc").collect();
  },
});

// Get inquiries by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inquiries")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get new inquiries count
export const countNew = query({
  args: {},
  handler: async (ctx) => {
    const newInquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
    return newInquiries.length;
  },
});

// Get a single inquiry by ID
export const get = query({
  args: { id: v.id("inquiries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new inquiry (from contact form)
export const create = mutation({
  args: {
    customer_name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    puppy_interest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "new",
      created_at: now,
      updated_at: now,
    });
  },
});

// Update inquiry status
export const updateStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.string(),
    response: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, status, response } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      status,
      response,
      updated_at: now,
    });
  },
});

// Delete an inquiry
export const remove = mutation({
  args: { id: v.id("inquiries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
