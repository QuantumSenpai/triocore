import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth-whitelist";
import { db } from "@/lib/db";
import { adminMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminMemberWithCache, getSessionWithCache } from "@/lib/auth-cache";

export interface AdminAuthResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    canViewFinance?: boolean;
  };
  session?: {
    id: string;
    userId: string;
    token: string;
  };
  response?: NextResponse | null;
}

/**
 * Enforces admin session for Server Components and Pages.
 * Redirects to /admin/login on failure.
 */
export async function requireAdminPage(): Promise<{
  user: { id: string; email: string; name?: string | null; role: string; canViewFinance: boolean };
  session: { id: string; token: string };
}> {
  try {
    const headerList = await headers();
    const sessionRes = await getSessionWithCache(headerList);

    if (!sessionRes?.user || !isAdminEmail(sessionRes.user.email)) {
      redirect("/admin/login");
    }

    // Check admin_members table via deduplicated cache
    let role = "member";
    let canViewFinance = false;

    if (db) {
      try {
        const member = await getAdminMemberWithCache(sessionRes.user.id);
        if (member) {
          if (member.status === "disabled") {
            redirect("/admin/login?error=disabled");
          }
          role = member.role;
          canViewFinance = member.canViewFinance || member.role === "owner";
        }
      } catch {}
    }

    return {
      user: {
        id: sessionRes.user.id,
        email: sessionRes.user.email,
        name: sessionRes.user.name,
        role,
        canViewFinance,
      },
      session: {
        id: sessionRes.session.id,
        token: sessionRes.session.token,
      },
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    redirect("/admin/login");
  }
}

/**
 * Enforces admin session for API Routes and Server Actions.
 * Returns 401 Unauthorized if missing/invalid session.
 */
export async function requireAdmin(req?: NextRequest): Promise<AdminAuthResult> {
  try {
    const headerList = req ? req.headers : await headers();
    const isMutation = req ? (req.method !== "GET" && req.method !== "HEAD") : false;
    const sessionRes = await getSessionWithCache(headerList, isMutation);

    if (!sessionRes?.user || !isAdminEmail(sessionRes.user.email)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized access: admin privileges required." },
          { status: 401 }
        ),
      };
    }

    let role = "member";
    let canViewFinance = false;

    if (db) {
      try {
        const isMutation = req ? (req.method !== "GET" && req.method !== "HEAD") : false;
        const member = await getAdminMemberWithCache(sessionRes.user.id, isMutation);

        if (member) {
          if (member.status === "disabled") {
            return {
              authorized: false,
              response: NextResponse.json(
                { error: "Account disabled by administrator." },
                { status: 403 }
              ),
            };
          }
          role = member.role;
          canViewFinance = member.canViewFinance || member.role === "owner";
        }
      } catch {}
    }

    return {
      authorized: true,
      user: {
        id: sessionRes.user.id,
        email: sessionRes.user.email,
        name: sessionRes.user.name,
        role,
        canViewFinance,
      },
      session: {
        id: sessionRes.session.id,
        userId: sessionRes.session.userId,
        token: sessionRes.session.token,
      },
      response: null,
    };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication verification failed." },
        { status: 401 }
      ),
    };
  }
}

/**
 * Enforces a specific role or finance privilege. Returns 403 if insufficient permissions.
 */
export async function requireAdminRole(
  requiredRole: "owner" | "finance",
  req?: NextRequest
): Promise<AdminAuthResult> {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck;

  if (requiredRole === "owner" && authCheck.user?.role !== "owner") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden: Owner role required." },
        { status: 403 }
      ),
    };
  }

  if (requiredRole === "finance" && !authCheck.user?.canViewFinance && authCheck.user?.role !== "owner") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden: Financial access permission required." },
        { status: 403 }
      ),
    };
  }

  return authCheck;
}

// Backward compatibility export
export const verifyAdminSession = requireAdmin;
