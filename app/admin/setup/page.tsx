import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adminMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (db) {
    try {
      const owners = await db
        .select()
        .from(adminMembers)
        .where(eq(adminMembers.role, "owner"))
        .limit(1);

      if (owners.length > 0) {
        notFound();
      }
    } catch {
      // If table missing or error, proceed or notFound
    }
  }

  return <SetupForm />;
}
