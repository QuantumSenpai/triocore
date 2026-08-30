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
