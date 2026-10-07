# Mekupelet Shopify theme — project rules

## Project
- Store: `mekupelet-store.myshopify.com` (in development, no customers; migration of mekupelet.co.il from WooCommerce). Not launched.
- Theme: Hyper by FoxEcom (purchased, OS 2.0). Docs: https://docs.foxecom.com/hyper-theme
- Design: Figma file key `YOVayNJZ1olagd5NLKXMzJ` (single page `0:1`). Frame map: `docs/figma-frame-map.md`.
- Language: Hebrew, RTL only. Currency: ILS. Catalog: 4,000+ products. **Performance is the top priority.**
- Communicate with the merchant in Hebrew. Code, comments, commits and docs in English.

## Theme IDs
| Role | ID | Notes |
|---|---|---|
| WORKING (published) | `154698219714` | The ONLY theme we may write to. Pass `--theme 154698219714 --allow-live` on every push/dev. |
| BACKUP (duplicate) | _TBD — fill from `shopify theme list`_ | DO NOT TOUCH: never write, rename, publish or delete. |

## Session routine
- Read `docs/progress.md` first and update it at the end of every work session (done / in progress / open questions).
- Log every Hyper core-file edit in `docs/CUSTOMIZATIONS.md`.

## RULES: THEME ARCHITECTURE
Hyper is a purchased theme that receives updates, and custom changes must be carried
over manually on each update. Keep our code isolated. Use the lowest tier that achieves
the design:
1. Theme settings and existing Hyper sections/blocks configured in JSON templates.
2. CSS overrides in a single custom stylesheet, built on Hyper's own CSS variables.
3. New sections / blocks / snippets / assets, all prefixed `mk-`.
4. Editing Hyper core files: last resort only. Wrap every edit in
   `MK-CUSTOM start/end` comments and log it in docs/CUSTOMIZATIONS.md (file, reason, date).
Other rules:
- Follow Hyper's existing conventions (JS pattern, CSS naming, breakpoints, schema
  translation style). Audit them first; do not import a foreign architecture.
- Everything merchant-editable: no hardcoded text, images, links or colors in Liquid.
  Use section/block settings, metafields or metaobjects. Storefront strings go in locales.
- Every custom section needs a complete schema with presets, sensible defaults and limits.
- No new libraries, apps or external scripts without merchant approval.

## RULES: FIGMA WORKFLOW
- Never pull a whole page frame as code. Work section by section: get_design_context on
  the section-level node, plus its screenshot and variable definitions.
- Treat Figma's generated code (React/Tailwind) as a reference for values only. Translate
  to Liquid + the theme's CSS conventions. Do not paste absolute-positioned layouts.
- Extract design tokens once (colors, type scale, spacing, radii, shadows) and map them
  to Hyper theme settings / CSS variables. Reuse them; no magic numbers.
- Assets: export icons as optimized SVG, images at proper resolution. Never hotlink Figma
  asset URLs (they expire). Content images belong in Shopify Files via settings.
- If the design is inconsistent, missing a state (hover, focus, empty, error, loading,
  sold out, long Hebrew text) or missing a breakpoint: list it and ask. Do not invent.
- Source of truth: the approved designer revision. Home `18:4094`, Product `52:5172`,
  Collection `69:5443` supersede the originals `1:266`, `1:1794`, `1:949`. Frames
  `69:4830`, `69:6949`, `69:6243` are untouched comparison copies: ignore them.
  The revision's global decisions apply to EVERY template. Mobile: original mobile frames
  for layout patterns, revision for content, order, components and styling.

## RULES: RESPONSIVE + RTL
- Layout must be fluid from 320 to 1440 and behave sensibly above 1440 and on tablets.
  Use Hyper's breakpoints. State the assumption for sizes the design does not cover.
- First check what RTL support Hyper already ships and build on it.
- Use CSS logical properties only (margin-inline, padding-inline, inset-inline, text-align: start).
- Verify sliders, drawers, breadcrumbs, arrows and directional icons in RTL.
- Handle mixed Hebrew/English/number strings (prices, SKUs, phone numbers) correctly.

