import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adminInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { InviteForm } from "./invite-form";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export default async function AdminInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!code || !db) {
    notFound();
  }

  const tokenHash = crypto.createHash("sha256").update(code).digest("hex");
  const invites = await db
    .select()
    .from(adminInvites)
    .where(eq(adminInvites.tokenHash, tokenHash))
    .limit(1);

  if (invites.length === 0) {
    notFound();
  }

  const invite = invites[0];

  // If already used or expired, notFound
  if (invite.usedAt || new Date(invite.expiresAt).getTime() < Date.now()) {
    notFound();
  }

  return <InviteForm email={invite.email} token={code} role={invite.role} />;
}
