import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth-whitelist";

export async function verifyAdminSession(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user || !isAdminEmail(session.user.email)) {
      return {
        authorized: false,
        user: null,
        response: NextResponse.json(
          { error: "Unauthorized access: admin privileges required." },
          { status: 401 }
        ),
      };
    }

    // Check member active status
    const { db } = await import("@/lib/db");
    const { adminMembers } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    if (db) {
      const member = await db
        .select()
        .from(adminMembers)
        .where(eq(adminMembers.userId, session.user.id))
        .limit(1);
      if (member.length > 0 && member[0].status === "disabled") {
        return {
          authorized: false,
          user: null,
          response: NextResponse.json(
            { error: "Account disabled by administrator." },
            { status: 403 }
          ),
        };
      }
    }

    return {
      authorized: true,
      user: session.user,
      session,
      response: null,
    };
  } catch {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: "Authentication verification failed." },
        { status: 401 }
      ),
    };
  }
}
