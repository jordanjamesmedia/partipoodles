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

// Login mutation - validates credentials and returns user if valid
export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    if (user.password !== args.password) {
      return { success: false, message: "Invalid credentials" };
    }

    if (user.is_active === false) {
      return { success: false, message: "Account is disabled" };
    }

    // Update last login time
    await ctx.db.patch(user._id, {
      last_login_at: new Date().toISOString(),
    });

    return {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  },
});

// Seed default admin user - run this from Convex Dashboard if no admin exists
export const seedDefaultAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any admin exists
    const existingAdmins = await ctx.db.query("admin_users").collect();

    if (existingAdmins.length > 0) {
      return {
        success: false,
        message: `Admin users already exist (${existingAdmins.length} found). Use forceCreateAdmin instead.`,
        existingUsers: existingAdmins.map(u => ({ username: u.username, is_active: u.is_active }))
      };
    }

    const now = new Date().toISOString();
    const id = await ctx.db.insert("admin_users", {
      username: "admin",
      password: "PartipoodlesAdmin2024!",
      email: "admin@partipoodlesaustralia.com",
      first_name: "Admin",
      last_name: "User",
      role: "superadmin",
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      message: "Default admin created",
      credentials: {
        username: "admin",
        password: "PartipoodlesAdmin2024!"
      },
      id
    };
  },
});

// Force create a new working admin - use if existing admins don't work
export const forceCreateAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const id = await ctx.db.insert("admin_users", {
      username: "superadmin",
      password: "Poodles2024!",
      email: "superadmin@partipoodlesaustralia.com",
      first_name: "Super",
      last_name: "Admin",
      role: "superadmin",
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      message: "New admin created successfully",
      credentials: {
        username: "superadmin",
        password: "Poodles2024!"
      },
      id
    };
  },
});

// Create admin user (for seeding)
export const create = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    email: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      return { success: false, message: "Username already exists", user: existing };
    }

    const now = new Date().toISOString();
    const id = await ctx.db.insert("admin_users", {
      username: args.username,
      password: args.password,
      email: args.email,
      first_name: args.first_name,
      last_name: args.last_name,
      role: args.role || "admin",
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return { success: true, id };
  },
});
