import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminMembers, auditLogs, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

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
    const keyValid = expectedKey.length > 0 && keyBuf.length === expBuf.length && crypto.timingSafeEqual(keyBuf, expBuf);

    if (!keyValid) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    let userId: string;
    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        },
      });

      if (authRes && authRes.user) {
        userId = authRes.user.id;
      } else {
        throw new Error("Failed to create user account");
      }
    } catch {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email.trim().toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
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
        details: { email },
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
