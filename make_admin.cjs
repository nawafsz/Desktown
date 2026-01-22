
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log("Adding/Updating Admin user in database...");

        const query = `
      INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE 
      SET role = $6, status = $7, updated_at = NOW();
    `;

        await client.query(query, [
            'dev-user-id',
            'dev@desktown.local',
            'Admin',
            'User',
            'https://via.placeholder.com/150',
            'admin',
            'online'
        ]);

        console.log("Successfully set 'dev-user-id' as 'admin'.");
    } catch (err) {
        console.error("Error setting admin:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
