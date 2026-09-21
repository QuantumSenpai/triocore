import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminMembers, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // 1. Check if an owner already exists
    const existingOwners = await db
      .select()
      .from(adminMembers)
      .where(eq(adminMembers.role, "owner"))
      .limit(1);

    if (existingOwners.length > 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { setupKey, name, email, password } = body;

    const expectedKey = process.env.ADMIN_SETUP_KEY?.trim();
    if (!expectedKey || setupKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // 2. Sign up user via Better-Auth
    const authRes = await auth.api.signUpEmail({
      body: {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      },
    });

    if (!authRes || !authRes.user) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    const userId = authRes.user.id;

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
