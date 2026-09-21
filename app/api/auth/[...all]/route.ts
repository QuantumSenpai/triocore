import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { checkLockout, recordFailedAttempt, resetLockout } from "@/lib/rate-limit";

const authHandlers = toNextJsHandler(auth);

export const GET = authHandlers.GET;

export async function POST(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isSignIn = pathname.includes("/sign-in");

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  let email: string | undefined = undefined;

  if (isSignIn) {
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      if (body && typeof body.email === "string") {
        email = body.email;
      }
    } catch {}

    const lockout = await checkLockout(ip, email);
    if (lockout.locked) {
      return NextResponse.json(
        { message: lockout.message || "Too many attempts, try again in 25 minutes" },
        {
          status: 429,
          headers: {
            "Retry-After": String(lockout.retryAfterSeconds || 1500),
          },
        }
      );
    }
  }

  const response = await authHandlers.POST(req);

  if (isSignIn) {
    if (!response.ok && (response.status === 401 || response.status === 400)) {
      const record = await recordFailedAttempt(ip, email, pathname);
      if (record.locked) {
        return NextResponse.json(
          { message: "Too many attempts, try again in 25 minutes" },
          {
            status: 429,
            headers: {
              "Retry-After": "1500",
            },
          }
        );
      }
    } else if (response.ok) {
      await resetLockout(ip, email);
    }
  }

  return response;
}

