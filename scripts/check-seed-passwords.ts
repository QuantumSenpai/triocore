import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { auth } from "../lib/auth";

const defaultSeedPw = "Admin@TrioCore2026!";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

async function checkPasswords() {
  const emails = [
    "crezymoon07@gmail.com",
    "ninjanio296@gmail.com",
    "mddanishraza904@gmail.com",
    "krishnenduadak1582005@gmail.com"
  ];

  console.log("=== CHECKING SEED PASSWORD MATCHES ===");
  for (const email of emails) {
    try {
      const res = await auth.api.signInEmail({
        body: {
          email,
          password: defaultSeedPw
        }
      });
      if (res && res.user) {
        console.log(`ACCOUNT: ${maskEmail(email)} | RESULT: MATCH`);
      } else {
        console.log(`ACCOUNT: ${maskEmail(email)} | RESULT: NO MATCH`);
      }
    } catch {
      console.log(`ACCOUNT: ${maskEmail(email)} | RESULT: NO MATCH`);
    }
  }
}

checkPasswords().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
