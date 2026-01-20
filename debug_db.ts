
import 'dotenv/config';
import { db } from './server/db'; // Adjust path if needed, assuming tsconfig paths work or relative
import { users } from './shared/schema';

async function main() {
    try {
        console.log("Attempting to query users...");
        const result = await db.select().from(users).limit(1);
        console.log("Query successful:", result);
        process.exit(0);
    } catch (error) {
        console.error("Query failed:", error);
        process.exit(1);
    }
}

main();
