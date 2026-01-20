
import "dotenv/config";
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Listing all tasks:");
        const res = await client.query('SELECT * FROM tasks');
        
        if (res.rows.length === 0) {
            console.log("No tasks found in the database.");
        } else {
            console.table(res.rows);
        }

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

main();
