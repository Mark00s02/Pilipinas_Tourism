"""Find and download low-poly 3D models from Poly Pizza, embedded so the site still works from file://.

python tools/fetch_model.py --search "surfer"            # candidates: id, title, creator, licence, triangles
python tools/fetch_model.py <PublicID> <name>             # -> assets/models/<name>.glb.js + prints a credit object
Only CC0 / CC-BY models are accepted.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'models')
UA = {'User-Agent': 'Mozilla/5.0 (ph-explorer model fetch)'}
FREE = re.compile(r'^(CC0|CC[- ]BY( \d\.\d)?|Public Domain)', re.I)


def get(url, binary=False):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                data = r.read()
            return data if binary else data.decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 3:
                raise
            time.sleep(4 * (attempt + 1))


def model_info(pid):
    html = get(f'https://poly.pizza/m/{pid}')
    m = re.search(r'window\.__SERVER_APP_STATE__ =\s*(\{.*?\})\s*</script>', html, re.S)
    if not m:
        raise SystemExit(f'no model data on page {pid}')
    d = json.loads(m.group(1))['initialData']['model']
    lic = d.get('Licence') or d.get('License') or d.get('LicenseType') or ''
    if isinstance(lic, dict):
        lic = lic.get('Name') or lic.get('name') or json.dumps(lic)
    return {'id': pid, 'title': d.get('Title', ''), 'creator': (d.get('Creator') or {}).get('Username', ''),
            'license': str(lic), 'tris': d.get('Tris'), 'glb': f"https://static.poly.pizza/{d['ResourceID']}.glb",
            'url': f'https://poly.pizza/m/{pid}', 'keys': sorted(d.keys())}


def search(term):
    html = get('https://poly.pizza/search/' + urllib.parse.quote(term))
    ids = list(dict.fromkeys(re.findall(r'href="/m/([A-Za-z0-9_-]+)"', html)))[:8]
    for pid in ids:
        try:
            i = model_info(pid)
            ok = 'ok ' if FREE.match(i['license']) else 'NO '
            print(f"{ok}{pid:12} {i['tris']!s:>6} tris  {i['license'][:14]:14} {i['title'][:40]:40} — {i['creator']}")
        except Exception as e:  # one bad page should not stop the listing
            print(f'?? {pid} {e}')
        time.sleep(.5)


def fetch(pid, name):
    i = model_info(pid)
    if not FREE.match(i['license']):
        raise SystemExit(f"refusing {pid}: licence '{i['license']}' is not CC0/CC-BY")
    data = get(i['glb'], binary=True)
    if data[:4] != b'glTF':
        raise SystemExit(f'{pid}: not a GLB file')
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, f'{name}.glb.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f"// {i['title']} by {i['creator']} ({i['license']}) — {i['url']}\n"
                f"window.PH_MODELS=window.PH_MODELS||{{}};window.PH_MODELS['{name}']='{base64.b64encode(data).decode()}';\n")
    print(json.dumps({'name': name, 'title': i['title'], 'author': i['creator'], 'license': i['license'], 'url': i['url'], 'kb': len(data) // 1024}, ensure_ascii=False))


if __name__ == '__main__':
    import urllib.parse
    a = sys.argv[1:]
    if len(a) == 2 and a[0] == '--search':
        search(a[1])
    elif len(a) == 2:
        fetch(*a)
    else:
        sys.exit(__doc__)
