import { describe, it, expect, beforeEach } from "vitest";
import {
  hashWithRateLimitSecret,
  checkLockout,
  recordFailedAttempt,
  resetLockout,
} from "@/lib/rate-limit";

describe("Rate Limiter & Lockout System", () => {
  const testIp = "192.168.1.100";
  const testEmail = "intruder@example.com";

  beforeEach(async () => {
    // Reset state for test user before each test
    await resetLockout(testIp, testEmail);
  });

  it("hashes IP and email deterministically with HMAC(RATE_LIMIT_SECRET)", () => {
    const hash1 = hashWithRateLimitSecret("127.0.0.1");
    const hash2 = hashWithRateLimitSecret("127.0.0.1");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
    expect(hashWithRateLimitSecret("127.0.0.2")).not.toBe(hash1);
  });

  it("returns generic invalid credentials prior to 10th failure without locking", async () => {
    for (let i = 1; i <= 9; i++) {
      const res = await recordFailedAttempt(testIp, testEmail);
      expect(res.locked).toBe(false);
      expect(res.failedAttempts).toBe(i);
      expect(res.message).toBe("Invalid credentials");
    }

    const status = await checkLockout(testIp, testEmail);
    expect(status.locked).toBe(false);
  });

  it("locks out user for 25 minutes on the 10th failed attempt", async () => {
    let result;
    for (let i = 1; i <= 10; i++) {
      result = await recordFailedAttempt(testIp, testEmail);
    }

    expect(result?.locked).toBe(true);
    expect(result?.failedAttempts).toBe(10);
    expect(result?.retryAfterSeconds).toBe(1500); // 25 min = 1500s
    expect(result?.message).toContain("Too many attempts, try again in 25 minutes");

    // Subsequent check confirms locked status
    const status = await checkLockout(testIp, testEmail);
    expect(status.locked).toBe(true);
    expect(status.retryAfterSeconds).toBeGreaterThan(1400);
  });

  it("resets failed attempts upon successful authentication", async () => {
    // Fail 5 times
    for (let i = 1; i <= 5; i++) {
      await recordFailedAttempt(testIp, testEmail);
    }

    // Now reset on success
    await resetLockout(testIp, testEmail);

    const status = await checkLockout(testIp, testEmail);
    expect(status.locked).toBe(false);
    expect(status.failedAttempts).toBe(0);
  });
});
