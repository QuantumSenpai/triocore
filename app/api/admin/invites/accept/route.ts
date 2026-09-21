import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInvites, adminMembers, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !password || !name) {
      return NextResponse.json({ error: "Token, name, and password are required" }, { status: 400 });
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

    // Create user via Better-Auth
    const authRes = await auth.api.signUpEmail({
      body: {
        email: inv.email,
        password,
        name: name.trim(),
      },
    });

    if (!authRes || !authRes.user) {
      return NextResponse.json({ error: "Failed to create team member account" }, { status: 500 });
    }

    const userId = authRes.user.id;

    // Insert into admin_members
    await db.insert(adminMembers).values({
      userId,
      role: inv.role || "member",
      canViewFinance: false,
      status: "active",
    });

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
