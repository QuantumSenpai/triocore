import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { account, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/dal/auth";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { validatePassword } from "@/lib/password-rules";

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized || !authCheck.user) {
    return authCheck.response!;
  }

  try {
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 });
    }

    const userId = authCheck.user.id;
    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);

    if (userAccounts.length === 0 || !userAccounts[0].password) {
      return NextResponse.json(
        { error: "No password credential configured for this account" },
        { status: 400 }
      );
    }

    const currentValid = await verifyPassword({
      hash: userAccounts[0].password,
      password: currentPassword,
    });

    if (!currentValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await db
      .update(account)
      .set({
        password: newHash,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccounts[0].id));

    try {
      await db.insert(auditLogs).values({
        userId,
        action: "CHANGE_PASSWORD",
        entityType: "account",
        entityId: userId,
        details: { email: authCheck.user.email },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
