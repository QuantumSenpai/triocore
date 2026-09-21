import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInvites, adminMembers, auditLogs, user, account, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";
import { validatePassword } from "@/lib/password-rules";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !password || !name) {
      return NextResponse.json({ error: "Token, name, and password are required" }, { status: 400 });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invite = await db.select().from(adminInvites).where(eq(adminInvites.tokenHash, tokenHash)).limit(1);

    if (invite.length === 0) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
    }

    const inv = invite[0];
    if (inv.usedAt) {
      return NextResponse.json({ error: "This invitation link has already been used." }, { status: 400 });
    }

    if (new Date(inv.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "This invitation link has expired (48h limit)." }, { status: 400 });
    }

    const normalizedEmail = inv.email.trim().toLowerCase();
    let userId: string;

    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
    const passwordHash = await hashPassword(password);

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      if (name.trim()) {
        await db.update(user).set({ name: name.trim(), updatedAt: new Date() }).where(eq(user.id, userId));
      }
      const existingAccount = await db.select().from(account).where(eq(account.userId, userId)).limit(1);
      if (existingAccount.length > 0) {
        await db.update(account).set({ password: passwordHash, updatedAt: new Date() }).where(eq(account.id, existingAccount[0].id));
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
      await db.delete(session).where(eq(session.userId, userId));
    } else {
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
          throw new Error("Failed to sign up");
        }
      } catch {
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

    // Insert or update in admin_members
    const existingMember = await db.select().from(adminMembers).where(eq(adminMembers.userId, userId)).limit(1);
    if (existingMember.length > 0) {
      await db.update(adminMembers).set({
        role: inv.role || "member",
        canViewFinance: inv.canViewFinance || false,
        status: "active",
        updatedAt: new Date(),
      }).where(eq(adminMembers.userId, userId));
    } else {
      await db.insert(adminMembers).values({
        userId,
        role: inv.role || "member",
        canViewFinance: inv.canViewFinance || false,
        status: "active",
      });
    }

    // Mark invite as used (single-use guarantee)
    await db.update(adminInvites).set({ usedAt: new Date() }).where(eq(adminInvites.id, inv.id));

    try {
      await db.insert(auditLogs).values({
        userId,
        action: "ACCEPT_INVITE",
        entityType: "admin_invites",
        entityId: inv.id,
        details: { email: inv.email, role: inv.role },
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
