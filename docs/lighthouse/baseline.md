# Lighthouse baseline (untouched Hyper 1.5.0, theme 189111500994)

Date: 2026-10-08. Lighthouse 12.8.2, Chromium 141.0.7390.37, headless, mobile form factor, simulated
throttling (Lighthouse defaults), 3 runs per page, **median** reported. Pages were loaded through
the environment's egress proxy with certificate errors ignored, which does not affect the
performance category. Raw JSON reports are kept locally in `docs/lighthouse/raw/` (gitignored).

The theme still holds Hyper demo content (English, no collections assigned), so these numbers
measure the vendor baseline, not the final store. Re-run after each phase with the same script
(`scripts/lighthouse-mobile.sh`) and the same three URLs.

| Page | URL | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | FCP | Speed Index | Weight |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | **75** (81/75/72) | 91 | 96 | 85 | 2.9 s | 0.000 | 516 ms | 2.7 s | 5.0 s | 1,440 KiB |
| Collection | `/collections/all` | **72** (63/82/72) | 98 | 96 | 92 | 3.5 s | 0.000 | 522 ms | 1.4 s | 5.4 s | 1,628 KiB |
| Product | `/products/121790` | **69** (69/79/43) | 95 | 96 | 100 | 3.7 s | 0.000 | 549 ms | 2.3 s | 5.4 s | 1,574 KiB |

LCP elements: Home = slideshow mobile image (`HEADER_VALUE-MOBILE.webp`); Collection = first
product card image; Product = main gallery image.

Observations to carry into the plan:
- Run-to-run variance is high (Product 43–79): always compare medians of 3+ runs.
- TBT ~0.5 s on every page comes from the vendor JS bundle (`vendor.js` + `theme.js` + section
  scripts); any custom JS must stay small and deferred.
- CLS is already 0: keep it there (explicit image dimensions on every custom image).
- Page weight ~1.5 MiB with demo content; Hebrew web fonts and real product imagery will add to
  it, so the font budget (2 preloaded woff2 files) matters.
