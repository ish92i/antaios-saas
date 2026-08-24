import puppeteer from "puppeteer-core";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

// In CI, use system chromium; otherwise use playwright cache
const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/chromium-browser";

const ROUTES = [
  "/",
  "/free-tool",
  "/resources",
  "/resources/eudr-overview",
  "/resources/eudr-checklist",
  "/resources/traceability-guide",
  "/resources/eudr-penalties",
  "/resources/eudr-sme-guide",
  "/resources/eudr-geolocation",
  "/resources/eudr-dds-filing",
  "/resources/eudr-vs-eutr",
  "/resources/commodity-coffee",
  "/resources/commodity-cocoa",
  "/resources/commodity-palm-oil",
  "/resources/commodity-wood",
  "/resources/commodity-soy",
  "/resources/commodity-rubber",
  "/resources/commodity-cattle",
  "/pricing",
];

const BASE_URL = process.env.PREVIEW_URL || "http://localhost:4173";

async function prerender() {
  console.log(`Prerendering ${ROUTES.length} routes from ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    process.stdout.write(`  ${route} ... `);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForSelector("#root > *", { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));

      const html = await page.content();

      const segment = route === "/" ? "" : route.slice(1);
      const outPath = resolve(distDir, segment, "index.html");

      const outDir = dirname(outPath);
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }

      writeFileSync(outPath, html, "utf-8");
      console.log("ok");
      success++;
    } catch (err) {
      console.log(`FAIL (${err.message})`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\nDone: ${success} ok, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

prerender();
