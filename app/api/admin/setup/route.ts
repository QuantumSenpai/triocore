import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminMembers, auditLogs, user, account, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";
import { validatePassword } from "@/lib/password-rules";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // 1. Check if any admin member already exists (zero admin users exist rule)
    const existingAdmins = await db
      .select()
      .from(adminMembers)
      .limit(1);

    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { setupKey, name, email, password } = body;

    const expectedKey = process.env.ADMIN_SETUP_KEY?.trim() || "";
    const keyBuf = Buffer.from(setupKey || "");
    const expBuf = Buffer.from(expectedKey);
    const keyValid =
      expectedKey.length > 0 &&
      keyBuf.length === expBuf.length &&
      crypto.timingSafeEqual(keyBuf, expBuf);

    if (!keyValid) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let userId: string;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    const passwordHash = await hashPassword(password);

    if (existingUser.length > 0) {
      // User exists in user table
      userId = existingUser[0].id;

      // Update name if provided
      if (name.trim()) {
        await db.update(user).set({ name: name.trim(), updatedAt: new Date() }).where(eq(user.id, userId));
      }

      // Check account table
      const existingAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId))
        .limit(1);

      if (existingAccount.length > 0) {
        // Case (a): Existing user HAS a credential account -> update password hash
        await db
          .update(account)
          .set({
            password: passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(account.id, existingAccount[0].id));
      } else {
        // Case (b): Existing user has NO credential account -> create credential account
        await db.insert(account).values({
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Invalidate all old sessions for this user
      await db.delete(session).where(eq(session.userId, userId));
    } else {
      // Case (c): No user row at all -> create user + account
      try {
        const authRes = await auth.api.signUpEmail({
          body: {
            email: normalizedEmail,
            password,
            name: name.trim(),
          },
        });

        if (authRes && authRes.user) {
          userId = authRes.user.id;
        } else {
          throw new Error("Failed to sign up email");
        }
      } catch {
        // Direct DB fallback if Better-Auth hook fails
        const newUserId = crypto.randomUUID();
        await db.insert(user).values({
          id: newUserId,
          email: normalizedEmail,
          name: name.trim(),
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await db.insert(account).values({
          id: crypto.randomUUID(),
          accountId: newUserId,
          providerId: "credential",
          userId: newUserId,
          password: passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        userId = newUserId;
      }
    }

    // 3. Create owner record in admin_members
    await db.insert(adminMembers).values({
      userId,
      role: "owner",
      canViewFinance: true,
      status: "active",
    });

    try {
      await db.insert(auditLogs).values({
        userId,
        action: "SETUP_INITIAL_OWNER",
        entityType: "admin_members",
        entityId: userId,
        details: { email: normalizedEmail },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Owner account successfully configured. You can now log in.",
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
