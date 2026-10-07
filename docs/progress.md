# Progress log

Any new session: read `CLAUDE.md`, then this file, then resume from "In progress".

## 2026-10-07 — session 2 (baseline pull + Phase 0 discovery)

### Done
- Theme list verified through the Admin GraphQL connector: working `154698219714` (Hyper, MAIN),
  backup `189107896514` ("Copy of Hyper", unpublished). Both recorded in `CLAUDE.md`.
- Full untouched Hyper theme (460 files) pulled read-only via the Admin GraphQL theme-files API
  and committed as the git baseline (md5-verified; `vendor.js` from the CDN, also verified).
- Hyper architecture audit written to `docs/hyper-audit.md` (CSS vars, breakpoints, RTL, JS,
  sections, product card, header, footer, cart drawer, facets, product page, bundles, perf).
- Baseline Lighthouse mobile (Home / Collection / Product, 2 runs each) in
  `docs/implementation-plan.md` §8.
- Figma: node trees (text, fills, strokes, radii, shadows, fonts) for `18:4094`, `52:5172`,
  `69:5443`, `1:266`, `1:1794` → tokens, global decisions, original-vs-revision diff, mobile
  adaptation proposal, section mapping, data models, asset inventory, open questions, all in
  `docs/implementation-plan.md`.
- Confirmed Hyper facts that shape the plan: `enable_rtl` + `language_support_rtl = he` switch
  `dir="rtl"` by locale; badges new/hot/coming are tag-list settings, sale is compare-at;
  templates currently hold Hyper demo content; storefront language is still English.

### Blocked (needs merchant action) — see plan §9
- `SHOPIFY_CLI_THEME_TOKEN` is rejected (401) → no `shopify theme dev` preview. Workaround confirmed:
  the Shopify connector app has `write_themes`, so pushes can go through `themeFilesUpsert`
  (only ever to theme 154698219714). `shopify theme check` works offline (baseline 0 errors, 11 warnings).
  A fresh Theme Access password is still recommended for hot-reload preview.
- Figma MCP and REST quotas exhausted on the Starter plan (~5 days) → no screenshots, no mobile
  frames, no `1:949`, no deeper node data. Everything visual in the plan is marked VERIFY.
- Hebrew storefront locale not enabled in admin; Simpler Pro font files not available.

### In progress
- Phase 0 awaiting merchant approval of `docs/implementation-plan.md` and answers to Q1–Q15.
- No theme code written (per rules).

### Next session
1. Re-run Figma fetches (screenshots for all frames incl. mobile, `1:949`, header states, filter
   states) and reconcile every VERIFY item; export assets.
2. If the token is fixed: `shopify theme dev` preview, `shopify theme check` baseline.
3. On approval: Phase 1 (tokens → settings, `mk-custom.css`, fonts, buttons, badges, product card).

### Open questions (for the merchant)
See `docs/implementation-plan.md` §10 (Q1–Q15); Q11–Q15 carry over from session 1.

## 2026-10-07 — session 1 (setup + Phase 0 start)
- Repo initialised; `CLAUDE.md` (rules), `docs/` skeleton; Figma frame map verified; unknown frame
  `1:3455`/`1:12866` identified as a digital course landing page; 17 designer annotations
  transcribed (`docs/figma-frame-map.md`). Network/CLI were blocked in that environment.
