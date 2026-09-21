import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";

const originalFaqs = [
  {
    category: "Pricing",
    question: "Are your prices fixed or will they increase later?",
    answer:
      "Our package prices are completely fixed for the features outlined in your agreed project scope. If you decide to add brand-new pages or advanced functionality halfway through, we discuss the exact add-on price upfront before writing a single line of extra code. There are never unexpected surprise bills.",
    order: 1,
  },
  {
    category: "Timeline",
    question: "How long does a project typically take to deliver?",
    answer:
      "Starter and 1-page websites are delivered within 48 to 72 hours. Business websites (3–5 pages) take 4 to 7 days. Complex e-commerce systems, database portals, and custom web applications typically take 1 to 3 weeks depending on the feature list.",
    order: 2,
  },
  {
    category: "Code Ownership",
    question: "Who owns the source code and website after project delivery?",
    answer:
      "You receive 100% full, unencumbered ownership of all source code, database schemas, and digital design assets upon final milestone payment. TrioCore retains only the standard right to showcase the completed work in our digital portfolio, unless an exclusive NDA is requested.",
    order: 3,
  },
  {
    category: "Revisions",
    question: "What if I want revisions or changes after seeing the first version?",
    answer:
      "Every project includes revision rounds. If you want to tweak colors, swap images, adjust copy, or refine section layouts, we make the changes promptly during the staging review stage until you are 100% satisfied.",
    order: 4,
  },
  {
    category: "Hosting & Support",
    question: "Do you provide technical support after the website is launched?",
    answer:
      "Yes. Every completed project comes with a free post-launch warranty period to ensure everything runs smoothly. After that, you can opt into our monthly care packages starting at ₹299/month for continuous updates, monitoring, and database backups.",
    order: 5,
  },
];

async function main() {
  console.log("🚀 Seeding 5 Original Static FAQs into DEV Database...\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("No DATABASE_URL");
  const client = neon(dbUrl);

  const parsed = new URL(dbUrl);
  if (parsed.host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: DATABASE_URL points to production ep-noisy-hill-axqvb7jv!");
    process.exit(1);
  }
  console.log("DEV DB HOST:", parsed.host);

  // 1. Clear previous FAQs
  await client`DELETE FROM "faqs"`;

  // 2. Insert the 5 original FAQs
  for (const faq of originalFaqs) {
    const id = `faq-${faq.order}`;
    await client`
      INSERT INTO "faqs" (id, category, question, answer, "order", is_home, created_at)
      VALUES (${id}, ${faq.category}, ${faq.question}, ${faq.answer}, ${faq.order}, true, NOW())
    `;
  }

  // 3. Query back from database and compare
  const dbFaqs = await client`SELECT * FROM "faqs" ORDER BY "order" ASC`;
  console.log(`\nSuccessfully seeded ${dbFaqs.length} FAQs.\n`);

  console.log("================ COMPARISON: SEEDED VS ORIGINAL ================");
  for (let i = 0; i < dbFaqs.length; i++) {
    const dbItem = dbFaqs[i];
    const orig = originalFaqs[i];

    console.log(`\n[FAQ #${i + 1}] Category: ${dbItem.category}`);
    console.log(`ORIGINAL QUESTION : ${orig.question}`);
    console.log(`SEEDED QUESTION   : ${dbItem.question}`);
    console.log(`MATCH QUESTION    : ${orig.question === dbItem.question ? "EXACT MATCH" : "MISMATCH"}`);
    console.log(`ORIGINAL ANSWER   : ${orig.answer}`);
    console.log(`SEEDED ANSWER     : ${dbItem.answer}`);
    console.log(`MATCH ANSWER      : ${orig.answer === dbItem.answer ? "EXACT MATCH" : "MISMATCH"}`);
  }

  // 4. Test Home & public /faq render
  console.log("\n================ PUBLIC RENDER VERIFICATION ================");
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();

  console.log(`Homepage status: ${homeRes.status}`);
  for (const faq of originalFaqs) {
    const renderedInHome = homeHtml.includes(faq.question);
    console.log(`Rendered on Homepage: "${faq.question}" -> ${renderedInHome ? "YES" : "NO"}`);
  }

  const faqPageRes = await fetch("http://localhost:3000/faq");
  const faqPageHtml = await faqPageRes.text();

  console.log(`\n/faq page status: ${faqPageRes.status}`);
  for (const faq of originalFaqs) {
    const renderedInFaq = faqPageHtml.includes(faq.question);
    console.log(`Rendered on /faq page: "${faq.question}" -> ${renderedInFaq ? "YES" : "NO"}`);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
