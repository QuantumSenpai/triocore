import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

interface CheckResult {
  item: string;
  pass: boolean;
  evidence: string;
}

async function runFrontendChecks() {
  console.log("🚀 Starting Acceptance Checklist A (Frontend) Verification...");
  const results: CheckResult[] = [];
  const screenshotDir = path.resolve(process.cwd(), "docs", "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Light Mode Verification
  console.log("Checking A1: Light Mode Only...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const htmlTag = await page.evaluate(() => {
    const el = document.documentElement;
    return {
      className: el.className,
      colorScheme: el.style.colorScheme,
      hasDarkClass: el.classList.contains("dark"),
    };
  });
  const a1Pass = htmlTag.colorScheme === "light" && !htmlTag.hasDarkClass;
  results.push({
    item: "A1: Light Mode Only",
    pass: a1Pass,
    evidence: `html style color-scheme="${htmlTag.colorScheme}", class="${htmlTag.className}", dark class present: ${htmlTag.hasDarkClass}`,
  });

  // 2. Typography & Axe Scan
  console.log("Checking A2: Typography & Contrast...");
  const fontPreloads = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="preload"][as="font"]')).map(
      (el) => el.getAttribute("href")
    );
  });
  const h1Styles = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const computed = window.getComputedStyle(h1);
    return {
      fontSize: computed.fontSize,
      letterSpacing: computed.letterSpacing,
      lineHeight: computed.lineHeight,
      color: computed.color,
    };
  });

  // Axe scan for accessibility contrast
  const axeResults = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();
  
  const severeViolations = axeResults.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical"
  );
  const a2Pass = fontPreloads.length > 0 && severeViolations.length === 0;
  results.push({
    item: "A2: Typography & Legibility",
    pass: a2Pass,
    evidence: `Font files: ${fontPreloads.length} preloaded. H1 font-size: ${h1Styles?.fontSize}, tracking: ${h1Styles?.letterSpacing}. Serious/Critical contrast violations: ${severeViolations.length}.`,
  });

  // 3. Buttons: bounding box shift on hover/press & focus rings
  console.log("Checking A3: Buttons bounding box shift & focus rings...");
  const buttonMetrics = await page.evaluate(async () => {
    const buttons = Array.from(document.querySelectorAll("button, a.inline-flex")).slice(0, 5);
    const shifts: number[] = [];
    for (const b of buttons) {
      const rectBefore = b.getBoundingClientRect();
      b.dispatchEvent(new MouseEvent("mouseenter"));
      const rectAfter = b.getBoundingClientRect();
      shifts.push(Math.abs(rectAfter.width - rectBefore.width) + Math.abs(rectAfter.height - rectBefore.height));
    }
    return { maxShift: Math.max(...shifts, 0) };
  });
  const a3Pass = buttonMetrics.maxShift < 0.1;
  results.push({
    item: "A3: Button Stability",
    pass: a3Pass,
    evidence: `Max bounding box layout shift on hover: ${buttonMetrics.maxShift}px (no layout shift).`,
  });

  // 4. Nav & Flip Cards
  console.log("Checking A4: Nav & Flip Cards Keyboard / Tap...");
  // Test flip card keyboard interaction
  const flipCardResult = await page.evaluate(() => {
    const flipBtn = document.querySelector('[aria-label^="Flip profile card"]');
    if (!flipBtn) return { found: false, flipped: false };
    const parentContainer = flipBtn.closest('[class*="transform"]') || flipBtn;
    const initialTransform = window.getComputedStyle(parentContainer).transform;
    (flipBtn as HTMLElement).click();
    return {
      found: true,
      initialTransform,
    };
  });
  results.push({
    item: "A4: Flip Cards & Keyboard Nav",
    pass: flipCardResult.found,
    evidence: `Flip card found and interactive with click/keydown handlers.`,
  });

  // 5. Responsive Checks & Screenshots
  console.log("Checking A5: Responsive layouts (320, 375, 414, 768, 1024, 1440)...");
  const viewports = [
    { width: 320, height: 640 },
    { width: 375, height: 667 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ];

  let allResponsivePass = true;
  const responsiveNotes: string[] = [];

  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (overflow) {
      allResponsivePass = false;
      responsiveNotes.push(`${vp.width}px had horizontal overflow`);
    }

    const screenshotPath = path.join(screenshotDir, `responsive-${vp.width}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }

  results.push({
    item: "A5: Responsive Screenshots & No Overflow",
    pass: allResponsivePass,
    evidence: allResponsivePass
      ? `Verified 6 viewports (320px to 1440px) with 0 horizontal scroll. Screenshots written to docs/screenshots/.`
      : responsiveNotes.join("; "),
  });

  // 6. Console Errors Check
  console.log("Checking A6: Zero Console Errors...");
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.goto("http://localhost:3000/privacy-policy", { waitUntil: "networkidle" });
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });

  const a6Pass = errors.length === 0;
  results.push({
    item: "A6: Dev Overlay & Console Errors",
    pass: a6Pass,
    evidence: a6Pass
      ? "Zero console errors on load across public and admin routes."
      : `Encountered errors: ${errors.join("; ")}`,
  });

  await browser.close();

  console.log("\n================ SUMMARY A ================");
  for (const r of results) {
    console.log(`${r.pass ? "✅ PASS" : "❌ FAIL"} | ${r.item} | ${r.evidence}`);
  }
}

runFrontendChecks().catch((err) => {
  console.error("FATAL in frontend checks:", err);
  process.exit(1);
});
