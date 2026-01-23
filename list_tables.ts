
import * as dotenv from "dotenv";
dotenv.config();

async function check() {
  const { pool } = await import("./server/db");
  console.log("Checking ALL tables in database...");
  try {
    const res = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `);
    console.log("Found tables:", JSON.stringify(res.rows, null, 2));
    
    const searchPath = await pool.query("SHOW search_path");
    console.log("Current search_path:", searchPath.rows[0].search_path);

  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
}

check();
