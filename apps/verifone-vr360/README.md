# Mekupelet VR360 — Shopify app

Issues tax invoices / receipts in Verifone VR360 for Shopify orders and syncs stock from
VR360 into Shopify. A port of the WooCommerce plugin `verifone-vr360-woocommerce` (1.8.1).
Design: `../../docs/verifone-vr360-shopify-plan.md`.

## Stack

- Node 22, React Router 7 (the Shopify app template; Remix's successor), Polaris web components, App Bridge.
- PostgreSQL (Prisma) for settings, documents, request log, sync runs, SKU cache.
- Redis + BullMQ: `web` enqueues, `worker` talks to VR360 and Shopify.
- VR360 client: hand-built SOAP 1.1 XML (`app/vr360/client.server.ts`), no SOAP library.

```
app/
  routes/app.*            admin pages (settings, documents, stock, logs)
  routes/webhooks.*       Shopify webhooks (enqueue only)
  routes/sync.$kind.tsx   external trigger URLs (/sync/today, /sync/month)
  lib/                    settings schema + storage, crypto, queues, formatting
  vr360/                  SOAP client, XML helpers, WSDL inspector, diagnostics
  jobs/                   queue processors (phase 0: stubs)
worker/                   BullMQ worker + repeatable schedules
prisma/                   schema + migrations
tests/                    vitest unit tests (no DB / network needed)
```

## Local development

```bash
npm install
cp .env.example .env            # fill APP_ENCRYPTION_KEY (openssl rand -hex 32), DATABASE_URL, REDIS_URL
npx prisma migrate deploy       # or `npx prisma migrate dev` while changing the schema
npm run dev                     # shopify app dev (needs the app linked, see below)
npm run worker                  # in a second terminal
npm test && npm run typecheck && npm run lint
```

## First-time setup (once, by someone logged in to the Shopify Dev Dashboard)

1. Create the app in the Dev Dashboard (same account as the import app) or let the CLI create it:
   `npm run config:link` → "Create new app" → name `Mekupelet VR360`. This fills `client_id` in
   `shopify.app.toml`. Keep **custom distribution** (one store).
2. Put the API secret in `.env` (`SHOPIFY_API_SECRET`), or in the server's env file.
3. `npm run deploy` pushes scopes, webhooks and (later) the admin extensions.
4. Install on `yxmgh4-cn.myshopify.com` from the Dev Dashboard install link.
5. In the app: Settings → enter the VR360 password → Save → "בדיקת חיבור".

## Production (WEBSOL server)

```bash
cp .env.example .env     # SHOPIFY_API_KEY/SECRET, SHOPIFY_APP_URL=https://<domain>, APP_ENCRYPTION_KEY, POSTGRES_PASSWORD
docker compose up -d --build
```

`web` listens on 127.0.0.1:3000; put Caddy/Traefik in front with TLS for `SHOPIFY_APP_URL`.
Migrations run on container start (`npm run setup`). Back up the `pgdata` volume daily.
Ask Verifone to whitelist the server's IP for `services.asmx` (and for an HTTPS endpoint if available).

## Phase status

| Phase | Content | Status |
|---|---|---|
| 0 | Repo, Docker, Prisma schema, queues + worker + scheduler, settings UI, WSDL / connection / document checks, request log | done (this commit) |
| 1 | Invoice builder (lines, receipts, VAT, discounts, customer resolution) + fixture tests | next |
| 2 | Order-details admin block, manual issue, PDF, metafields/tags | |
| 3 | Auto issue on orders/paid, bulk action, alerts | |
| 4 | Full + partial credits | |
| 5 | Stock sync (SkuCache, today/month/product, triggers) | |
| 6 | End-to-end tests against Verifone, hardening, handover | |
