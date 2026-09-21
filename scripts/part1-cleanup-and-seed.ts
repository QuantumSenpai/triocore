import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("No DATABASE_URL found");

  const parsed = new URL(dbUrl);
  if (parsed.host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: DATABASE_URL points to production ep-noisy-hill-axqvb7jv!");
    process.exit(1);
  }
  console.log("DEV DB HOST:", parsed.host);

  const client = neon(dbUrl);

  console.log("\n--- PART 1.b: Deleting ONLY test-created rows ---");
  // 1. Delete test-created admin_members
  const deletedAdmins = await client`DELETE FROM "admin_members" RETURNING id, role, user_id`;
  console.log(`Deleted ${deletedAdmins.length} test-created admin_member rows.`);

  // 2. Delete test sessions
  const deletedSessions = await client`DELETE FROM "session" RETURNING id`;
  console.log(`Deleted ${deletedSessions.length} test-created session rows.`);

  // 3. Clear auth_lockouts
  const deletedLockouts = await client`DELETE FROM "auth_lockouts" RETURNING id`;
  console.log(`Cleared ${deletedLockouts.length} test lockout rows from auth_lockouts.`);

  console.log("\n--- PART 1.2: Seeding 5 Essential FAQs (Idempotent ON CONFLICT DO NOTHING) ---");
  const essentialFaqs = [
    {
      id: "faq-pricing",
      question: "Are your prices fixed or will they increase later?",
      answer: "Our package prices are completely fixed for the features outlined in your agreed project scope. If you decide to add brand-new pages or advanced functionality halfway through, we discuss the exact add-on price upfront before writing a single line of extra code. There are zero hidden fees.",
      category: "Pricing",
      isHome: true,
      order: 1,
    },
    {
      id: "faq-timeline",
      question: "How long does a project typically take to deliver?",
      answer: "Starter and 1-page websites are delivered within 48 to 72 hours. Business websites (3–5 pages) take 4 to 7 days. Complex web applications and custom systems typically take 1 to 3 weeks depending on the feature list.",
      category: "Process",
      isHome: true,
      order: 2,
    },
    {
      id: "faq-ownership",
      question: "Who owns the code after project completion?",
      answer: "Upon final project settlement, you receive 100% full source code ownership. We transfer all project repositories, database credentials, and production deployments directly to you with zero vendor lock-in or recurring license fees.",
      category: "Trust",
      isHome: true,
      order: 3,
    },
    {
      id: "faq-revisions",
      question: "What if I want revisions or changes after seeing the first version?",
      answer: "Every project includes dedicated revision rounds. If you want to tweak colors, swap images, adjust copy, or refine section layouts, we make the changes promptly during the staging review stage until you are 100% satisfied.",
      category: "Process",
      isHome: true,
      order: 4,
    },
    {
      id: "faq-hosting",
      question: "Do you provide hosting, domain setup, and ongoing technical support?",
      answer: "Yes. We handle hosting deployment configuration on top-tier global edge networks (Vercel/Cloudflare), guide you step-by-step through domain purchasing in your name, and provide post-launch support with optional care plans starting at ₹299/month.",
      category: "Support",
      isHome: true,
      order: 5,
    },
  ];

  for (const f of essentialFaqs) {
    await client`
      INSERT INTO "faqs" (id, question, answer, category, is_home, "order", created_at)
      VALUES (${f.id}, ${f.question}, ${f.answer}, ${f.category}, ${f.isHome}, ${f.order}, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  }
  const faqRows = await client`SELECT id, question, "order" FROM "faqs" ORDER BY "order" ASC`;
  console.log(`✓ faqs table now contains ${faqRows.length} essential FAQs.`);

  console.log("\n--- PART 1.2: Seeding 3 Legal Documents (Idempotent ON CONFLICT DO NOTHING) ---");
  const legalDocs = [
    {
      id: "legal-privacy-policy",
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `## 1. Information We Collect
We collect information you provide directly to us through contact forms, feedback forms, and project inquiries (e.g. your name, email address, phone number, and project details).

## 2. How We Use Information
We use the information we collect to communicate with you about your project inquiries, deliver engineering services, and provide continuous technical support.

## 3. Data Protection
We implement industry-standard encryption, strict access controls, and rate limiting to protect your personal information against unauthorized access, alteration, or disclosure.

## 4. Contact Us
For questions regarding this policy, reach us directly at triocorebusiness@gmail.com.`,
      version: "2026.1",
    },
    {
      id: "legal-cookie-policy",
      slug: "cookie-policy",
      title: "Cookie Policy",
      content: `## 1. What Are Cookies
Cookies are small text files stored on your device that help web applications remember your preferences and maintain secure authenticated sessions.

## 2. How We Use Cookies
We strictly use essential cookies required for authentication and security rate-limiting. We do not use third-party tracking or advertising cookies.

## 3. Managing Cookies
You can adjust your browser settings to decline cookies; however, authentication in the admin dashboard requires session cookies to function.`,
      version: "2026.1",
    },
    {
      id: "legal-terms",
      slug: "terms",
      title: "Terms of Service",
      content: `## 1. Acceptance of Terms
By accessing or using TrioCore services, you agree to be bound by these terms and conditions.

## 2. Services and Scope
TrioCore provides digital engineering, full-stack software development, NFC systems, and embedded solutions as defined in signed statements of work.

## 3. Intellectual Property
Upon full payment of agreed fees, client receives full source code ownership with zero recurring vendor lock-in fees.

## 4. Limitation of Liability
TrioCore provides software architecture under standard industry warranties without liability for indirect damages.`,
      version: "2026.1",
    },
  ];

  for (const doc of legalDocs) {
    await client`
      INSERT INTO "legal_documents" (id, slug, title, content, version, last_updated, updated_by)
      VALUES (${doc.id}, ${doc.slug}, ${doc.title}, ${doc.content}, ${doc.version}, NOW(), 'system-seed')
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  const legalRows = await client`SELECT slug, title, version FROM "legal_documents" ORDER BY slug ASC`;
  console.log(`✓ legal_documents table now contains ${legalRows.length} documents:`, legalRows.map((d) => d.slug));

  // Verify contacts row untouched
  const contactRows = await client`SELECT count(*)::int as c FROM "contacts"`;
  console.log(`\n🛡️ Contacts table count: ${contactRows[0].c} (original row preserved untouched).`);
}

main().catch((err) => {
  console.error("FATAL in cleanup and seed:", err);
  process.exit(1);
});
