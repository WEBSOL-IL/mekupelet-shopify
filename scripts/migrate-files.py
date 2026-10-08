#!/usr/bin/env python3
"""Copy images from the old store's CDN into this store's Files (Shopify fetches each URL itself).
Usage: python3 -I scripts/migrate-files.py <urls.txt> <out.json> [--execute]
Writes {source_url: {"id", "filename", "url", "status"}} to out.json. Env as import-collections.py."""
import importlib.util, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql

urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
out_path = sys.argv[2]; execute = "--execute" in sys.argv
result = json.load(open(out_path)) if os.path.exists(out_path) else {}
todo = [u for u in urls if u not in result]
print(f"{len(urls)} urls, {len(todo)} to upload")
if not execute:
    for u in todo[:10]: print("  ", u)
    sys.exit(0)
for i in range(0, len(todo), 10):
    batch = todo[i:i + 10]
    r = gql("""mutation($files:[FileCreateInput!]!){ fileCreate(files:$files){
        files { id fileStatus ... on MediaImage { image { url } } preview { image { url } } } userErrors { field message } } }""",
        {"files": [{"originalSource": u, "contentType": "IMAGE", "alt": "", "duplicateResolutionMode": "RAISE_ERROR"} for u in batch]})
    d = r["data"]["fileCreate"]
    if d["userErrors"]:
        print("errors:", d["userErrors"])
    for u, f in zip(batch, d["files"]):
        result[u] = {"id": f["id"], "status": f["fileStatus"]}
    json.dump(result, open(out_path, "w"), ensure_ascii=False, indent=1)
    print(f"batch {i // 10 + 1}: {len(d['files'])} files created")
# resolve final URLs/filenames once processed
ids = [v["id"] for v in result.values() if v.get("id")]
for attempt in range(12):
    pending = 0
    for j in range(0, len(ids), 50):
        r = gql("""query($ids:[ID!]!){ nodes(ids:$ids){ ... on MediaImage { id fileStatus image { url } } } }""", {"ids": ids[j:j + 50]})
        for node in r["data"]["nodes"]:
            if not node: continue
            for u, v in result.items():
                if v.get("id") == node["id"]:
                    v["status"] = node["fileStatus"]
                    if node.get("image"):
                        v["url"] = node["image"]["url"]; v["filename"] = node["image"]["url"].split("/")[-1].split("?")[0]
                    if node["fileStatus"] != "READY": pending += 1
    json.dump(result, open(out_path, "w"), ensure_ascii=False, indent=1)
    print(f"status check {attempt + 1}: pending {pending}")
    if not pending: break
    time.sleep(5)
print("done:", sum(1 for v in result.values() if v.get("status") == "READY"), "ready")
