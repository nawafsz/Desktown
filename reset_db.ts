
import * as dotenv from "dotenv";
dotenv.config();

import { pool } from "./server/db";

async function reset() {
  console.log("Resetting database...");
  try {
    // Drop public schema and recreate it to wipe all data/tables
    await pool.query("DROP SCHEMA public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.query("GRANT ALL ON SCHEMA public TO postgres");
    await pool.query("GRANT ALL ON SCHEMA public TO public");
    console.log("Database reset successful (public schema recreated).");
  } catch (err) {
    console.error("Error resetting database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

reset();
