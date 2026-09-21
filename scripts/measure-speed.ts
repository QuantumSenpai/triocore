async function measure() {
  const routes = [
    { name: "Public Home (/)", url: "http://localhost:3000/" },
    { name: "Public FAQ (/faq)", url: "http://localhost:3000/faq" },
    { name: "Admin Login (/admin/login)", url: "http://localhost:3000/admin/login" },
    { name: "Admin Setup (/admin/setup)", url: "http://localhost:3000/admin/setup" },
    { name: "API Feedback (/api/feedback)", url: "http://localhost:3000/api/feedback", method: "GET" },
  ];

  console.log("| Route | Status | TTFB / Response Time |");
  console.log("|---|---|---|");

  for (const r of routes) {
    // Warm up
    await fetch(r.url, { method: r.method || "GET" });

    // Measure 3 iterations
    const times: number[] = [];
    let status = 0;
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const res = await fetch(r.url, { method: r.method || "GET" });
      const elapsed = performance.now() - start;
      times.push(elapsed);
      status = res.status;
    }
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    console.log(`| ${r.name} | ${status} | ${avg} ms |`);
  }
}

measure();
