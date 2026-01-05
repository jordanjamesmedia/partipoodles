import {
  users,
  adminUsers,
  puppies,
  inquiries,
  customers,
  galleryPhotos,
  parentDogs,
  litters,
  type User,
  type UpsertUser,
  type AdminUser,
  type InsertAdminUser,
  type Puppy,
  type InsertPuppy,
  type ParentDog,
  type InsertParentDog,
  type Litter,
  type InsertLitter,
  type Inquiry,
  type InsertInquiry,
  type Customer,
  type InsertCustomer,
  type GalleryPhoto,
  type InsertGalleryPhoto,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Puppy operations
  getAllPuppies(): Promise<Puppy[]>;
  getAvailablePuppies(): Promise<Puppy[]>;
  getPuppy(id: string): Promise<Puppy | undefined>;
  createPuppy(puppy: InsertPuppy): Promise<Puppy>;
  updatePuppy(id: string, puppy: Partial<InsertPuppy>): Promise<Puppy>;
  deletePuppy(id: string): Promise<void>;
  
  // Parent dog operations
  getAllParentDogs(): Promise<ParentDog[]>;
  getActiveParentDogs(): Promise<ParentDog[]>;
  getParentDog(id: string): Promise<ParentDog | undefined>;
  createParentDog(parentDog: InsertParentDog): Promise<ParentDog>;
  updateParentDog(id: string, parentDog: Partial<InsertParentDog>): Promise<ParentDog>;
  deleteParentDog(id: string): Promise<void>;
  addParentDogPhoto(id: string, photoPath: string): Promise<ParentDog>;
  
  // Litter operations
  getAllLitters(): Promise<Litter[]>;
  getActiveLitters(): Promise<Litter[]>;
  getLitter(id: string): Promise<Litter | undefined>;
  createLitter(litter: InsertLitter): Promise<Litter>;
  updateLitter(id: string, litter: Partial<InsertLitter>): Promise<Litter>;
  deleteLitter(id: string): Promise<void>;
  
  // Inquiry operations
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, inquiry: Partial<Inquiry>): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<void>;
  
  // Customer operations
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  
  // Gallery operations
  getAllGalleryPhotos(): Promise<GalleryPhoto[]>;
  getPublicGalleryPhotos(): Promise<GalleryPhoto[]>;
  getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined>;
  createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
  updateGalleryPhoto(id: string, photo: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto>;
  deleteGalleryPhoto(id: string): Promise<void>;
  
  // Statistics
  getStatistics(): Promise<{
    availablePuppies: number;
    pendingInquiries: number;
    totalCustomers: number;
    galleryPhotos: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Puppy operations
  async getAllPuppies(): Promise<Puppy[]> {
    return db.select({
      id: puppies.id,
      name: puppies.name,
      color: puppies.color,
      gender: puppies.gender,
      description: puppies.description,
      priceMin: puppies.priceMin,
      priceMax: puppies.priceMax,
      status: puppies.status,
      photos: puppies.photos,
      litterId: puppies.litterId,
      parentDamId: puppies.parentDamId,
      parentSireId: puppies.parentSireId,
      litterName: litters.name,
      litterDateOfBirth: litters.dateOfBirth,
      parentDam: puppies.parentDam,
      parentSire: puppies.parentSire,
      healthTesting: puppies.healthTesting,
      microchipId: puppies.microchipId,
      createdAt: puppies.createdAt,
      updatedAt: puppies.updatedAt,
    })
    .from(puppies)
    .leftJoin(litters, eq(puppies.litterId, litters.id))
    .orderBy(desc(puppies.createdAt));
  }

  async getAvailablePuppies(): Promise<Puppy[]> {
    return db.select({
      id: puppies.id,
      name: puppies.name,
      color: puppies.color,
      gender: puppies.gender,
      description: puppies.description,
      priceMin: puppies.priceMin,
      priceMax: puppies.priceMax,
      status: puppies.status,
      photos: puppies.photos,
      litterId: puppies.litterId,
      parentDamId: puppies.parentDamId,
      parentSireId: puppies.parentSireId,
      litterName: litters.name,
      litterDateOfBirth: litters.dateOfBirth,
      parentDam: puppies.parentDam,
      parentSire: puppies.parentSire,
      healthTesting: puppies.healthTesting,
      microchipId: puppies.microchipId,
      createdAt: puppies.createdAt,
      updatedAt: puppies.updatedAt,
    })
    .from(puppies)
    .leftJoin(litters, eq(puppies.litterId, litters.id))
    .where(eq(puppies.status, 'available'))
    .orderBy(desc(puppies.createdAt));
  }

  async getPuppy(id: string): Promise<Puppy | undefined> {
    const [puppy] = await db.select().from(puppies).where(eq(puppies.id, id));
    return puppy;
  }

  async createPuppy(puppy: InsertPuppy): Promise<Puppy> {
    const [newPuppy] = await db.insert(puppies).values(puppy).returning();
    return newPuppy;
  }

  async updatePuppy(id: string, puppy: Partial<InsertPuppy>): Promise<Puppy> {
    const [updatedPuppy] = await db
      .update(puppies)
      .set({ ...puppy, updatedAt: new Date() })
      .where(eq(puppies.id, id))
      .returning();
    return updatedPuppy;
  }

  async deletePuppy(id: string): Promise<void> {
    await db.delete(puppies).where(eq(puppies.id, id));
  }

  // Parent dog operations
  async getAllParentDogs(): Promise<ParentDog[]> {
    return db.select().from(parentDogs).orderBy(desc(parentDogs.createdAt));
  }

  async getActiveParentDogs(): Promise<ParentDog[]> {
    return db.select().from(parentDogs)
      .where(eq(parentDogs.status, 'active'))
      .orderBy(parentDogs.name);
  }

  async getParentDog(id: string): Promise<ParentDog | undefined> {
    const [parentDog] = await db.select().from(parentDogs).where(eq(parentDogs.id, id));
    return parentDog;
  }

  async createParentDog(parentDog: InsertParentDog): Promise<ParentDog> {
    const [newParentDog] = await db.insert(parentDogs).values(parentDog).returning();
    return newParentDog;
  }

  async updateParentDog(id: string, parentDog: Partial<InsertParentDog>): Promise<ParentDog> {
    const [updatedParentDog] = await db
      .update(parentDogs)
      .set({ ...parentDog, updatedAt: new Date() })
      .where(eq(parentDogs.id, id))
      .returning();
    return updatedParentDog;
  }

  async deleteParentDog(id: string): Promise<void> {
    await db.delete(parentDogs).where(eq(parentDogs.id, id));
  }

  async addParentDogPhoto(id: string, photoPath: string): Promise<ParentDog> {
    const parentDog = await this.getParentDog(id);
    if (!parentDog) {
      throw new Error('Parent dog not found');
    }

    const currentPhotos = parentDog.photos || [];
    const updatedPhotos = [...currentPhotos, photoPath];

    const [updated] = await db
      .update(parentDogs)
      .set({ photos: updatedPhotos, updatedAt: new Date() })
      .where(eq(parentDogs.id, id))
      .returning();
    
    return updated;
  }

  // Litter operations  
  async getAllLitters(): Promise<any[]> {
    // Get litters with parent information using separate queries for simplicity
    const baseLitters = await db
      .select()
      .from(litters)
      .where(eq(litters.isActive, true))
      .orderBy(desc(litters.dateOfBirth));
      
    // Enhance each litter with parent information
    const littersWithParents = await Promise.all(
      baseLitters.map(async (litter) => {
        let damName = null, damColor = null, sireName = null, sireColor = null;
        
        if (litter.damId) {
          const [dam] = await db.select().from(parentDogs).where(eq(parentDogs.id, litter.damId));
          if (dam) {
            damName = dam.name;
            damColor = dam.color;
          }
        }
        
        if (litter.sireId) {
          const [sire] = await db.select().from(parentDogs).where(eq(parentDogs.id, litter.sireId));
          if (sire) {
            sireName = sire.name;
            sireColor = sire.color;
          }
        }
        
        return {
          ...litter,
          damName,
          damColor,
          sireName,
          sireColor
        };
      })
    );
    
    return littersWithParents;
  }

  async getActiveLitters(): Promise<Litter[]> {
    return db.select().from(litters)
      .where(eq(litters.isActive, true))
      .orderBy(desc(litters.dateOfBirth));
  }

  async getLitter(id: string): Promise<Litter | undefined> {
    const [litter] = await db.select().from(litters).where(eq(litters.id, id));
    return litter;
  }

  async createLitter(litter: InsertLitter): Promise<Litter> {
    const [newLitter] = await db.insert(litters).values(litter).returning();
    return newLitter;
  }

  async updateLitter(id: string, litter: Partial<InsertLitter>): Promise<Litter> {
    const [updatedLitter] = await db
      .update(litters)
      .set({ ...litter, updatedAt: new Date() })
      .where(eq(litters.id, id))
      .returning();
    return updatedLitter;
  }

  async deleteLitter(id: string): Promise<void> {
    await db.delete(litters).where(eq(litters.id, id));
  }

  // Inquiry operations
  async getAllInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateInquiry(id: string, inquiry: Partial<Inquiry>): Promise<Inquiry> {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({ ...inquiry, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Gallery operations
  async getAllGalleryPhotos(): Promise<GalleryPhoto[]> {
    return db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt));
  }

  async getPublicGalleryPhotos(): Promise<GalleryPhoto[]> {
    return db.select().from(galleryPhotos)
      .where(eq(galleryPhotos.isPublic, true))
      .orderBy(desc(galleryPhotos.createdAt));
  }

  async getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined> {
    const [photo] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
    return photo;
  }

  async createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto> {
    const [newPhoto] = await db.insert(galleryPhotos).values(photo).returning();
    return newPhoto;
  }

  async updateGalleryPhoto(id: string, photo: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto> {
    const [updatedPhoto] = await db.update(galleryPhotos)
      .set(photo)
      .where(eq(galleryPhotos.id, id))
      .returning();
    return updatedPhoto;
  }

  async deleteGalleryPhoto(id: string): Promise<void> {
    await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  }

  // Admin user operations
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(admin).returning();
    return newAdmin;
  }

  async updateAdminUser(id: string, admin: Partial<AdminUser>): Promise<AdminUser> {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set({ ...admin, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return updatedAdmin;
  }

  async updateAdminProfile(id: string, profile: { firstName?: string; lastName?: string; email?: string; profileImageUrl?: string }): Promise<AdminUser> {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return updatedAdmin;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  // Statistics
  async getStatistics() {
    const [availablePuppiesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(puppies)
      .where(eq(puppies.status, 'available'));

    const [pendingInquiriesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inquiries)
      .where(eq(inquiries.status, 'pending'));

    const [totalCustomersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers);

    const [galleryPhotosResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(galleryPhotos);

    return {
      availablePuppies: availablePuppiesResult?.count || 0,
      pendingInquiries: pendingInquiriesResult?.count || 0,
      totalCustomers: totalCustomersResult?.count || 0,
      galleryPhotos: galleryPhotosResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
