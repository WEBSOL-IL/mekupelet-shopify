# Progress log

Any new session: read `CLAUDE.md`, then this file, then resume from "Next session starts here".

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

## 2026-10-07 — session 2 (token check; stopped)

### Done
- Shopify CLI 4.8.5 is installed; `SHOPIFY_CLI_THEME_TOKEN` (Theme Access password, `shptka_`,
  39 chars) and `SHOPIFY_FLAG_STORE` are set; network to `mekupelet-store.myshopify.com` and
  `api.figma.com` is now allowed.
- Figma token verified: `GET /v1/files/YOVayNJZ1olagd5NLKXMzJ` and `GET /v1/images/...` return 200.
  Note: the token has only the `file_content:read` scope, so `GET /v1/me` returns 403
  ("requires current_user:read"). This does not block the file/image download.

### Blocked (needs merchant action)
- `shopify theme list --store mekupelet-store.myshopify.com` fails with
  `GraphQL Error (Code: 401): [API] Invalid API key or access token` (reproduced twice).
  The token format is valid, so it was most likely revoked/regenerated, belongs to another
  store, or the Theme Access app is no longer installed. Merchant: regenerate a Theme Access
  password for `mekupelet-store.myshopify.com` (Apps → Theme Access) and update
  `SHOPIFY_CLI_THEME_TOKEN` in the environment.
- Stopped per instruction ("if one token fails, stop and report"). Nothing else was run.

## 2026-10-07 — session 3 (token re-check; stopped again)

### Done
- Branch `claude/funny-brahmagupta-u181vr` fast-forwarded onto session 2's commit (`6bea8b5`).
- Figma token OK: `GET /v1/me` returns 200 (user `asher.websol@gmail.com`), and
  `GET /v1/files/YOVayNJZ1olagd5NLKXMzJ?depth=1` returns 200. The scope issue from session 2 is gone.
- Tooling present: Shopify CLI 4.8.5, Node 22, Python 3.13, Chromium (Playwright). No `lighthouse`
  binary yet (install via npx when the theme pull is possible).

### Blocked (needs merchant action) — unchanged
- `shopify theme list --store mekupelet-store.myshopify.com` still fails with
  `GraphQL Error (Code: 401): [API] Invalid API key or access token`.
  Reproduced independently with a raw request to
  `theme-kit-access.shopifyapps.com/cli/admin/api/2025-07/themes.json` using the same
  `SHOPIFY_CLI_THEME_TOKEN` (`shptka_…`, 39 chars): also 401. The token is therefore rejected by
  Shopify itself, not by the CLI. Causes to check: password regenerated/revoked, Theme Access app
  uninstalled, or password issued for a different store.
- The claude.ai Shopify connector is also disconnected ("needs you to sign in again"), so it is
  not a fallback either.
- Stopped per instruction ("if one token fails, stop and report"). No download, pull or edit was run.

### Next session starts here
0. Merchant: in the store admin open Apps → Theme Access → create a new password for
   `mekupelet-store.myshopify.com`, set it as `SHOPIFY_CLI_THEME_TOKEN` in the environment
   (and/or re-authorise the Shopify connector in claude.ai). Then:
1. Re-run `shopify theme list --store mekupelet-store.myshopify.com`; if OK, continue.
2. Download the whole Figma file via REST (full node tree, 2x PNG of every frame in
   `docs/figma-frame-map.md`, background images) into `docs/figma/`. No Figma MCP.
3. FIRST ACTIONS: identify the backup theme, fill its ID in `CLAUDE.md`, `theme pull`
   of `154698219714`, commit the untouched baseline.
4. Continue Phase 0 (Hyper audit on real files, Lighthouse baseline, token + diff tables in
   `docs/implementation-plan.md`). No theme code. Stop for approval at the end of Phase 0.

## 2026-10-07 — session 4 (Phase 0 executed via the Shopify connector)

### Done
- Tokens: Figma token OK (`/v1/me` 200). Shopify CLI Theme Access token still 401 (same
  `shptka_29aa…` value), but the claude.ai Shopify connector was re-authorised and works, so
  everything below was done through the Admin GraphQL API (read-only `themes` / `theme.files`).
- Theme list: WORKING = `154698219714` "Hyper" (MAIN, theme store 3247). BACKUP = `189107896514`
  "Copy of Hyper" (unpublished, created 2026-10-07 20:56). Also present: `154250444994` dawn,
  `189102653634` "Updated copy of Expanse" (demo). Backup ID filled in `CLAUDE.md`.
- Baseline: all 461 theme files pulled via GraphQL (wildcard `filenames`, bodies saved to disk,
  never through the model) and committed untouched (`67656a7`). 411 files are byte-identical to
  the API md5; the 50 JSON files carry the auto-generated header/formatting Shopify applies on
  read (`docs/hyper-audit/theme-manifest.tsv`, column `status`).
- Figma export in `docs/figma/`: `file.json` (full tree, 36 MB), `png/` 30 of 73 top-level
  frames at 2x (then HTTP 429 from the image-render endpoint, retry-after ~4.6 days),
  `images/` all 259 image fills, `index.json` (frame → png/fill map, missing renders listed).
  Not rendered: all mobile frames, `52:5172`, `69:5443`, `69:4498`, `141:4435`, `139:4416`.
- Hyper audit on the real files: `docs/hyper-audit/hyper-audit.md`.
- Figma extraction (scripts over `file.json`): `docs/figma/tokens.md`, `docs/figma/sections.md`,
  `docs/figma/copy.md`.
- Lighthouse baseline (mobile, sandbox, 3 runs each): Home 79 / Collection 77 / Product 75,
  CLS 0, LCP 2.6–3.1 s. `docs/lighthouse/baseline/README.md` + representative HTML reports.
  PageSpeed Insights could not be used (anonymous quota exhausted).
- `docs/implementation-plan.md` written: tokens → Hyper mapping, original vs revision diff +
  mobile adaptation, Figma section → Hyper mapping with tier/effort, data models, asset
  inventory, baseline, 18 open questions, Phase 5 options, Phase 1 scope.
- Storefront is public (no password); only the `frontpage` collection is published to the
  Online Store channel, 250+ products are. A third-party "shoplift" font/script was seen in the
  Lighthouse byte list (installed app?) — ask the merchant.

### Blocked (needs merchant action)
- `shopify theme push/dev` still impossible: regenerate the Theme Access password
  (Apps → Theme Access) and update `SHOPIFY_CLI_THEME_TOKEN`. Phase 1 cannot start without it.
- Figma 2x renders for the 43 missing frames (see above).
- Fonts: licensed Simpler Pro woff2 files (400/600/700).

### Phase 0 status
Complete pending merchant approval of `docs/implementation-plan.md` (section 7 open questions).
No theme code written.

### Next session starts here
1. Re-run `shopify theme list --store mekupelet-store.myshopify.com`; needs the new token.
2. Collect the merchant's answers to `docs/implementation-plan.md` §7 and the open questions above.
3. On approval: Phase 1 (tokens, typography, buttons, inputs, icons, badges, product card) per
   `docs/implementation-plan.md` §9. Before any JSON change, pull the remote copy and merge.
4. If renders are needed before Phase 1: retry Figma `GET /v1/images` (quota) or get approval
   to use the Figma MCP for screenshots only.