## RULES: PERFORMANCE
- No render-blocking additions. JS is deferred, small, vanilla, loaded only by the
  section that needs it. CSS for a custom section loads with that section.
- Images: image_url with explicit widths, srcset + sizes, width/height attributes,
  lazy-load below the fold, fetchpriority=high on the LCP image only. Zero layout shift.
- Fonts: use the Hebrew fonts from the design, self-hosted woff2, font-display: swap,
  preload at most two files.
- Collections: paginate, use native storefront filtering, never loop over the full
  catalog in Liquid, keep Liquid loops and nested renders lean.
- Report Lighthouse mobile scores for Home, Collection and Product before and after
  each phase. A regression against the untouched Hyper baseline must be explained.

## RULES: SAFETY
- Work in git. One commit per section/component, clear messages. Git is the ongoing
  backup; the duplicate theme in the store is only a snapshot of the starting point.
- The only theme we may write to is 154698219714. It is published, so pass
  --allow-live, and ALWAYS pass the theme ID explicitly:
  `shopify theme dev --store mekupelet-store.myshopify.com --theme 154698219714 --allow-live --theme-editor-sync`
  `shopify theme push --store mekupelet-store.myshopify.com --theme 154698219714 --allow-live --nodelete`
- Never use the `--live` shortcut, never push without `--theme 154698219714`, never
  publish, unpublish, rename or delete any theme, never write to the backup duplicate.
- The merchant also edits this theme in the admin theme editor. Before changing any JSON file
  (templates/*.json, sections/*.json, config/settings_data.json), pull the current remote
  version of that file and merge into it. Never overwrite editor changes with a stale
  local copy, and never reset settings_data.json.
- The permission to work on the published theme holds only while the store is in
  development. If the merchant says the store has launched, stop and switch to an unpublished
  theme workflow before any further push.
- Never touch products, collections, orders, customers, apps or store settings.
- When admin-side setup is needed (menus, metafield/metaobject definitions, pages,
  Search & Discovery filters), give the merchant an exact checklist instead of doing it.

## VERIFICATION LOOP (every section, before calling it done)
1. Render it in the local preview with realistic Hebrew content.
2. Screenshot at 1440 and 320, plus 390 and 768, and compare side by side with the
   Figma screenshot. Fix differences in spacing, type size/weight/line-height, color,
   radius, alignment. Tolerance: 2px.
3. Check hover/focus/active states, keyboard navigation, visible focus, alt text, contrast.
4. Check it in the theme editor: add, remove, reorder, empty settings.
5. Run `shopify theme check` with zero new errors.
6. Commit, update docs/progress.md, show the merchant the screenshots and any deviation kept.

## PHASES (stop for merchant approval at the end of each)
- Phase 0, Discovery (read-only): Hyper audit, frame-map verification, designer annotations,
  `docs/implementation-plan.md` (tokens, original-vs-revision diff + mobile adaptation,
  Figma-section → Hyper mapping with tier/justification/effort, data models for
  brands/FAQ/legal/badges, asset inventory, open questions, baseline Lighthouse).
- Phase 1, Foundations: tokens, typography, buttons, form fields, icons, badges, product card.
- Phase 2, Global: header, navigation, mobile menu, search, footer, mini cart.
- Phase 3, Core commerce: Home, Collection (filters, sort, pagination), Product.
- Phase 4, Content: About, Brands index, Brand page, Blog, Article, FAQ, Legal, Gift card.
- Phase 5, Boxes (Assembled box, Surprise box, Ready-made package, boxes collection):
  functionality, not styling. Technical proposal first (native bundles / line item
  properties / cart transform, trade-offs for inventory, pricing, checkout, 4,000+ catalog).
  Build only after the merchant chooses.
- Phase 6, QA + handover: full regression, Lighthouse, accessibility, Safari iOS / Chrome
  Android / desktop browsers, final CUSTOMIZATIONS.md and a Hyper update guide.
