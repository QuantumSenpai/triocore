import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { auth } from "../auth";
import { db } from "./index";
import { user, account } from "./schema";
import { eq, and } from "drizzle-orm";

const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@TrioCore2026!";

const admins = [
  {
    email: "krishnenduadak1582005@gmail.com",
    password: initialPassword,
    name: "Krishnendu Adak",
  },
  {
    email: "crezymoon07@gmail.com",
    password: initialPassword,
    name: "Chandrima Chowdhury",
  },
  {
    email: "ninjanio296@gmail.com",
    password: initialPassword,
    name: "Nandita Ghosh",
  },
  {
    email: "mddanishraza904@gmail.com",
    password: initialPassword,
    name: "MD Danish Raza",
  },
];

async function main() {
  console.log("Starting batch admin account creation...\n");

  for (const admin of admins) {
    try {
      if (db) {
        const existingUsers = await db.select().from(user).where(eq(user.email, admin.email));
        if (existingUsers.length > 0) {
          const existingCredential = await db
            .select()
            .from(account)
            .where(and(eq(account.userId, existingUsers[0].id), eq(account.providerId, "credential")));

          if (existingCredential.length === 0) {
            await db.delete(account).where(eq(account.userId, existingUsers[0].id));
            await db.delete(user).where(eq(user.id, existingUsers[0].id));
          }
        }
      }

      const res = await auth.api.signUpEmail({
        body: {
          email: admin.email,
          password: admin.password,
          name: admin.name,
        },
      });

      if (db) {
        await db.update(user).set({ emailVerified: true }).where(eq(user.email, admin.email));
      }

      console.log(`[SUCCESS] Account created: ${admin.name} (${res.user.email})`);
    } catch (error) {
      if (db) {
        await db.update(user).set({ emailVerified: true }).where(eq(user.email, admin.email));
      }
      console.log(`[SKIPPED / STATUS] ${admin.name} (${admin.email}):`, (error as Error).message || error);
    }
  }

  console.log("\nAdmin batch registration complete.");
  process.exit(0);
}

main();
