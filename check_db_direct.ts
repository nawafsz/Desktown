
import * as dotenv from "dotenv";
dotenv.config();
import { pool } from "./server/db";

async function check() {
  console.log("Checking connection...");
  try {
    const res = await pool.query("SELECT current_database(), current_user, version()");
    console.log("Connected to:", res.rows[0]);
    
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `);
    console.log("Tables found:", tables.rows);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await pool.end();
  }
}

check();
