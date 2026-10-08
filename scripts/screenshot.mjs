// Screenshot a page of the local theme preview at the verification widths.
// Usage: node scripts/screenshot.mjs <url> <outPrefix> [widths=1440,768,390,320] [fullPage=1]
// Requires the global playwright install (PLAYWRIGHT_BROWSERS_PATH is preconfigured in this env).
// Cloud-sandbox note: the store hostname is blocked for the browser, so requests to it are fetched
// with curl through the egress proxy (same store on the allowed hostname) and handed to the page.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire('/opt/node22/lib/node_modules/playwright/package.json');
const { chromium } = require('playwright');
const [url, outPrefix, widthsArg = '1440,768,390,320', fullArg = '1'] = process.argv.slice(2);
if (!url || !outPrefix) { console.error('usage: node scripts/screenshot.mjs <url> <outPrefix> [widths] [fullPage]'); process.exit(1); }
const BLOCKED_HOST = 'yxmgh4-cn.myshopify.com';
const ALLOWED_HOST = 'mekupelet-store.myshopify.com';
const cache = new Map();
function fetchViaCurl(target) {
  if (cache.has(target)) return cache.get(target);
  let result = null;
  try {
    const out = execFileSync('curl', ['-sS', '-L', '--max-time', '30', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/141 Safari/537.36', '-w', '\n%{content_type}', target], { maxBuffer: 64 * 1024 * 1024 });
    const nl = out.lastIndexOf(0x0a);
    result = { body: out.subarray(0, nl), contentType: out.subarray(nl + 1).toString().trim() || 'application/octet-stream' };
  } catch (e) { console.error('curl failed:', target.slice(0, 120)); result = null; }
  cache.set(target, result);
  return result;
}
const widths = widthsArg.split(',').map(Number);
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, locale: 'he-IL', ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  // The dev server also proxies /cdn/* itself (and cannot reach the store from the sandbox).
  const reroute = (u) => u.includes(BLOCKED_HOST)
    ? u.replace(BLOCKED_HOST, ALLOWED_HOST)
    : u.replace(/^https?:\/\/127\.0\.0\.1:\d+\/cdn\//, `https://${ALLOWED_HOST}/cdn/`);
  // Live-site URLs on the allowed host are fetched through curl as well (the browser has no proxy).
  await page.route((u) => u.hostname === BLOCKED_HOST || u.hostname === ALLOWED_HOST || (u.hostname === '127.0.0.1' && u.pathname.startsWith('/cdn/')), async (route) => {
    const target = reroute(route.request().url());
    const res = fetchViaCurl(target);
    if (!res) return route.abort();
    return route.fulfill({ status: 200, contentType: res.contentType, body: res.body });
  });
  // Shop login embeds poll forever; block them so 'load' settles. Then give lazy images a moment.
  await page.route('**/services/login_with_shop/**', (route) => route.abort());
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 600)); window.scrollTo(0, 0); });
  await page.waitForTimeout(1500);
  const file = `${outPrefix}-${w}.png`;
  await page.screenshot({ path: file, fullPage: fullArg === '1' });
  const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight}`));
  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  const broken = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length);
  console.log(`${file} fonts=[${[...new Set(fonts)].join(', ')}] body=${bodyFont} brokenImages=${broken}`);
  await ctx.close();
}
await browser.close();
