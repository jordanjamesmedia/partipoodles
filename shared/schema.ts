import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const puppyStatusEnum = pgEnum('puppy_status', ['available', 'reserved', 'sold']);
export const puppyGenderEnum = pgEnum('puppy_gender', ['male', 'female']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['pending', 'responded', 'resolved']);
export const customerStatusEnum = pgEnum('customer_status', ['prospective', 'current', 'past']);
export const parentStatusEnum = pgEnum('parent_status', ['active', 'retired', 'planned']);
export const adminRoleEnum = pgEnum('admin_role', ['admin', 'superadmin']);

// Admin users table for simple admin system
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // In production, this should be hashed
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: adminRoleEnum("role").notNull().default('admin'),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parent dogs table
export const parentDogs = pgTable("parent_dogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  registeredName: varchar("registered_name"),
  color: varchar("color").notNull(),
  gender: puppyGenderEnum("gender").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  description: text("description"),
  photos: text("photos").array().default([]), // Array of photo URLs
  status: parentStatusEnum("status").notNull().default('active'),
  healthTesting: text("health_testing"),
  achievements: text("achievements"), // Show titles, awards, etc.
  pedigree: text("pedigree"), // Lineage information
  microchipId: varchar("microchip_id"),
  registrationNumber: varchar("registration_number"),
  weight: integer("weight"), // in grams
  height: integer("height"), // in cm
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Litters table
export const litters = pgTable("litters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "Pippa x Po Litter", "Spring 2024 Litter"
  dateOfBirth: timestamp("date_of_birth").notNull(),
  damId: varchar("dam_id").references(() => parentDogs.id),
  sireId: varchar("sire_id").references(() => parentDogs.id),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Puppies table
export const puppies = pgTable("puppies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  color: varchar("color").notNull(),
  gender: puppyGenderEnum("gender").notNull(),
  // dateOfBirth removed - now derived from litter
  description: text("description"),
  priceMin: integer("price_min"), // minimum price in cents
  priceMax: integer("price_max"), // maximum price in cents
  status: puppyStatusEnum("status").notNull().default('available'),
  photos: text("photos").array().default([]), // Array of photo URLs
  litterId: varchar("litter_id").references(() => litters.id).notNull(), // Now required - every puppy must have a litter
  parentDamId: varchar("parent_dam_id").references(() => parentDogs.id),
  parentSireId: varchar("parent_sire_id").references(() => parentDogs.id),
  // Keep legacy fields temporarily for migration
  litterName: varchar("litter_name"), // e.g., "Pippa x Po Litter", "Spring 2024 Litter"
  litterDateOfBirth: timestamp("litter_date_of_birth"), // When the litter was born (can be same as individual puppy DOB)
  // Keep legacy fields temporarily for migration
  parentDam: varchar("parent_dam"),
  parentSire: varchar("parent_sire"),
  healthTesting: text("health_testing"),
  microchipId: varchar("microchip_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer inquiries table
export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: varchar("customer_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  message: text("message").notNull(),
  puppyInterest: varchar("puppy_interest"), // Specific puppy they're interested in
  status: inquiryStatusEnum("status").notNull().default('pending'),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table for CRM
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  location: varchar("location"),
  status: customerStatusEnum("status").notNull().default('prospective'),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gallery photos table
export const galleryPhotos = pgTable("gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename").notNull(),
  url: varchar("url").notNull(),
  caption: text("caption"),
  isPublic: boolean("is_public").notNull().default(false),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploaderName: varchar("uploader_name"), // For public uploads without user accounts
  uploaderEmail: varchar("uploader_email"), // For public uploads without user accounts
  puppyName: varchar("puppy_name"), // For public uploads
  parentDam: varchar("parent_dam").references(() => parentDogs.id), // Dam (mother) selection
  parentSire: varchar("parent_sire").references(() => parentDogs.id), // Sire (father) selection
  ageDescription: varchar("age_description"), // Age when photo was taken (e.g., "8 weeks old", "6 months old", "Adult")
  photoType: varchar("photo_type").default("single"), // "single", "before", "after" for before/after comparisons
  relatedPhotoId: varchar("related_photo_id"), // For linking before/after photos together
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const littersRelations = relations(litters, ({ one, many }) => ({
  dam: one(parentDogs, {
    fields: [litters.damId],
    references: [parentDogs.id],
    relationName: 'litterDam',
  }),
  sire: one(parentDogs, {
    fields: [litters.sireId],
    references: [parentDogs.id],
    relationName: 'litterSire',
  }),
  puppies: many(puppies),
}));

export const puppiesRelations = relations(puppies, ({ one }) => ({
  dam: one(parentDogs, {
    fields: [puppies.parentDamId],
    references: [parentDogs.id],
    relationName: 'dam',
  }),
  sire: one(parentDogs, {
    fields: [puppies.parentSireId],
    references: [parentDogs.id],
    relationName: 'sire',
  }),
  litter: one(litters, {
    fields: [puppies.litterId],
    references: [litters.id],
  }),
}));

export const parentDogsRelations = relations(parentDogs, ({ many }) => ({
  offspringAsDam: many(puppies, { relationName: 'dam' }),
  offspringAsSire: many(puppies, { relationName: 'sire' }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  puppy: one(puppies, {
    fields: [inquiries.puppyInterest],
    references: [puppies.id],
  }),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({ one }) => ({
  uploader: one(users, {
    fields: [galleryPhotos.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPuppySchema = createInsertSchema(puppies, {
  litterDateOfBirth: z.coerce.date().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertLitterSchema = createInsertSchema(litters, {
  dateOfBirth: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParentDogSchema = createInsertSchema(parentDogs, {
  dateOfBirth: z.coerce.date().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Puppy = typeof puppies.$inferSelect;
export type InsertPuppy = z.infer<typeof insertPuppySchema>;
export type Litter = typeof litters.$inferSelect;
export type InsertLitter = z.infer<typeof insertLitterSchema>;
export type ParentDog = typeof parentDogs.$inferSelect;
export type InsertParentDog = z.infer<typeof insertParentDogSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
