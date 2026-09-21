import crypto from "crypto";
import { db } from "@/lib/db";
import { authLockouts, auditLogs } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_DURATION_MS = 25 * 60 * 1000; // 25 minutes = 1500 seconds

/**
 * Returns HMAC-SHA256 hash of a string using RATE_LIMIT_SECRET.
 */
export function hashWithRateLimitSecret(data: string): string {
  const secret = process.env.RATE_LIMIT_SECRET || "triocore-rate-limit-default-secret-salt-2026";
  return crypto.createHmac("sha256", secret).update(data.trim().toLowerCase()).digest("hex");
}

export interface LockoutStatus {
  locked: boolean;
  failedAttempts: number;
  retryAfterSeconds?: number;
  message?: string;
}

/**
 * Checks whether an IP / email pair is currently locked out.
 */
export async function checkLockout(ip: string, email?: string): Promise<LockoutStatus> {
  if (!db) {
    return { locked: false, failedAttempts: 0 };
  }

  try {
    const ipHash = hashWithRateLimitSecret(ip);
    const emailHash = email ? hashWithRateLimitSecret(email) : null;
    const compositeKey = emailHash ? `${ipHash}:${emailHash}` : ipHash;

    const existing = await db
      .select()
      .from(authLockouts)
      .where(eq(authLockouts.key, compositeKey))
      .limit(1);

    if (existing.length === 0) {
      // Also check per-IP lockout
      if (emailHash) {
        const ipOnly = await db
          .select()
          .from(authLockouts)
          .where(eq(authLockouts.key, ipHash))
          .limit(1);

        if (ipOnly.length > 0 && ipOnly[0].lockedUntil) {
          const now = Date.now();
          const lockTime = new Date(ipOnly[0].lockedUntil).getTime();
          if (lockTime > now) {
            const retryAfter = Math.ceil((lockTime - now) / 1000);
            return {
              locked: true,
              failedAttempts: ipOnly[0].failedAttempts,
              retryAfterSeconds: retryAfter,
              message: "Too many attempts, try again in 25 minutes",
            };
          }
        }
      }

      return { locked: false, failedAttempts: 0 };
    }

    const record = existing[0];
    const now = Date.now();

    if (record.lockedUntil) {
      const lockTime = new Date(record.lockedUntil).getTime();
      if (lockTime > now) {
        const retryAfter = Math.ceil((lockTime - now) / 1000);
        return {
          locked: true,
          failedAttempts: record.failedAttempts,
          retryAfterSeconds: retryAfter,
          message: "Too many attempts, try again in 25 minutes",
        };
      }
    }

    return { locked: false, failedAttempts: record.failedAttempts };
  } catch (error) {
    console.error("Lockout check error:", (error as Error).message);
    return { locked: false, failedAttempts: 0 };
  }
}

/**
 * Records a failed authentication attempt.
 * If failedAttempts reaches 10, locks the key for 25 minutes.
 */
export async function recordFailedAttempt(
  ip: string,
  email?: string,
  endpoint: string = "/api/auth/sign-in"
): Promise<LockoutStatus> {
  if (!db) {
    return { locked: false, failedAttempts: 1 };
  }

  try {
    const ipHash = hashWithRateLimitSecret(ip);
    const emailHash = email ? hashWithRateLimitSecret(email) : null;
    const compositeKey = emailHash ? `${ipHash}:${emailHash}` : ipHash;

    const existing = await db
      .select()
      .from(authLockouts)
      .where(eq(authLockouts.key, compositeKey))
      .limit(1);

    const now = new Date();
    let newAttempts = 1;
    let lockedUntil: Date | null = null;

    if (existing.length > 0) {
      const prev = existing[0];
      // If previous lock expired, reset count to 1
      if (prev.lockedUntil && new Date(prev.lockedUntil).getTime() <= now.getTime()) {
        newAttempts = 1;
      } else {
        newAttempts = prev.failedAttempts + 1;
      }
    }

    const isLocking = newAttempts >= LOCKOUT_THRESHOLD;
    if (isLocking) {
      lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);

      // Log lockout to audit_logs
      try {
        await db.insert(auditLogs).values({
          action: "AUTH_LOCKOUT_TRIGGERED",
          entityType: "auth_lockouts",
          entityId: compositeKey,
          details: {
            endpoint,
            ipHash,
            failedAttempts: newAttempts,
            lockedUntil: lockedUntil.toISOString(),
          },
        });
      } catch {}
    }

    await db
      .insert(authLockouts)
      .values({
        key: compositeKey,
        ipHash,
        emailHash,
        failedAttempts: newAttempts,
        lockedUntil,
        lastAttemptAt: now,
      })
      .onConflictDoUpdate({
        target: authLockouts.key,
        set: {
          failedAttempts: newAttempts,
          lockedUntil,
          lastAttemptAt: now,
        },
      });

    if (isLocking) {
      return {
        locked: true,
        failedAttempts: newAttempts,
        retryAfterSeconds: 1500,
        message: "Too many attempts, try again in 25 minutes",
      };
    }

    return {
      locked: false,
      failedAttempts: newAttempts,
      message: "Invalid credentials",
    };
  } catch (error) {
    console.error("Record failed attempt error:", (error as Error).message);
    return { locked: false, failedAttempts: 1 };
  }
}

/**
 * Resets failed attempts after successful authentication.
 */
export async function resetLockout(ip: string, email?: string): Promise<void> {
  if (!db) return;

  try {
    const ipHash = hashWithRateLimitSecret(ip);
    const emailHash = email ? hashWithRateLimitSecret(email) : null;
    const compositeKey = emailHash ? `${ipHash}:${emailHash}` : ipHash;

    await db
      .update(authLockouts)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        lastAttemptAt: new Date(),
      })
      .where(eq(authLockouts.key, compositeKey));

    if (emailHash) {
      await db
        .update(authLockouts)
        .set({
          failedAttempts: 0,
          lockedUntil: null,
          lastAttemptAt: new Date(),
        })
        .where(eq(authLockouts.key, ipHash));
    }
  } catch (error) {
    console.error("Reset lockout error:", (error as Error).message);
  }
}
