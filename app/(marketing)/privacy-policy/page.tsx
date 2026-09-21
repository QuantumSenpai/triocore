import { getLegalDocument } from "@/lib/dal/content";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy Policy | TrioCore",
  description: "Privacy Policy for TrioCore - Learn how we collect, handle, and protect your data.",
};

const defaultPrivacyContent = `
## 1. Information We Collect
We collect information you provide directly to us through contact forms, feedback forms, and project inquiries (e.g. your name, email address, phone number, and project details).

## 2. How We Use Information
We use the information we collect to communicate with you about your project inquiries, deliver engineering services, and provide continuous technical support.

## 3. Data Protection
We implement industry-standard encryption, strict access controls, and rate limiting to protect your personal information against unauthorized access, alteration, or disclosure.

## 4. Contact Us
For questions regarding this policy, reach us directly at triocorebusiness@gmail.com.
`;

export default async function PrivacyPolicyPage() {
  const doc = await getLegalDocument("privacy-policy");

  const title = doc?.title || "Privacy Policy";
  const version = doc?.version || "1.0";
  const lastUpdated = doc?.lastUpdated
    ? new Date(doc.lastUpdated).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "September 20, 2026";
  const content = doc?.content || defaultPrivacyContent;

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
