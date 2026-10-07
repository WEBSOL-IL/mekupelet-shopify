# Lighthouse baseline (untouched Hyper 1.4.0, mobile)

Date: 2026-10-07. Tool: Lighthouse 12 CLI, headless Chromium, mobile form factor, default simulated throttling, `--max-wait-for-load=90000`, 3 runs per page. Run inside the Claude cloud sandbox, so absolute numbers are indicative only; CPU is slower and a few third-party hosts (Google, Shopify analytics) were blocked by the sandbox network policy. Use PageSpeed Insights for the official numbers before launch; compare phases against this table using the same method.

| Page | URL | Run | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| home | https://mekupelet-store.myshopify.com/ | 1 | 79 | 87 | 96 | 85 | 2.6 s | 3.0 s | 350 ms | 0 | 4.9 s |
| home | https://mekupelet-store.myshopify.com/ | 2 | 67 | 95 | 96 | 85 | 1.8 s | 4.3 s | 550 ms | 0 | 4.9 s |
| home | https://mekupelet-store.myshopify.com/ | 3 | 81 | 91 | 96 | 85 | 1.6 s | 2.6 s | 480 ms | 0 | 4.7 s |
| collection | https://mekupelet-store.myshopify.com/collections/all | 1 | 76 | 99 | 96 | 92 | 2.3 s | 3.0 s | 530 ms | 0 | 4.3 s |
| collection | https://mekupelet-store.myshopify.com/collections/all | 2 | 80 | 99 | 96 | 92 | 1.2 s | 2.6 s | 520 ms | 0 | 4.7 s |
| collection | https://mekupelet-store.myshopify.com/collections/all | 3 | 77 | 99 | 96 | 92 | 1.5 s | 3.1 s | 490 ms | 0 | 4.9 s |
| product | https://mekupelet-store.myshopify.com/products/121790 | 1 | 44 | 95 | 96 | 92 | 4.4 s | 8.4 s | 650 ms | 0 | 7.4 s |
| product | https://mekupelet-store.myshopify.com/products/121790 | 2 | 77 | 95 | 96 | 92 | 1.4 s | 3.6 s | 430 ms | 0 | 4.6 s |
| product | https://mekupelet-store.myshopify.com/products/121790 | 3 | 75 | 95 | 96 | 92 | 2.0 s | 2.6 s | 680 ms | 0 | 4.6 s |

## Median performance score and representative run

| Page | Perf (median of 3) | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| home | 79 | 87 | 96 | 85 | 3.0 s | 350 ms | 0 |
| collection | 77 | 99 | 96 | 92 | 3.1 s | 490 ms | 0 |
| product | 75 | 95 | 96 | 92 | 2.6 s | 680 ms | 0 |

Representative full reports: `home.report.html`, `collection.report.html`, `product.report.html` (JSON alongside).

Note: the collection page tested is `/collections/all` because the storefront currently exposes only the `frontpage` collection; the product is `/products/121790`. The earlier runs with `--preset=perf` (TBT 1.5–2.0 s, perf 44–52) are not comparable and were discarded.
