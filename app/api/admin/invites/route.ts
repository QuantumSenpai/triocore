import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInvites, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/dal/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdminRole("owner", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ invites: [] });
    const invites = await db.select().from(adminInvites).orderBy(desc(adminInvites.createdAt));
    return NextResponse.json({ invites });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdminRole("owner", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { email, role = "member" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // Exactly 48 hours expiry
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const newInvite = await db.insert(adminInvites).values({
      email: email.trim().toLowerCase(),
      role,
      tokenHash,
      expiresAt,
      createdById: authCheck.user?.id || null,
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_ADMIN_INVITE",
        entityType: "admin_invites",
        entityId: newInvite[0].id,
        details: { email, role, expiresAt: expiresAt.toISOString() },
      });
    } catch {}

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/admin/invite/${token}`;

    return NextResponse.json({
      success: true,
      invite: newInvite[0],
      inviteUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await requireAdminRole("owner", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing invite ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(adminInvites).where(eq(adminInvites.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
