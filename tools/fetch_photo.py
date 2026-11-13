"""Fetch a freely licensed photo from Wikimedia Commons as a 1600 px WebP and print its credit.

python tools/fetch_photo.py --search "Chocolate Hills Bohol"      # list candidates with licences
python tools/fetch_photo.py "File:Chocolate Hills overview.JPG" bohol hills
    -> assets/img/bohol/hills.webp, prints a credit object for the destination file
"""
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'ph-explorer-photo-fetch/1.0 (educational showcase)'}
FREE = re.compile(r'^(CC0|Public domain|PD.*|CC BY(-SA)? \d\.\d.*)$', re.I)


def api(**params):
    params.update(format='json', formatversion=2)
    req = urllib.request.Request(API + '?' + urllib.parse.urlencode(params), headers=UA)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))  # Commons rate limit: back off


def strip(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def info(title):
    page = api(action='query', titles=title, prop='imageinfo', iiprop='url|extmetadata|size', iiurlwidth=1600)['query']['pages'][0]
    if 'imageinfo' not in page:
        raise SystemExit(f'not found: {title}')
    ii = page['imageinfo'][0]
    md = ii.get('extmetadata', {})
    def get(k):
        return strip(md.get(k, {}).get('value', ''))
    return ii, get('LicenseShortName'), get('Artist') or get('Credit'), md.get('LicenseUrl', {}).get('value', '')


def search(q):
    res = api(action='query', generator='search', gsrsearch=q, gsrnamespace=6, gsrlimit=12, prop='imageinfo', iiprop='extmetadata|size')
    for p in res.get('query', {}).get('pages', []):
        ii = (p.get('imageinfo') or [{}])[0]
        md = ii.get('extmetadata', {})
        lic, artist = strip(md.get('LicenseShortName', {}).get('value')), strip(md.get('Artist', {}).get('value')).replace('\n', ' ')
        ok = 'ok ' if FREE.match(lic) else 'NO '
        print(f"{ok}{ii.get('width')}x{ii.get('height')}  {lic:14} {p['title']}  — {artist[:40]}")


def fetch(title, dest_id, name):
    ii, lic, artist, lic_url = info(title)
    if not FREE.match(lic):
        raise SystemExit(f'refusing {title}: licence "{lic}" is not CC0/PD/CC BY/CC BY-SA')
    url = ii.get('thumburl') or ii['url']
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        im = Image.open(BytesIO(r.read())).convert('RGB')
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    out_dir = os.path.join(ROOT, 'assets', 'img', dest_id)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f'{name}.webp')
    im.save(out, 'WEBP', quality=80, method=6)
    credit = {'src': f'{name}.webp', 'w': im.width, 'h': im.height, 'title': title.removeprefix('File:').rsplit('.', 1)[0].replace('_', ' '),
              'url': ii['descriptionurl'], 'author': artist, 'license': lic, 'licenseUrl': lic_url}
    print(json.dumps(credit, ensure_ascii=False))


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) == 2 and a[0] == '--search':
        search(a[1])
    elif len(a) == 3:
        fetch(*a)
    else:
        sys.exit(__doc__)
