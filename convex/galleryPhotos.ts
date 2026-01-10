import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to check if a string is a Convex storage ID
const isStorageId = (url: string) => {
  // Convex storage IDs are alphanumeric strings without slashes or dots
  return /^[a-z0-9]{20,}$/i.test(url);
};

// Get all public gallery photos with resolved URLs
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const photos = await ctx.db
      .query("gallery_photos")
      .withIndex("by_is_public", (q) => q.eq("is_public", true))
      .collect();

    // Resolve storage IDs to URLs
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        let imageUrl = photo.url;
        if (photo.url && isStorageId(photo.url)) {
          try {
            const url = await ctx.storage.getUrl(photo.url as any);
            if (url) imageUrl = url;
          } catch {
            // Keep original URL if storage lookup fails
          }
        }
        return { ...photo, imageUrl };
      })
    );

    return photosWithUrls;
  },
});

// Get all gallery photos (for admin) with resolved URLs
export const list = query({
  args: {},
  handler: async (ctx) => {
    const photos = await ctx.db.query("gallery_photos").collect();

    // Resolve storage IDs to URLs
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        let imageUrl = photo.url;
        if (photo.url && isStorageId(photo.url)) {
          try {
            const url = await ctx.storage.getUrl(photo.url as any);
            if (url) imageUrl = url;
          } catch {
            // Keep original URL if storage lookup fails
          }
        }
        return { ...photo, imageUrl };
      })
    );

    return photosWithUrls;
  },
});

// Get photos by type
export const listByType = query({
  args: { photo_type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gallery_photos")
      .withIndex("by_photo_type", (q) => q.eq("photo_type", args.photo_type))
      .collect();
  },
});

// Get a single photo by ID
export const get = query({
  args: { id: v.id("gallery_photos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new gallery photo
export const create = mutation({
  args: {
    filename: v.string(),
    url: v.string(),
    caption: v.optional(v.string()),
    is_public: v.boolean(),
    uploaded_by: v.optional(v.string()),
    uploader_name: v.optional(v.string()),
    uploader_email: v.optional(v.string()),
    puppy_name: v.optional(v.string()),
    parent_dam: v.optional(v.string()),
    parent_sire: v.optional(v.string()),
    age_description: v.optional(v.string()),
    photo_type: v.optional(v.string()),
    related_photo_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("gallery_photos", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update a gallery photo
export const update = mutation({
  args: {
    id: v.id("gallery_photos"),
    filename: v.optional(v.string()),
    url: v.optional(v.string()),
    caption: v.optional(v.string()),
    is_public: v.optional(v.boolean()),
    puppy_name: v.optional(v.string()),
    parent_dam: v.optional(v.string()),
    parent_sire: v.optional(v.string()),
    age_description: v.optional(v.string()),
    photo_type: v.optional(v.string()),
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

// Delete a gallery photo
export const remove = mutation({
  args: { id: v.id("gallery_photos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
