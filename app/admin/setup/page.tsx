import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adminMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (db) {
    let hasAdmin = false;
    try {
      const admins = await db
        .select()
        .from(adminMembers)
        .limit(1);

      hasAdmin = admins.length > 0;
    } catch {
      // If table missing or query error
    }

    if (hasAdmin) {
      notFound();
    }
  }

  return <SetupForm />;
}
