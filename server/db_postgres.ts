import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// For Supabase Transaction Pooler (port 6543)
// postgres.js handles IPv4/IPv6 and SSL better than node-postgres in some environments
const connectionString = process.env.DATABASE_URL;

// Create the connection
// We set 'prepare: false' because Supabase Transaction Pooler doesn't support prepared statements
export const sql = postgres(connectionString, { 
  prepare: false,
  ssl: {
    rejectUnauthorized: false
  },
  connect_timeout: 10,
  max: 20,
  idle_timeout: 20,
  onnotice: () => {} // Silence notice logs
});

console.log("[DB] Database connection initialized using postgres.js");

export const db = drizzle(sql, { schema, logger: true });
