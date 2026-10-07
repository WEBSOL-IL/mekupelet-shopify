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

### Next session starts here
1. Re-run `shopify theme list --store mekupelet-store.myshopify.com`; if OK, continue.
2. Download the whole Figma file via REST (full node tree, 2x PNG of every frame in
   `docs/figma-frame-map.md`, background images) into `docs/figma/`. No Figma MCP.
3. FIRST ACTIONS: identify the backup theme, fill its ID in `CLAUDE.md`, `theme pull`
   of `154698219714`, commit the untouched baseline.
4. Continue Phase 0 (Hyper audit on real files, Lighthouse baseline, token + diff tables in
   `docs/implementation-plan.md`). No theme code. Stop for approval at the end of Phase 0.
