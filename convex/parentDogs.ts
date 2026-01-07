import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to check if a string is a Convex storage ID
const isStorageId = (url: string) => {
  // Convex storage IDs are alphanumeric strings without slashes or dots
  return /^[a-z0-9]{20,}$/i.test(url);
};

// Helper to resolve photo URLs from storage IDs
const resolvePhotoUrls = async (ctx: any, photos: string[] | undefined) => {
  if (!photos || photos.length === 0) return [];

  const resolvedPhotos = await Promise.all(
    photos.map(async (photo) => {
      if (isStorageId(photo)) {
        try {
          const url = await ctx.storage.getUrl(photo as any);
          return url || photo;
        } catch {
          return photo;
        }
      }
      return photo;
    })
  );

  return resolvedPhotos;
};

// Get all parent dogs with resolved photo URLs
export const list = query({
  args: {},
  handler: async (ctx) => {
    const dogs = await ctx.db.query("parent_dogs").collect();

    // Resolve storage IDs to URLs for all dogs
    const dogsWithUrls = await Promise.all(
      dogs.map(async (dog) => {
        const resolvedPhotos = await resolvePhotoUrls(ctx, dog.photos);
        return { ...dog, photos: resolvedPhotos };
      })
    );

    return dogsWithUrls;
  },
});

// Get active parent dogs with resolved photo URLs
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const dogs = await ctx.db
      .query("parent_dogs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const dogsWithUrls = await Promise.all(
      dogs.map(async (dog) => {
        const resolvedPhotos = await resolvePhotoUrls(ctx, dog.photos);
        return { ...dog, photos: resolvedPhotos };
      })
    );

    return dogsWithUrls;
  },
});

// Get a single parent dog by ID with resolved photo URLs
export const get = query({
  args: { id: v.id("parent_dogs") },
  handler: async (ctx, args) => {
    const dog = await ctx.db.get(args.id);
    if (!dog) return null;

    const resolvedPhotos = await resolvePhotoUrls(ctx, dog.photos);
    return { ...dog, photos: resolvedPhotos };
  },
});

// Get parent dogs by gender with resolved photo URLs
export const listByGender = query({
  args: { gender: v.string() },
  handler: async (ctx, args) => {
    const dogs = await ctx.db
      .query("parent_dogs")
      .withIndex("by_gender", (q) => q.eq("gender", args.gender))
      .collect();

    const dogsWithUrls = await Promise.all(
      dogs.map(async (dog) => {
        const resolvedPhotos = await resolvePhotoUrls(ctx, dog.photos);
        return { ...dog, photos: resolvedPhotos };
      })
    );

    return dogsWithUrls;
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
