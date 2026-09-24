import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth-whitelist";

export interface VerifyAdminOptions {
  bypassCache?: boolean;
  requireFinance?: boolean;
  requireOwner?: boolean;
}

export async function verifyAdminSession(req: NextRequest, options: VerifyAdminOptions = {}) {
  try {
    const pathname = req.nextUrl?.pathname || "";
    const method = req.method.toUpperCase();

    // Determine whether to bypass cookie cache
    const isDestructive = method === "DELETE" || method === "POST" || method === "PATCH" || method === "PUT";
    const isFinanceRoute =
      pathname.includes("/payments") ||
      pathname.includes("/expenses") ||
      pathname.includes("/receipt") ||
      options.requireFinance === true;
    const isRoleChangingRoute =
      pathname.includes("/team-access") ||
      pathname.includes("/invites") ||
      options.requireOwner === true;

    const shouldBypassCache =
      options.bypassCache === true || isDestructive;

    const { getSessionWithCache, getAdminMemberWithCache } = await import("@/lib/auth-cache");
    const session = await getSessionWithCache(req.headers, isDestructive);

    if (!session || !session.user || !isAdminEmail(session.user.email)) {
      return {
        authorized: false,
        user: null,
        session: null,
        member: null,
        response: NextResponse.json(
          { error: "Unauthorized access: admin privileges required." },
          { status: 401 }
        ),
      };
    }

    const { db } = await import("@/lib/db");
    const { session: sessionTable } = await import("@/lib/db/schema");
    const { eq, and, gt } = await import("drizzle-orm");

    if (db) {
      // 1. If bypassing cache (destructive mutations), verify the session actually exists and is active in the database
      if (shouldBypassCache && session.session?.id) {
        const activeDbSessions = await db
          .select()
          .from(sessionTable)
          .where(
            and(
              eq(sessionTable.id, session.session.id),
              gt(sessionTable.expiresAt, new Date())
            )
          )
          .limit(1);

        if (activeDbSessions.length === 0) {
          return {
            authorized: false,
            user: null,
            session: null,
            member: null,
            response: NextResponse.json(
              { error: "Session expired or revoked in database." },
              { status: 401 }
            ),
          };
        }
      }

      // 2. Verify admin_members directly or via deduplicated in-memory cache
      const member = await getAdminMemberWithCache(session.user.id, isDestructive);

      if (!member) {
        return {
          authorized: false,
          user: null,
          session: null,
          member: null,
          response: NextResponse.json(
            { error: "Admin member record not found." },
            { status: 403 }
          ),
        };
      }

      // Instant rejection if account was disabled
      if (member.status === "disabled") {
        return {
          authorized: false,
          user: null,
          session: null,
          member: null,
          response: NextResponse.json(
            { error: "Account disabled by administrator." },
            { status: 403 }
          ),
        };
      }

      // Enforce finance permission directly from DB
      if (isFinanceRoute && member.role !== "owner" && !member.canViewFinance) {
        return {
          authorized: false,
          user: null,
          session: null,
          member: null,
          response: NextResponse.json(
            { error: "Forbidden: You do not have permission to view or manage financial records." },
            { status: 403 }
          ),
        };
      }

      // Enforce owner permission directly from DB
      if (isRoleChangingRoute && member.role !== "owner") {
        return {
          authorized: false,
          user: null,
          session: null,
          member: null,
          response: NextResponse.json(
            { error: "Forbidden: Owner privileges required." },
            { status: 403 }
          ),
        };
      }

      return {
        authorized: true,
        user: session.user,
        session,
        member,
        response: null,
      };
    }

    return {
      authorized: true,
      user: session.user,
      session,
      member: null,
      response: null,
    };
  } catch {
    return {
      authorized: false,
      user: null,
      session: null,
      member: null,
      response: NextResponse.json(
        { error: "Authentication verification failed." },
        { status: 401 }
      ),
    };
  }
}
