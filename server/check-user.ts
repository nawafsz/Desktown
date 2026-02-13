
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
  console.log("Checking user tech_nawaf...");
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, "tech_nawaf"),
    });

    if (user) {
      console.log("User found:");
      console.log("ID:", user.id);
      console.log("Username:", user.username);
      console.log("Password (stored):", user.password);
      console.log("Role:", user.role);
    } else {
      console.log("User 'tech_nawaf' NOT found.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error querying database:", error);
    process.exit(1);
  }
}

checkUser();
