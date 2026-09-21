import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/password-rules";

describe("Password Rules Enforcement", () => {
  it("rejects passwords shorter than 12 characters", () => {
    expect(validatePassword("Short1!").valid).toBe(false);
    expect(validatePassword("12345678901").valid).toBe(false);
    expect(validatePassword("123456789012").valid).toBe(true);
  });

  it("rejects passwords containing 'triocore' case-insensitively", () => {
    expect(validatePassword("SecureTriocore2026!").valid).toBe(false);
    expect(validatePassword("TrioCoreSecure2026!").valid).toBe(false);
    expect(validatePassword("hello-TRIOCORE-world").valid).toBe(false);
  });

  it("rejects passwords containing 'admin' case-insensitively", () => {
    expect(validatePassword("SuperAdminPass2026!").valid).toBe(false);
    expect(validatePassword("Pass@ADMIN123456").valid).toBe(false);
    expect(validatePassword("my-admin-secret-2026").valid).toBe(false);
  });

  it("accepts valid passwords meeting all criteria", () => {
    expect(validatePassword("QuantumVault99!#").valid).toBe(true);
    expect(validatePassword("HyperSonicSecure2026!").valid).toBe(true);
  });
});
