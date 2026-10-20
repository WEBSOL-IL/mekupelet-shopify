#!/usr/bin/env python3
"""Remap every product's `productType` to the 20 approved types and keep the previous (finer) type
in the metafield custom.product_subtype (docs/import/product-type-mapping.json, from the merchant's
Excel docs/import/product-types-20.xlsx). The Shopify standard category is left as it is (it was
set per fine type and is more specific than the 20).

Dry run by default. `--execute` runs productUpdate (type) per product and metafieldsSet (sub-type)
in batches of 25, only where something differs, and writes docs/import/out/product-types-remap.json.
The sub-type definition must exist first: scripts/create-choice-definition.py docs/import/subtype-choices.json --execute

Run: python3 -I scripts/remap-product-types.py [--execute] [--limit N]
"""
import argparse, importlib.util, json, os, time, collections

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('imp', os.path.join(HERE, 'import-collections.py'))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)


def gql(query, variables, tries=4):
    for i in range(tries):
        try:
            return imp.gql(query, variables)
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--execute', action='store_true'); ap.add_argument('--limit', type=int, default=0)
    a = ap.parse_args()
    m = json.load(open(os.path.join(HERE, '..', 'docs', 'import', 'product-type-mapping.json'), encoding='utf-8'))
    mapping, types20 = m['mapping'], set(m['types'])
    q = '''query($c: String) { products(first: 250, after: $c) { pageInfo { hasNextPage endCursor }
      nodes { id handle title productType sub: metafield(namespace: "custom", key: "product_subtype") { value } } } }'''
    products, cursor = [], None
    while True:
        d = gql(q, {'c': cursor})['data']['products']; products += d['nodes']
        if not d['pageInfo']['hasNextPage']:
            break
        cursor = d['pageInfo']['endCursor']
    plan, skipped, unknown = [], [], []
    for p in products:
        old = p['productType'] or ''
        if not old:
            skipped.append(p['handle']); continue
        new = mapping.get(old) or (old if old in types20 else None)
        if not new:
            unknown.append((p['handle'], old)); continue
        sub_cur = p['sub']['value'] if p['sub'] else ''
        # on a re-run the type is already one of the 20: the sub-type keeps the fine value if set
        sub_new = old if old not in types20 else (sub_cur or old)
        if new == old and sub_cur == sub_new:
            continue
        plan.append((p['id'], p['handle'], p['title'], sub_new, new, sub_cur != sub_new))
    dist = collections.Counter(x[4] for x in plan)
    print(f'products {len(products)}, to update {len(plan)}, without type {len(skipped)}, unknown types {unknown[:5]}')
    print('new types:', dist.most_common())
    if a.limit:
        plan = plan[:a.limit]
    if not a.execute:
        print('dry run only; add --execute to write'); return
    ok_type, ok_sub, errors = 0, 0, []
    mut = 'mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }'
    for i, (gid, handle, title, old, new, _) in enumerate(plan, 1):
        if old == new and old in types20:
            continue  # type unchanged (already one of the 20): sub-type only
        try:
            ue = gql(mut, {'p': {'id': gid, 'productType': new}})['data']['productUpdate']['userErrors']
            if ue: errors.append((handle, 'type', ue))
            else: ok_type += 1
        except Exception as e:
            errors.append((handle, 'type', str(e)))
        if i % 100 == 0:
            print(f'types {i}/{len(plan)} ok={ok_type} errors={len(errors)}', flush=True)
        time.sleep(0.2)
    ms = 'mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message code } } }'
    subs = [x for x in plan if x[5]]
    for i in range(0, len(subs), 25):
        batch = subs[i:i + 25]
        try:
            ue = gql(ms, {'m': [{'ownerId': g, 'namespace': 'custom', 'key': 'product_subtype', 'type': 'single_line_text_field', 'value': old} for g, h, t, old, new, _ in batch]})['data']['metafieldsSet']['userErrors']
            if ue: errors.append(('batch ' + str(i), 'subtype', ue))
            else: ok_sub += len(batch)
        except Exception as e:
            errors.append(('batch ' + str(i), 'subtype', str(e)))
        print(f'subtypes {min(i + 25, len(subs))}/{len(subs)} ok={ok_sub} errors={len(errors)}', flush=True)
        time.sleep(0.3)
    os.makedirs('docs/import/out', exist_ok=True)
    json.dump({'types_updated': ok_type, 'subtypes_set': ok_sub, 'errors': errors, 'without_type': skipped, 'by_type': dist.most_common()}, open('docs/import/out/product-types-remap.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'done: types {ok_type}, subtypes {ok_sub}, errors {len(errors)}; report docs/import/out/product-types-remap.json')


if __name__ == '__main__':
    main()
