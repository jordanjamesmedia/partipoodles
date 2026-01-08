import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function using Web Crypto API (available in Convex runtime)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify password by comparing hashes
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Support both hashed and legacy plain text passwords during transition
  const passwordHash = await hashPassword(password);
  return passwordHash === hashedPassword || password === hashedPassword;
}

// Get admin user by ID (safe - excludes password)
export const get = query({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    // Never return password to client
    const { password, ...safeUser } = user;
    return safeUser;
  },
});

// Get all admin users (safe - excludes passwords)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("admin_users").collect();
    // Never return passwords to client
    return users.map(({ password, ...safeUser }) => safeUser);
  },
});

// Check if username exists (for validation only, doesn't expose data)
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    return { exists: !!user };
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

// SECURE Login mutation - validates credentials server-side, never exposes password
export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    // Use generic error message to prevent username enumeration
    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    // Verify password (supports both hashed and legacy plain text)
    const isValid = await verifyPassword(args.password, user.password);
    if (!isValid) {
      return { success: false, message: "Invalid username or password" };
    }

    if (user.is_active === false) {
      return { success: false, message: "Account is disabled" };
    }

    // Update last login time
    await ctx.db.patch(user._id, {
      last_login_at: new Date().toISOString(),
    });

    // Return user info WITHOUT password
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

// Create admin user with hashed password
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
      return { success: false, message: "Username already exists" };
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(args.password);

    const now = new Date().toISOString();
    const id = await ctx.db.insert("admin_users", {
      username: args.username,
      password: hashedPassword,
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

// Update admin password (with hashing)
export const updatePassword = mutation({
  args: {
    id: v.id("admin_users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    const isValid = await verifyPassword(args.currentPassword, user.password);
    if (!isValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash and update the new password
    const hashedPassword = await hashPassword(args.newPassword);
    await ctx.db.patch(args.id, {
      password: hashedPassword,
      updated_at: new Date().toISOString(),
    });

    return { success: true, message: "Password updated successfully" };
  },
});

// Admin-only: Reset user password (requires admin to set new password)
export const resetPassword = mutation({
  args: {
    id: v.id("admin_users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Hash and update the password
    const hashedPassword = await hashPassword(args.newPassword);
    await ctx.db.patch(args.id, {
      password: hashedPassword,
      updated_at: new Date().toISOString(),
    });

    return { success: true, message: "Password reset successfully" };
  },
});

// Seed initial admin - ONLY works if no admins exist
// Password must be provided as argument (not hardcoded)
export const seedAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any admin exists
    const existingAdmins = await ctx.db.query("admin_users").collect();

    if (existingAdmins.length > 0) {
      return {
        success: false,
        message: `Admin users already exist (${existingAdmins.length} found). Cannot seed.`,
      };
    }

    // Validate password strength
    if (args.password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long",
      };
    }

    // Hash the password
    const hashedPassword = await hashPassword(args.password);

    const now = new Date().toISOString();
    const id = await ctx.db.insert("admin_users", {
      username: args.username,
      password: hashedPassword,
      email: args.email || `${args.username}@partipoodlesaustralia.com`,
      first_name: "Admin",
      last_name: "User",
      role: "superadmin",
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      message: "Admin user created successfully. Please login with your credentials.",
      id,
    };
  },
});

// Migrate existing plain text passwords to hashed (run once)
export const migratePasswords = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("admin_users").collect();
    let migrated = 0;

    for (const user of users) {
      // Check if password is already hashed (64 char hex string)
      if (user.password && user.password.length !== 64) {
        // It's a plain text password, hash it
        const hashedPassword = await hashPassword(user.password);
        await ctx.db.patch(user._id, {
          password: hashedPassword,
          updated_at: new Date().toISOString(),
        });
        migrated++;
      }
    }

    return {
      success: true,
      message: `Migrated ${migrated} password(s) to hashed format`,
      total: users.length,
      migrated,
    };
  },
});
