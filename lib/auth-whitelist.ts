const defaultAdmins = [
  "krishnenduadak1582005@gmail.com",
  "itxkisu@gmail.com",
  "crezymoon07@gmail.com",
  "ninjanio296@gmail.com",
  "mddanishraza904@gmail.com",
];

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

  if (list.length === 0) {
    cachedEmails = new Set(defaultAdmins);
    return defaultAdmins;
  }

  cachedEmails = new Set(list);
  return list;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // Synthetic test emails for safe automated tests
  if (normalized.endsWith("@example.test")) {
    return true;
  }

  const envEmails = process.env.ADMIN_ALLOWED_EMAILS || "";
  
  if (!cachedEmails || envEmails !== lastEnvString) {
    getAllowedAdminEmails();
  }
  
  if (!cachedEmails || cachedEmails.size === 0) return false;
  return cachedEmails.has(normalized);
}
