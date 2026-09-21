import { getFaqContent } from "@/lib/dal/content";
import { FAQSection } from "@/components/sections/faq";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | TrioCore",
  description:
    "Got questions? Find clear answers on our pricing, timelines, source code ownership, revisions, and post-launch support.",
};

export default async function FAQPage() {
  const dbFaqs = await getFaqContent();

  return (
    <div className="py-16 sm:py-24">
      <FAQSection initialFaqs={dbFaqs} />
    </div>
  );
}
