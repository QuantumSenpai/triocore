import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";
import { auth } from "../lib/auth";
import crypto from "crypto";

async function runPart4SetupTests() {
  console.log("🚀 Starting PART 4: Production-Like Setup Tests (Synthetic Users Only)...\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("No DATABASE_URL");
  const client = neon(dbUrl);

  const parsed = new URL(dbUrl);
  if (parsed.host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: DATABASE_URL points to production ep-noisy-hill-axqvb7jv!");
    process.exit(1);
  }
  console.log("DEV DB HOST:", parsed.host);

  const setupKey = process.env.ADMIN_SETUP_KEY?.trim() || "triocore-setup-master-key-2026";

  // Helper to ensure clean baseline
  async function resetAdmins() {
    await client`DELETE FROM "admin_members"`;
    await client`DELETE FROM "session"`;
    await client`DELETE FROM "auth_lockouts"`;
    await client`DELETE FROM "account" WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE 'test-%@example.test')`;
    await client`DELETE FROM "user" WHERE email LIKE 'test-%@example.test'`;
  }

  await resetAdmins();

  const results: { test: string; pass: boolean; details: Record<string, unknown> }[] = [];

  // =========================================================================
  // Case (a): Existing user row HAS a credential account with known old password
  // =========================================================================
  console.log("----------------------------------------------------------------");
  console.log("Case (a): Existing user row with existing credential account");
  console.log("----------------------------------------------------------------");
  {
    const emailA = `test-a-${crypto.randomBytes(6).toString("hex")}@example.test`.toLowerCase();
    const oldPasswordA = `OldSecure-${crypto.randomBytes(8).toString("hex")}-2026!`;
    const newPasswordA = `NewSecure-${crypto.randomBytes(8).toString("hex")}-2026!`;

    // 1. Create user and credential account via Better-Auth
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: emailA,
        password: oldPasswordA,
        name: "Existing User A",
      },
    });
    const userAId = signUpRes.user.id;
    console.log("Created userA via Better-Auth, id:", userAId);

    // 2. Create active session in DB for userA
    const oldSessionToken = `OLD-SESSION-${crypto.randomBytes(16).toString("hex")}`;
    await client`
      INSERT INTO "session" (id, token, user_id, expires_at, created_at, updated_at)
      VALUES (${crypto.randomUUID()}, ${oldSessionToken}, ${userAId}, NOW() + INTERVAL '7 days', NOW(), NOW())
    `;

    // Verify old session exists
    const sessionBefore = await client`SELECT * FROM "session" WHERE token = ${oldSessionToken}`;
    console.log("Pre-setup active session exists:", sessionBefore.length === 1);

    // Verify old password logs in
    const preLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailA, password: oldPasswordA }),
    });
    console.log("Pre-setup old password login status (expected 200):", preLogin.status);

    // 3. Run /api/admin/setup with new password
    const setupRes = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Owner A",
        email: emailA,
        password: newPasswordA,
      }),
    });
    const setupData = await setupRes.json();
    console.log("Setup response status:", setupRes.status, setupData);

    // (1) Check owner row created in admin_members
    const memberRow = await client`SELECT * FROM admin_members WHERE user_id = ${userAId}`;
    const ownerCreated = memberRow.length === 1 && memberRow[0].role === "owner";
    console.log("Owner row created in admin_members:", ownerCreated);

    // (2) Check old session invalidated
    const sessionAfter = await client`SELECT * FROM "session" WHERE token = ${oldSessionToken}`;
    const oldSessionInvalidated = sessionAfter.length === 0;
    console.log("Old session invalidated:", oldSessionInvalidated);

    // (3) Check new password logs in
    const newLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailA, password: newPasswordA }),
    });
    const newPasswordWorks = newLogin.status === 200;
    console.log("New password login status (expected 200):", newLogin.status);

    // (4) Check old password fails
    const oldLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailA, password: oldPasswordA }),
    });
    const oldPasswordFails = oldLogin.status === 401;
    console.log("Old password login status (expected 401):", oldLogin.status);

    // (5) Check subsequent /admin/setup returns 404
    const secondSetup = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Second Attempt",
        email: `test-extra@example.test`,
        password: `ExtraPass-${crypto.randomBytes(8).toString("hex")}-2026!`,
      }),
    });
    const setupLocked404 = secondSetup.status === 404;
    console.log("Subsequent /admin/setup status (expected 404):", secondSetup.status);

    const passA =
      setupRes.status === 200 &&
      ownerCreated &&
      oldSessionInvalidated &&
      newPasswordWorks &&
      oldPasswordFails &&
      setupLocked404;

    results.push({
      test: "Case (a): Existing user HAS credential account",
      pass: passA,
      details: {
        setupStatus: setupRes.status,
        ownerCreated,
        oldSessionInvalidated,
        newPasswordWorks,
        oldPasswordFails,
        setupLocked404,
      },
    });

    await resetAdmins();
  }

  // =========================================================================
  // Case (b): Existing user row with NO credential account
  // =========================================================================
  console.log("\n----------------------------------------------------------------");
  console.log("Case (b): Existing user row with NO credential account");
  console.log("----------------------------------------------------------------");
  {
    const userBId = crypto.randomUUID();
    const emailB = `test-b-${crypto.randomBytes(6).toString("hex")}@example.test`.toLowerCase();
    const newPasswordB = `NewSecureB-${crypto.randomBytes(8).toString("hex")}-2026!`;

    // 1. Create user in user table with NO account
    await client`
      INSERT INTO "user" (id, email, name, email_verified, created_at, updated_at)
      VALUES (${userBId}, ${emailB}, 'Existing User B Without Pass', true, NOW(), NOW())
    `;

    const accountBefore = await client`SELECT * FROM "account" WHERE user_id = ${userBId}`;
    console.log("Pre-setup account count (expected 0):", accountBefore.length);

    // 2. Run /api/admin/setup
    const setupRes = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Owner B",
        email: emailB,
        password: newPasswordB,
      }),
    });
    const setupData = await setupRes.json();
    console.log("Setup response status:", setupRes.status, setupData);

    // (1) Check owner row created in admin_members
    const memberRow = await client`SELECT * FROM admin_members WHERE user_id = ${userBId}`;
    const ownerCreated = memberRow.length === 1 && memberRow[0].role === "owner";
    console.log("Owner row created in admin_members:", ownerCreated);

    // (2) Check credential account was created
    const accountAfter = await client`SELECT * FROM "account" WHERE user_id = ${userBId}`;
    const accountCreated = accountAfter.length === 1;
    console.log("Credential account created:", accountCreated);

    // (3) Check new password logs in
    const newLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailB, password: newPasswordB }),
    });
    const newPasswordWorks = newLogin.status === 200;
    console.log("New password login status (expected 200):", newLogin.status);

    // (4) Check arbitrary incorrect password fails
    const badLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailB, password: "WrongPass-1234567890!" }),
    });
    const badPasswordFails = badLogin.status === 401;
    console.log("Bad password login status (expected 401):", badLogin.status);

    // (5) Check /admin/setup now returns 404
    const secondSetup = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Second Attempt",
        email: `test-extra2@example.test`,
        password: `ExtraPass2-${crypto.randomBytes(8).toString("hex")}-2026!`,
      }),
    });
    const setupLocked404 = secondSetup.status === 404;
    console.log("Subsequent /admin/setup status (expected 404):", secondSetup.status);

    const passB =
      setupRes.status === 200 &&
      ownerCreated &&
      accountCreated &&
      newPasswordWorks &&
      badPasswordFails &&
      setupLocked404;

    results.push({
      test: "Case (b): Existing user row with NO credential account",
      pass: passB,
      details: {
        setupStatus: setupRes.status,
        ownerCreated,
        accountCreated,
        newPasswordWorks,
        badPasswordFails,
        setupLocked404,
      },
    });

    await resetAdmins();
  }

  // =========================================================================
  // Case (c): NO user row at all
  // =========================================================================
  console.log("\n----------------------------------------------------------------");
  console.log("Case (c): NO user row at all");
  console.log("----------------------------------------------------------------");
  {
    const emailC = `test-c-${crypto.randomBytes(6).toString("hex")}@example.test`.toLowerCase();
    const newPasswordC = `NewSecureC-${crypto.randomBytes(8).toString("hex")}-2026!`;

    // 1. Verify user does NOT exist
    const userBefore = await client`SELECT * FROM "user" WHERE email = ${emailC}`;
    console.log("Pre-setup user count (expected 0):", userBefore.length);

    // 2. Run /api/admin/setup
    const setupRes = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Owner C",
        email: emailC,
        password: newPasswordC,
      }),
    });
    const setupData = await setupRes.json();
    console.log("Setup response status:", setupRes.status, setupData);

    // (1) Check user row was created
    const userAfter = await client`SELECT * FROM "user" WHERE email = ${emailC}`;
    const userCreated = userAfter.length === 1;
    const userCId = userAfter[0]?.id;
    console.log("User row created:", userCreated, "id:", userCId);

    // (2) Check owner row created in admin_members
    const memberRow = await client`SELECT * FROM admin_members WHERE user_id = ${userCId}`;
    const ownerCreated = memberRow.length === 1 && memberRow[0].role === "owner";
    console.log("Owner row created in admin_members:", ownerCreated);

    // (3) Check new password logs in
    const newLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailC, password: newPasswordC }),
    });
    const newPasswordWorks = newLogin.status === 200;
    console.log("New password login status (expected 200):", newLogin.status);

    // (4) Check arbitrary incorrect password fails
    const badLogin = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      body: JSON.stringify({ email: emailC, password: "WrongPass-1234567890!" }),
    });
    const badPasswordFails = badLogin.status === 401;
    console.log("Bad password login status (expected 401):", badLogin.status);

    // (5) Check /admin/setup now returns 404
    const secondSetup = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupKey,
        name: "Second Attempt",
        email: `test-extra3@example.test`,
        password: `ExtraPass3-${crypto.randomBytes(8).toString("hex")}-2026!`,
      }),
    });
    const setupLocked404 = secondSetup.status === 404;
    console.log("Subsequent /admin/setup status (expected 404):", secondSetup.status);

    const passC =
      setupRes.status === 200 &&
      userCreated &&
      ownerCreated &&
      newPasswordWorks &&
      badPasswordFails &&
      setupLocked404;

    results.push({
      test: "Case (c): NO user row at all",
      pass: passC,
      details: {
        setupStatus: setupRes.status,
        userCreated,
        ownerCreated,
        newPasswordWorks,
        badPasswordFails,
        setupLocked404,
      },
    });

    await resetAdmins();
  }

  console.log("\n================ PART 4 SETUP TEST RESULTS ================");
  for (const r of results) {
    console.log(`${r.pass ? "✅ PASS" : "❌ FAIL"} | ${r.test} | ${JSON.stringify(r.details)}`);
  }

  const allPassed = results.every((r) => r.pass);
  if (!allPassed) {
    process.exit(1);
  }
}

runPart4SetupTests().catch((err) => {
  console.error("FATAL in Part 4 Setup Tests:", err);
  process.exit(1);
});
