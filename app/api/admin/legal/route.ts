import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { legalDocuments, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ documents: [] });
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const doc = await db.select().from(legalDocuments).where(eq(legalDocuments.slug, slug)).limit(1);
      return NextResponse.json({ document: doc[0] || null });
    }

    const docs = await db.select().from(legalDocuments);
    return NextResponse.json({ documents: docs });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { slug, title, content, version } = body;

    if (!slug || !content) {
      return NextResponse.json({ error: "Slug and content are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const now = new Date();
    const existing = await db.select().from(legalDocuments).where(eq(legalDocuments.slug, slug)).limit(1);

    let doc;
    if (existing.length > 0) {
      const prevVersion = existing[0].version || "1.0";
      // If version not explicitly provided, bump patch e.g. 1.0 -> 1.1
      let newVersion = version;
      if (!newVersion) {
        const parts = prevVersion.split(".");
        const minor = parseInt(parts[1] || "0", 10) + 1;
        newVersion = `${parts[0]}.${minor}`;
      }

      const res = await db.update(legalDocuments).set({
        title: title || existing[0].title,
        content,
        version: newVersion,
        lastUpdated: now,
        updatedBy: authCheck.user?.email || "admin",
      }).where(eq(legalDocuments.slug, slug)).returning();
      doc = res[0];
    } else {
      const res = await db.insert(legalDocuments).values({
        slug,
        title: title || slug,
        content,
        version: version || "1.0",
        lastUpdated: now,
        updatedBy: authCheck.user?.email || "admin",
      }).returning();
      doc = res[0];
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_LEGAL_DOCUMENT",
        entityType: "legal_documents",
        entityId: slug,
        details: { slug, version: doc.version },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: `legal_${slug}`,
        data: doc,
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath(`/${slug}`);
    revalidatePath(`/privacy-policy`);
    revalidatePath(`/terms`);
    revalidatePath(`/cookie-policy`);

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
