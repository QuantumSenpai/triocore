import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminMembers, auditLogs, user, account, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { validatePassword } from "@/lib/password-rules";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    const { setupKey, email, newPassword } = body;

    const expectedKey = process.env.ADMIN_SETUP_KEY?.trim() || "";
    const keyBuf = Buffer.from(setupKey || "");
    const expBuf = Buffer.from(expectedKey);
    const keyValid =
      expectedKey.length > 0 &&
      keyBuf.length === expBuf.length &&
      crypto.timingSafeEqual(keyBuf, expBuf);

    if (!keyValid) {
      return NextResponse.json({ error: "Invalid setup recovery key" }, { status: 403 });
    }

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and new password are required" }, { status: 400 });
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    const userId = existingUser[0].id;
    const passwordHash = await hashPassword(newPassword);

    const existingAccount = await db.select().from(account).where(eq(account.userId, userId)).limit(1);
    if (existingAccount.length > 0) {
      await db.update(account).set({
        password: passwordHash,
        updatedAt: new Date(),
      }).where(eq(account.id, existingAccount[0].id));
    } else {
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

    // Invalidate all active sessions for this user
    await db.delete(session).where(eq(session.userId, userId));

    try {
      await db.insert(auditLogs).values({
        userId,
        action: "RECOVER_PASSWORD",
        entityType: "account",
        entityId: userId,
        details: { email: normalizedEmail },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password successfully recovered and reset. All previous sessions invalidated.",
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
