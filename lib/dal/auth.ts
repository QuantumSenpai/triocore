import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth-whitelist";
import { db } from "@/lib/db";
import { adminMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const sessionRes = await auth.api.getSession({
      headers: headerList,
    });

    if (!sessionRes?.user || !isAdminEmail(sessionRes.user.email)) {
      redirect("/admin/login");
    }

    // Check admin_members table
    let role = "member";
    let canViewFinance = false;

    if (db) {
      try {
        const member = await db
          .select()
          .from(adminMembers)
          .where(eq(adminMembers.userId, sessionRes.user.id))
          .limit(1);

        if (member.length > 0) {
          if (member[0].status === "disabled") {
            redirect("/admin/login?error=disabled");
          }
          role = member[0].role;
          canViewFinance = member[0].canViewFinance || member[0].role === "owner";
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
    const sessionRes = await auth.api.getSession({
      headers: headerList,
    });

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
        const member = await db
          .select()
          .from(adminMembers)
          .where(eq(adminMembers.userId, sessionRes.user.id))
          .limit(1);

        if (member.length > 0) {
          if (member[0].status === "disabled") {
            return {
              authorized: false,
              response: NextResponse.json(
                { error: "Account disabled by administrator." },
                { status: 403 }
              ),
            };
          }
          role = member[0].role;
          canViewFinance = member[0].canViewFinance || member[0].role === "owner";
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
