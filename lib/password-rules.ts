/**
 * Shared password complexity validation for TrioCore.
 * Enforces:
 * 1. Minimum 12 characters
 * 2. Rejection of any password containing "triocore" or "admin" (case-insensitive)
 */
export function validatePassword(password: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 12) {
    return { valid: false, error: "Password must be at least 12 characters long." };
  }
  const lower = password.toLowerCase();
  if (lower.includes("triocore")) {
    return { valid: false, error: "Password must not contain 'triocore'." };
  }
  if (lower.includes("admin")) {
    return { valid: false, error: "Password must not contain 'admin'." };
  }
  if (lower.includes("password")) {
    return { valid: false, error: "Password must not contain 'password'." };
  }
  return { valid: true };
}
