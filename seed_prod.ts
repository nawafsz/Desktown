
import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "./server/db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as schema from "./shared/schema";
import { eq } from "drizzle-orm";

const db = drizzle(pool, { schema });
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding production data...");

  try {
    // 1. Create Admin User
    console.log("Creating Admin user...");
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.username, "Admin"),
    });

    let adminId;
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("Majed119");
      const [admin] = await db.insert(schema.users).values({
        username: "Admin",
        email: "admin@desktown.local",
        password: hashedPassword,
        role: "super_admin",
        firstName: "System",
        lastName: "Admin",
        status: "online",
        profileImageUrl: `https://ui-avatars.com/api/?name=Admin&background=random`,
      }).returning();
      adminId = admin.id;
      console.log("Admin user created.");
    } else {
      adminId = existingAdmin.id;
      console.log("Admin user already exists.");
    }

    // 2. Create Departments (if any)
    // 3. Create initial Offices (Storefronts)
    console.log("Creating initial offices...");
    const [office1] = await db.insert(schema.offices).values({
      name: "Main HQ",
      slug: "main-hq",
      description: "The main headquarters office.",
      ownerId: adminId,
      isPublished: true,
      approvalStatus: "approved",
      category: "general",
    }).returning();
    
    // 4. Create sample advertisement
    await db.insert(schema.advertisements).values({
      userId: adminId,
      title: "Welcome to DeskTown",
      description: "Your all-in-one workspace solution.",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      linkUrl: "/auth",
    });

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await pool.end();
  }
}

seed();
