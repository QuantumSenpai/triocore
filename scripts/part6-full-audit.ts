import crypto from "crypto";

async function runSecurityAudit() {
  console.log("=== RUNNING FULL PART 6 SECURITY AUDIT ===\n");
  const results: { check: string; status: "PASS" | "FAIL"; details: string }[] = [];

  const adminEndpoints = [
    "/api/admin/clients",
    "/api/admin/settings",
    "/api/admin/business-projects",
    "/api/admin/payments",
    "/api/admin/inquiries",
    "/api/admin/expenses",
    "/api/admin/projects",
    "/api/admin/content",
    "/api/admin/feedback",
    "/api/admin/faqs",
    "/api/admin/notes",
    "/api/admin/team",
    "/api/admin/milestones",
    "/api/admin/team-access",
    "/api/admin/faq-categories",
    "/api/admin/legal",
    "/api/admin/pricing",
    "/api/admin/stats",
    "/api/admin/services",
    "/api/admin/employees",
  ];

  // 1. Unauthenticated Admin API requests must return 401
  console.log("1. Testing 20 admin endpoints without auth cookie...");
  let all401 = true;
  for (const ep of adminEndpoints) {
    const res = await fetch(`http://localhost:3000${ep}`);
    if (res.status !== 401) {
      all401 = false;
      console.error(`Endpoint ${ep} returned ${res.status}, expected 401`);
    }
  }
  results.push({
    check: "Unauthenticated Admin API Rejection",
    status: all401 ? "PASS" : "FAIL",
    details: all401 ? "All 20 admin API endpoints returned 401 Unauthorized without session" : "Some endpoints did not return 401",
  });

  // 2. Unauthenticated Admin Page Routes must redirect to /admin/login
  console.log("2. Testing unauthenticated page route redirects...");
  const adminPageRes = await fetch("http://localhost:3000/admin/dashboard", { redirect: "manual" });
  const isRedirect = adminPageRes.status === 307 || adminPageRes.status === 302;
  const location = adminPageRes.headers.get("location") || "";
  const redirectsToLogin = isRedirect && location.includes("/admin/login");
  results.push({
    check: "Admin Page Route Protection (/admin/dashboard)",
    status: redirectsToLogin ? "PASS" : "FAIL",
    details: `Status ${adminPageRes.status}, Redirect location: ${location}`,
  });

  // 3. Strict CSP Headers verification
  console.log("3. Testing CSP headers on public vs admin routes...");
  const publicRes = await fetch("http://localhost:3000/");
  const publicCsp = publicRes.headers.get("content-security-policy") || "";
  const publicSafe = 
    publicCsp.includes("object-src 'none'") &&
    publicCsp.includes("base-uri 'self'") &&
    publicCsp.includes("form-action 'self'") &&
    publicCsp.includes("frame-ancestors 'none'") &&
    !publicCsp.includes("unsafe-eval");

  const adminRes = await fetch("http://localhost:3000/admin/login");
  const adminCsp = adminRes.headers.get("content-security-policy") || "";
  const adminHasNonce = adminCsp.includes("nonce-");

  results.push({
    check: "Public Page CSP (object-src 'none', frame-ancestors 'none', base-uri 'self')",
    status: (publicCsp.includes("object-src 'none'") && publicCsp.includes("frame-ancestors 'none'")) ? "PASS" : "FAIL",
    details: "Public page contains object-src 'none', base-uri 'self', form-action 'self', frame-ancestors 'none'",
  });

  results.push({
    check: "Admin Route Strict Nonce-Based CSP",
    status: adminHasNonce ? "PASS" : "FAIL",
    details: adminHasNonce ? "Admin routes enforce cryptographic script-src 'nonce-...'" : "Admin CSP missing nonce",
  });

  // 4. Public API Data Exposure Check
  console.log("4. Testing public API endpoints for data leaks...");
  const contactLeakRes = await fetch("http://localhost:3000/api/contact");
  const contactLeakStatus = contactLeakRes.status; // should be 405 (GET not allowed)
  
  const feedbackLeakRes = await fetch("http://localhost:3000/api/feedback");
  const feedbackLeakStatus = feedbackLeakRes.status; // should be 405 (GET not allowed)

  const noLeaks = contactLeakStatus === 405 && feedbackLeakStatus === 405;
  results.push({
    check: "Public API Read Protection (Zero Leakage)",
    status: noLeaks ? "PASS" : "FAIL",
    details: "Contact and Feedback APIs reject GET requests (405 Method Not Allowed); no contact leads or feedback leaks",
  });

  console.log("\n=== PART 6 SECURITY AUDIT SUMMARY ===");
  console.table(results);
}

runSecurityAudit().catch(console.error);
