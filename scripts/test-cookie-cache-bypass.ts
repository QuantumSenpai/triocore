import { db } from "../lib/db";
import { user, session, account, adminMembers } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function run() {
  console.log("=== Testing Better-Auth cookieCache & DB Bypass for Disabled Member ===");
  if (!db) {
    throw new Error("Database not connected");
  }

  const url = process.env.DATABASE_URL || "";
  const host = new URL(url).hostname;
  console.log("Database Host:", host);
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    throw new Error("PROD HOST DETECTED! ABORTING.");
  }

  const rand = crypto.randomBytes(4).toString("hex");
  const testEmail = `TEST-bypass-${rand}@example.test`;
  const testPassword = `Pass#Safe99${rand}`;
  let createdUserId = "";

  try {
    // 1. Create account via Better-Auth sign-up or directly
    const { auth } = await import("../lib/auth");
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Test Bypass User",
      },
    });

    if (!signUpResult || !signUpResult.user) {
      throw new Error("Failed to create test user via auth.api.signUpEmail");
    }
    createdUserId = signUpResult.user.id;

    // 2. Add to admin_members as active member with canViewFinance = true
    await db.insert(adminMembers).values({
      id: `am-${rand}`,
      userId: createdUserId,
      role: "member",
      status: "active",
      canViewFinance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("1. Created active synthetic member with canViewFinance=true");

    // 3. Sign in via HTTP to get the authentic session cookie with cookieCache
    const loginRes = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const setCookie = loginRes.headers.get("set-cookie") || "";
    const sessionCookie = setCookie.split(";")[0];
    console.log("2. Successfully logged in, acquired signed session cookie");

    // 4. Request finance endpoint (/api/admin/expenses) while ACTIVE
    const activeRes = await fetch("http://localhost:3000/api/admin/expenses", {
      headers: { cookie: sessionCookie },
    });
    console.log(`3. Active Member Finance Request: Status ${activeRes.status} (expected 200)`);
    if (activeRes.status !== 200) {
      throw new Error(`Active finance request failed with status ${activeRes.status}`);
    }

    // 5. Disable member directly in database (DO NOT delete session, so cookieCache still has it)
    console.log("4. Disabling member in database (status='disabled')...");
    await db.update(adminMembers).set({ status: "disabled", updatedAt: new Date() }).where(eq(adminMembers.userId, createdUserId));

    // 6. Test finance request immediately (with zero delay, without waiting 5 minutes for cookie cache expiry)
    const disabledFinanceRes = await fetch("http://localhost:3000/api/admin/expenses", {
      headers: { cookie: sessionCookie },
    });
    console.log(`5. Disabled Member Finance Request: Status ${disabledFinanceRes.status} (expected 403)`);

    if (disabledFinanceRes.status === 403) {
      console.log("✅ SUCCESS: Finance request failed immediately with 403 Forbidden! DB bypass verified.");
    } else {
      throw new Error(`TEST FAILED: Expected 403 Forbidden but got ${disabledFinanceRes.status}`);
    }

    // 7. Test destructive DELETE request (/api/admin/services)
    const disabledDeleteRes = await fetch("http://localhost:3000/api/admin/services?id=nonexistent", {
      method: "DELETE",
      headers: { cookie: sessionCookie },
    });
    console.log(`6. Disabled Member Destructive Request: Status ${disabledDeleteRes.status} (expected 403)`);
    if (disabledDeleteRes.status === 403) {
      console.log("✅ SUCCESS: Destructive request failed immediately with 403 Forbidden! DB bypass verified.");
    } else {
      throw new Error(`TEST FAILED: Expected 403 for DELETE but got ${disabledDeleteRes.status}`);
    }

  } finally {
    if (createdUserId) {
      console.log("Cleaning up synthetic test user...");
      await db.delete(session).where(eq(session.userId, createdUserId));
      await db.delete(account).where(eq(account.userId, createdUserId));
      await db.delete(adminMembers).where(eq(adminMembers.userId, createdUserId));
      await db.delete(user).where(eq(user.id, createdUserId));
      console.log("Cleanup complete.");
    }
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
