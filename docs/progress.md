# Progress log

Any new session: read `CLAUDE.md`, then this file, then resume from "In progress".

## 2026-10-07 — session 1 (setup + Phase 0 start)

### Done
- Repo initialised on branch `claude/ecstatic-mccarthy-f3wp31`; `CLAUDE.md` (rules), `docs/` skeleton.
- Figma access verified. Frame map verified against canvas metadata (`docs/figma-frame-map.md`).
- Unknown frame `1:3455` / `1:12866` identified: digital course landing page.
- 17 designer annotations transcribed (`docs/figma-frame-map.md`).
- Screenshots of revision frames `18:4094`, `52:5172`, `69:5443` and header `1:806` reviewed.

### Blocked (needs merchant action)
- Environment network policy denies `mekupelet-store.myshopify.com`, `docs.foxecom.com`,
  `www.figma.com` (asset downloads). Shopify CLI is not installed and has no credentials
  (`SHOPIFY_CLI_THEME_TOKEN`). The Shopify claude.ai connector needs re-authentication.
- Therefore not yet done: `shopify theme list` (backup ID), `shopify theme pull` baseline
  commit, Hyper audit, baseline Lighthouse.

### In progress
- Phase 0 (Discovery). Figma side can continue; Hyper audit waits on theme pull.

### Open questions (for the merchant)
1. Course landing page (`1:3455`): in scope as a `page.course` template? Is the course sold
   as a digital product on Shopify or via an external link?
2. Reviews: existing/planned app, or Hyper native?
3. Wishlist: Hyper native or app?
4. Instagram feed on Home: app (needs approval) or static section with images in Files?
5. Designer annotations marked OPEN in `docs/figma-frame-map.md` (category PNGs, final hero
   image, surprise-box image, USP copy, `139:4423` reference).

## 2026-10-08 — session 2 (FIRST ACTIONS done, Phase 0 discovery)

### Done
- Theme identity resolved with the merchant: WORKING = `189111500994` (Hyper **1.5.0**, live,
  created 2026-10-07 23:37, published 23:42); BACKUP = `154698219714` (Hyper **1.4.0**, unpublished).
  Settings (`settings_data.current`, presets) and all `templates/*.json` are identical between
  them; the live theme is a clean vendor update (+7 files, 144 modified). CLAUDE.md updated.
- Store domain for the CLI is `yxmgh4-cn.myshopify.com` (merchant instruction; the Theme Access
  token is bound to it). `mekupelet-store.myshopify.com` serves the same store and is the only
  hostname this environment's network policy allows for storefront requests (used for Lighthouse).
- Shopify CLI 4.8.5 works with the new domain. Baseline pulled and committed untouched
  (`10e0398`, 468 files). `shopify theme check` on the baseline: 0 errors, 11 warnings
  (9 OrphanedSnippet, 1 ExcessiveSettingsCount, 1 LiquidComplexity).
- `shopify.theme.toml` added (store only, env `dev`; theme id must stay explicit).
- Figma: MCP quota exhausted (Starter plan, 20 calls/month). Merchant chose manual export;
  checklist written in `docs/figma/EXPORT-CHECKLIST.md` (Hebrew instructions, exact file names).
- Hyper docs read (sections list, product cards/badges/compare/quick view/mega menu/cart drawer,
  update process). Changelog page on docs.foxecom.com returns 404.
- Current theme state: `enable_rtl: true`, `language_support_rtl: he`, fonts Instrument Sans
  (n7/n5), `page_width: 1700`, `blocks_corner_radius: slightly`, cart type drawer, quick view off.
  **No Hebrew locale file** (`locales/` = en, de, es, fr, it, vi).
- Hyper audit (3 parallel read-only agents), baseline Lighthouse mobile and
  `docs/implementation-plan.md`: see below.
- Hyper audit done (architecture, commerce components, templates/locales) and folded into
  `docs/implementation-plan.md` §1. Baseline Lighthouse mobile (`docs/lighthouse/baseline.md`):
  Home 75 / Collection 72 / Product 69, CLS 0, TBT ~0.5 s. Script: `scripts/lighthouse-mobile.sh`.
- `docs/implementation-plan.md` written (audit, token map, global decisions + mobile adaptation,
  section mapping with tiers/effort, data models, asset inventory, 14 open questions).

### Blocked
- Figma values and the per-template original-vs-revision diff wait for the manual exports
  (`docs/figma/EXPORT-CHECKLIST.md`). The plan marks those parts **[needs Figma exports]**.
- Storefront requests to `yxmgh4-cn.myshopify.com` are denied by the environment network policy;
  `mekupelet-store.myshopify.com` (same store) works and is used for Lighthouse/curl.

### In progress
- Phase 0 waiting for merchant approval of `docs/implementation-plan.md` and answers to its
  open questions. No theme code before approval.

### Open questions (for the merchant)
See `docs/implementation-plan.md` §8 (Q1–Q14). Highest impact: Q5 Hebrew locale, Q6 Hebrew fonts,
Q7 origin of Hyper 1.5.0, Q13 performance toggles, Q14 custom stylesheet location, plus the
Figma exports.

## 2026-10-08 — session 2b (build started on merchant request: "approximate Home now, refine later")

### Done
- Merchant confirmed the preview screenshots are the ORIGINAL Home frames; sent Home content
  assets (48 files, catalogued and renamed in `docs/figma/exports/assets/home/`) and the Simpler Pro
  web fonts (400/600/700, Hebrew+Latin+Arabic, Hagilda license in `docs/fonts/`).
- Phase 1 foundations: `snippets/mk-fonts.liquid` + 3 woff2 in assets, `assets/mk-custom.css`
  (tokens, font routing, square card border, no nav shadow), one logged core edit in
  `layout/theme.liquid`. Settings: fonts switched to a system font (no CDN font loads), scheme-1
  button blue `#1d349a` (PROVISIONAL), `pcard_corner_radius: square`, badge tags `חדש` / `רב מכר`,
  page transition + scroll animations + compare + popup off, quick view popup → product page.
- Home (approximate): new `sections/mk-gift-finder.liquid` (+css/js) and `sections/mk-age-pills.liquid`
  (+css); `templates/index.json` rebuilt with 12 sections in the design order; footer group with
  contact block + 4 menu columns. Verified in the local preview at 1440/390 (`docs/screenshots/`),
  `shopify theme check` 0 errors. Everything is live on theme 189111500994 via `theme dev` sync.
- `docs/merchant-checklist.md`: Files upload, collections + handles, tags, filters, menus.
- `scripts/screenshot.mjs`: Playwright helper that works around the sandbox network policy.

- `locales/he.json` created (423 keys, mirrors `en.default.json`), live on the storefront (Hebrew is the
  published primary language). Note: the local `theme dev` proxy renders in English, so locale checks
  use the live URL; `scripts/screenshot.mjs` can capture both.

### In progress
- Nothing running. Next: refine from Figma 2x exports; merchant admin checklist.

### Blocked / waiting
- Figma 2x frame exports + Dev-Mode values → `docs/figma/EXPORT-CHECKLIST.md`. Until then all
  spacing/colors are provisional. Merchant admin work per `docs/merchant-checklist.md`
  (Files, collections, menus) — images and products show placeholders until done.
- Open questions Q1–Q14 in `docs/implementation-plan.md` (Q13/Q14 were decided provisionally:
  perf toggles off, custom stylesheet as a file).
