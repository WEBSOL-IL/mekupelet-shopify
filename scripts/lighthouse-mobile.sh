#!/usr/bin/env bash
# Baseline Lighthouse (mobile) for Home / Collection / Product, 3 runs each, median reported.
set -u
export CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
cd "$(dirname "$0")/../docs/lighthouse"
# Requires: lighthouse@12 reachable via npx, Chromium at CHROME_PATH, HTTPS_PROXY set.
OUT=./raw; mkdir -p "$OUT"
BASE="https://mekupelet-store.myshopify.com"
declare -A PAGES=( [home]="$BASE/" [collection]="$BASE/collections/all" [product]="$BASE/products/121790" )
for name in home collection product; do
  url="${PAGES[$name]}"
  for i in 1 2 3; do
    npx lighthouse "$url" \
      --chrome-path=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
      --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --proxy-server=$HTTPS_PROXY --ignore-certificate-errors" \
      --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate \
      --only-categories=performance,accessibility,best-practices,seo \
      --output=json --output-path="$OUT/$name-$i.json" --quiet >/dev/null 2>"$OUT/$name-$i.err" \
      && echo "ok $name $i" || echo "FAIL $name $i (see $OUT/$name-$i.err)"
  done
done
python3 -I - <<'PY'
import json,glob,statistics,os
out='./raw'
rows=[]
for name in ['home','collection','product']:
    runs=[]
    for f in sorted(glob.glob(f'{out}/{name}-*.json')):
        try: d=json.load(open(f))
        except Exception as e: print('bad',f,e); continue
        c=d['categories']; a=d['audits']
        runs.append(dict(
            perf=round(c['performance']['score']*100), a11y=round(c['accessibility']['score']*100),
            bp=round(c['best-practices']['score']*100), seo=round(c['seo']['score']*100),
            lcp=a['largest-contentful-paint']['numericValue']/1000, cls=a['cumulative-layout-shift']['numericValue'],
            tbt=a['total-blocking-time']['numericValue'], fcp=a['first-contentful-paint']['numericValue']/1000,
            si=a['speed-index']['numericValue']/1000, bytes=a['total-byte-weight']['numericValue']/1024,
            lcp_el=(a.get('largest-contentful-paint-element',{}).get('details',{}).get('items') or [{}])[0].get('items',[{}])[0].get('node',{}).get('snippet','?') if a.get('largest-contentful-paint-element',{}).get('details') else '?'
        ))
    if not runs: print(name,'no runs'); continue
    med=lambda k: statistics.median(r[k] for r in runs)
    print(f"{name}: n={len(runs)} perf={med('perf'):.0f} a11y={med('a11y'):.0f} bp={med('bp'):.0f} seo={med('seo'):.0f} "
          f"LCP={med('lcp'):.1f}s CLS={med('cls'):.3f} TBT={med('tbt'):.0f}ms FCP={med('fcp'):.1f}s SI={med('si'):.1f}s weight={med('bytes'):.0f}KiB")
    print('   runs perf:',[r['perf'] for r in runs],' LCP element:',runs[0]['lcp_el'][:160])
PY
