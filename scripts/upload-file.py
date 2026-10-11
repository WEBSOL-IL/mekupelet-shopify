#!/usr/bin/env python3
"""Upload a local image to the store's Files (Content > Files) and print its shopify:// reference.
Usage: python3 -I scripts/upload-file.py <local image> [--alt "text"]
Env as import-collections.py (SHOPIFY_SHOP + client credentials with write_files)."""
import importlib.util, json, mimetypes, os, sys, time, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql

path = sys.argv[1]
alt = sys.argv[sys.argv.index("--alt") + 1] if "--alt" in sys.argv else ""
filename = os.path.basename(path)
mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
data = open(path, "rb").read()

# 1. staged upload target
r = gql("""mutation($input:[StagedUploadInput!]!){ stagedUploadsCreate(input:$input){
    stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }""",
    {"input": [{"filename": filename, "mimeType": mime, "resource": "IMAGE", "httpMethod": "POST",
                "fileSize": str(len(data))}]})
d = r["data"]["stagedUploadsCreate"]
if d["userErrors"]:
    sys.exit(f"stagedUploadsCreate: {d['userErrors']}")
target = d["stagedTargets"][0]

# 2. multipart POST of the bytes to the staged URL (parameters first, file last)
boundary = uuid.uuid4().hex
body = b""
for p in target["parameters"]:
    body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{p['name']}\"\r\n\r\n{p['value']}\r\n").encode()
body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n"
         f"Content-Type: {mime}\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
req = urllib.request.Request(target["url"], data=body, method="POST",
                             headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
with urllib.request.urlopen(req, timeout=120) as resp:
    print("staged upload:", resp.status)

# 3. create the file from the staged resource
r = gql("""mutation($files:[FileCreateInput!]!){ fileCreate(files:$files){
    files { id fileStatus } userErrors { field message } } }""",
    {"files": [{"originalSource": target["resourceUrl"], "contentType": "IMAGE", "alt": alt, "filename": filename,
                "duplicateResolutionMode": "REPLACE"}]})
d = r["data"]["fileCreate"]
if d["userErrors"]:
    sys.exit(f"fileCreate: {d['userErrors']}")
file_id = d["files"][0]["id"]

# 4. wait until processed and print the CDN url + the shopify:// reference for JSON templates
for _ in range(20):
    r = gql("""query($id:ID!){ node(id:$id){ ... on MediaImage { fileStatus image { url width height } } } }""", {"id": file_id})
    node = r["data"]["node"]
    if node["fileStatus"] == "READY":
        url = node["image"]["url"]
        cdn_name = url.split("/")[-1].split("?")[0]
        print(json.dumps({"id": file_id, "url": url, "size": [node["image"]["width"], node["image"]["height"]],
                          "setting_value": f"shopify://shop_images/{cdn_name}"}, indent=1))
        break
    if node["fileStatus"] == "FAILED":
        sys.exit("file processing failed")
    time.sleep(2)
else:
    sys.exit("timed out waiting for the file")
