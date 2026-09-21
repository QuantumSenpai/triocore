import { getLegalDocument } from "@/lib/dal/content";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Terms of Service | TrioCore",
  description: "Terms of Service for TrioCore Digital Solutions studio.",
};

const defaultTermsContent = `
## 1. Scope of Services
TrioCore provides software engineering, web application development, embedded hardware prototyping, and digital maintenance services.

## 2. Source Code Ownership
Upon 100% project settlement, client receives full, perpetual ownership of custom deliverables and source code.

## 3. Payment Terms
Payments are executed via milestone tranches as specified in the agreed project proposal.
`;

export default async function TermsPage() {
  const doc = await getLegalDocument("terms");

  const title = doc?.title || "Terms of Service";
  const version = doc?.version || "1.0";
  const lastUpdated = doc?.lastUpdated
    ? new Date(doc.lastUpdated).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "September 20, 2026";
  const content = doc?.content || defaultTermsContent;

  return (
    <div className="py-20 sm:py-28 px-5 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="border-b border-black/10 pb-8 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
          Legal & Compliance
        </span>
        <h1 className="mt-3 font-heading text-3xl sm:text-5xl font-black tracking-tight text-[#14141A]">
          {title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#2B2B38]">
          <span className="bg-[#374BFF]/10 text-[#374BFF] px-2.5 py-1 rounded-md">
            Version {version}
          </span>
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="prose max-w-none text-[#14141A] font-sans leading-relaxed whitespace-pre-line space-y-4">
        {content}
      </div>
    </div>
  );
}
