import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users for the CMS
  admin_users: defineTable({
    username: v.string(),
    password: v.string(), // Note: In production, use proper auth
    email: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    role: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    last_login_at: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_username", ["username"]),

  // Customer information
  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    last_contact_date: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Gallery photos
  gallery_photos: defineTable({
    filename: v.string(),
    url: v.string(),
    caption: v.optional(v.string()),
    is_public: v.optional(v.boolean()),
    uploaded_by: v.optional(v.string()),
    uploader_name: v.optional(v.string()),
    uploader_email: v.optional(v.string()),
    puppy_name: v.optional(v.string()),
    parent_dam: v.optional(v.string()),
    parent_sire: v.optional(v.string()),
    age_description: v.optional(v.string()),
    photo_type: v.optional(v.string()),
    related_photo_id: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_photo_type", ["photo_type"])
    .index("by_is_public", ["is_public"]),

  // Customer inquiries
  inquiries: defineTable({
    customer_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.optional(v.string()),
    puppy_interest: v.optional(v.string()),
    status: v.optional(v.string()), // 'new', 'contacted', 'resolved', 'closed'
    response: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_email", ["email"]),

  // Litters (puppy litters)
  litters: defineTable({
    name: v.string(),
    date_of_birth: v.optional(v.string()),
    dam_id: v.optional(v.string()),
    sire_id: v.optional(v.string()),
    description: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_is_active", ["is_active"]),

  // Parent dogs (breeding dogs)
  parent_dogs: defineTable({
    name: v.string(),
    registered_name: v.optional(v.string()),
    color: v.optional(v.string()),
    gender: v.string(), // 'male' or 'female'
    date_of_birth: v.optional(v.string()),
    description: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    status: v.string(), // 'active', 'retired', etc.
    health_testing: v.optional(v.string()),
    achievements: v.optional(v.string()),
    pedigree: v.optional(v.string()),
    microchip_id: v.optional(v.string()),
    registration_number: v.optional(v.string()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_gender", ["gender"])
    .index("by_status", ["status"]),

  // Puppies
  puppies: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    gender: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()), // 'available', 'reserved', 'sold'
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
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_litter_id", ["litter_id"]),
});
