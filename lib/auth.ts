import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "./auth-whitelist";


const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.trim()}`;
  return "http://localhost:3000";
};

const trustedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "https://triocore.vercel.app",
  "https://triocore-*.vercel.app",
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "")] : []),
  ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "")] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL.trim()}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`] : []),
].filter(Boolean) as string[];

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }) : undefined,
  secret: process.env.BETTER_AUTH_SECRET || "triocore-dev-secret-super-safe-key-12345",
  baseURL: getBaseURL(),
  trustedOrigins,
  rateLimit: {
    enabled: false,
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isAdminEmail(user.email)) {
            return false;
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (db && session.userId) {
            const member = await db
              .select()
              .from(schema.adminMembers)
              .where(eq(schema.adminMembers.userId, session.userId))
              .limit(1);
            if (member.length > 0 && member[0].status === "disabled") {
              return false;
            }
          }
        },
      },
    },
  },
});
