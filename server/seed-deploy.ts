
import { db } from "./db_postgres";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("🌱 Starting database seed/reset...");

  try {
    const usersToCreate = [
      {
        username: "admin_naif",
        passwordRaw: "naif201667",
        role: "admin",
        firstName: "Naif",
        lastName: "Admin",
        email: "naif@desktown.com",
        department: "Management"
      },
      {
        username: "tech_nawaf",
        passwordRaw: "nawaf201667",
        role: "manager", // Support Manager
        firstName: "Nawaf",
        lastName: "Tech",
        email: "nawaf@desktown.com",
        department: "Technical Support"
      },
      {
        username: "admin_majed",
        passwordRaw: "majed201667",
        role: "admin",
        firstName: "Majed",
        lastName: "Admin",
        email: "majed@desktown.com",
        department: "Management"
      }
    ];

    // 1. Upsert specific users (Safer than full wipe on unstable connection)
    console.log("🔄 Upserting admin users...");
    
    for (const u of usersToCreate) {
      // Check if user exists
      const existing = await db.select().from(users).where(sql`username = ${u.username}`);
      
      if (existing.length > 0) {
        console.log(`   * Updating ${u.username}...`);
        await db.update(users).set({
          password: u.passwordRaw,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          department: u.department,
          status: "offline",
          updatedAt: new Date()
        }).where(sql`username = ${u.username}`);
      } else {
        console.log(`   + Creating ${u.username}...`);
        await db.insert(users).values({
          username: u.username,
          password: u.passwordRaw,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          department: u.department,
          status: "offline",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
