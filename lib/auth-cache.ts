import { db } from "@/lib/db";
import { adminMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export type AdminMemberRow = typeof adminMembers.$inferSelect;

interface CachedAdminMember {
  member: AdminMemberRow;
  expiresAt: number;
}

interface CachedSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  expiresAt: number;
}

const memberCache = new Map<string, CachedAdminMember>();
const inFlightMember = new Map<string, Promise<AdminMemberRow | null>>();

const sessionCache = new Map<string, CachedSession>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightSession = new Map<string, Promise<any>>();

/**
 * Extracts better-auth session token from request headers.
 */
export function extractSessionToken(headers: Headers): string | null {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Deduplicates and caches auth.api.getSession calls across parallel API routes.
 * Prevents 19 separate database roundtrips to Neon on every page load.
 */
export async function getSessionWithCache(headers: Headers, forceFresh = false) {
  const token = extractSessionToken(headers);
  const now = Date.now();

  if (token && !forceFresh) {
    const cached = sessionCache.get(token);
    if (cached && cached.expiresAt > now) {
      return cached.session;
    }

    const pending = inFlightSession.get(token);
    if (pending) {
      return pending;
    }
  }

  const fetchPromise = (async () => {
    try {
      const session = await auth.api.getSession({ headers });
      if (token && session) {
        sessionCache.set(token, { session, expiresAt: Date.now() + 60_000 });
      }
      return session;
    } catch (err) {
      console.error("[auth-cache] Error getting session:", err);
      return null;
    } finally {
      if (token) inFlightSession.delete(token);
    }
  })();

  if (token && !forceFresh) {
    inFlightSession.set(token, fetchPromise);
  }

  return fetchPromise;
}

/**
 * Invalidates the session cache.
 */
export function invalidateSessionCache(token?: string) {
  if (token) {
    sessionCache.delete(token);
    inFlightSession.delete(token);
  } else {
    sessionCache.clear();
    inFlightSession.clear();
  }
}

/**
 * Retrieves an admin member record with in-memory caching (30s TTL)
 * and in-flight request deduplication to prevent connection thundering herds
 * when multiple parallel API requests hit the server simultaneously.
 */
export async function getAdminMemberWithCache(
  userId: string,
  forceFresh = false
): Promise<AdminMemberRow | null> {
  const now = Date.now();

  if (!forceFresh) {
    const cached = memberCache.get(userId);
    if (cached && cached.expiresAt > now) {
      return cached.member;
    }

    // Deduplicate in-flight database roundtrips
    const pending = inFlightMember.get(userId);
    if (pending) {
      return pending;
    }
  }

  if (!db) return null;

  const fetchPromise = (async () => {
    try {
      const memberRows = await db
        .select()
        .from(adminMembers)
        .where(eq(adminMembers.userId, userId))
        .limit(1);

      if (memberRows.length > 0) {
        const member = memberRows[0];
        memberCache.set(userId, { member, expiresAt: Date.now() + 30_000 });
        return member;
      }
      return null;
    } catch (err) {
      console.error("[auth-cache] Error querying admin member:", err);
      return null;
    } finally {
      inFlightMember.delete(userId);
    }
  })();

  if (!forceFresh) {
    inFlightMember.set(userId, fetchPromise);
  }

  return fetchPromise;
}

/**
 * Invalidates the admin member cache entry for a given user,
 * or clears all cached members if no user ID is provided.
 */
export function invalidateAdminMemberCache(userId?: string) {
  if (userId) {
    memberCache.delete(userId);
    inFlightMember.delete(userId);
  } else {
    memberCache.clear();
    inFlightMember.clear();
  }
}
