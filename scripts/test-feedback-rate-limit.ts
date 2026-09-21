import { db } from "../lib/db";
import { feedbackReports, authLockouts } from "../lib/db/schema";
import { eq, like } from "drizzle-orm";
import crypto from "crypto";

async function testFeedbackRateLimit() {
  console.log("=== Testing Feedback DB Rate Limiting (5/hr per IP) ===");

  const fakeIp = `192.0.2.${Math.floor(Math.random() * 200 + 1)}`;
  const secret = process.env.RATE_LIMIT_SECRET || "feedback-rate-limit-secret";
  const ipHash = crypto.createHmac("sha256", secret).update(fakeIp).digest("hex");
  const rateLimitKey = `feedback:${ipHash}`;

  const submittedIds: string[] = [];

  try {
    for (let i = 1; i <= 6; i++) {
      const res = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": fakeIp,
        },
        body: JSON.stringify({
          type: "feedback",
          message: `Synthetic test feedback message iteration #${i}`,
          email: "synthetic-rate-test@example.test",
        }),
      });

      const data = await res.json();
      console.log(`Submission #${i}: status=${res.status}, body=`, data);

      if (res.status === 200 && data.id) {
        submittedIds.push(data.id);
      }

      if (i === 6) {
        if (res.status === 429) {
          console.log("✅ SUCCESS: 6th submission was correctly rate-limited with HTTP 429!");
        } else {
          throw new Error(`Expected 429 for 6th submission but received ${res.status}`);
        }
      }
    }
  } finally {
    console.log("Cleaning up test rate-limit and feedback rows...");
    if (db) {
      await db.delete(authLockouts).where(eq(authLockouts.key, rateLimitKey));
      for (const id of submittedIds) {
        await db.delete(feedbackReports).where(eq(feedbackReports.id, id));
      }
    }
    console.log("Cleanup complete.");
  }
}

testFeedbackRateLimit().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
