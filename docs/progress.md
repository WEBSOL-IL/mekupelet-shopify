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
