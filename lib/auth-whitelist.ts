let cachedEmails: Set<string> | null = null;
let lastEnvString = "";

export function getAllowedAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_ALLOWED_EMAILS || "";
  if (cachedEmails && envEmails === lastEnvString) {
    return Array.from(cachedEmails);
  }
  
  lastEnvString = envEmails;
  const list = envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  cachedEmails = new Set(list);
  return list;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const envEmails = process.env.ADMIN_ALLOWED_EMAILS || "";
  
  if (!cachedEmails || envEmails !== lastEnvString) {
    getAllowedAdminEmails();
  }
  
  if (!cachedEmails || cachedEmails.size === 0) return true;
  return cachedEmails.has(normalized);
}
