
import "dotenv/config";
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log("Attempting to connect to database...");
    try {
        const client = await pool.connect();
        console.log("Successfully connected to database!");

        console.log("\nListing tables in 'public' schema:");
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        if (res.rows.length === 0) {
            console.log("No tables found.");
        } else {
            res.rows.forEach(row => {
                console.log(`- ${row.table_name}`);
            });
        }

        client.release();
    } catch (err) {
        console.error("Error connecting to database:", err);
    } finally {
        await pool.end();
    }
}

main();
