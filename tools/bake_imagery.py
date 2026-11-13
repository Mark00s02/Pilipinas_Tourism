"""Bake satellite imagery to drape over each destination's terrain: assets/terrain/<id>.sat.js.

Source: Sentinel-2 cloudless 2016 by EOX (CC BY 4.0) — the 2016 edition is the openly licensed one.
Attribution (keep verbatim): "Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH
(Contains modified Copernicus Sentinel data 2016)".
The crop uses the same box and Web-Mercator resampling as tools/bake_terrain.py, read back from the baked
terrain file, so imagery and heights line up. Output is a WebP data URI inside a script: WebGL refuses images
loaded from file:// as cross-origin, a data URI is fine.
Usage: python tools/bake_imagery.py <id> [<id> ...] | --all   [--size N]  (default 2048 px for boxes >= 30 km, else 1024)
"""
import base64
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
from io import BytesIO

import numpy as np
from PIL import Image, ImageEnhance

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_terrain import BOXES, EQUATOR_M_PER_PX, OUTER_FACTOR, _merc, lonlat_to_tile  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'sat')
TERRAIN = os.path.join(ROOT, 'assets', 'terrain')
MAX_ZOOM = 14  # Sentinel-2 is ~10 m/px; deeper zooms only upscale


def tile_url(z, x, y):
    return f'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'


def pick_zoom(span_km, size, lat=0.0):
    need = span_km * 1000 / size
    for z in range(0, MAX_ZOOM + 1):
        if EQUATOR_M_PER_PX * math.cos(math.radians(lat)) / 2 ** z <= need:
            return z
    return MAX_ZOOM


def read_bbox(js, key):
    """bbox of one entry (e.g. 'dabaw' or 'dabaw:outer') in a baked assets/terrain/<id>.js."""
    m = re.search(r"window\.PH_TERRAIN\['" + re.escape(key) + r"'\]=(\{.*?\});", js)
    return json.loads(m.group(1))['bbox']


def fetch_tile(z, x, y):
    path = os.path.join(CACHE, str(z), str(x), f'{y}.jpg')
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        for attempt in range(4):
            try:
                req = urllib.request.Request(tile_url(z, x, y), headers={'User-Agent': 'ph-explorer-imagery-bake'})
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = r.read()
                break
            except OSError:  # URLError, timeouts and dropped connections are all OSErrors
                if attempt == 3:
                    raise
                time.sleep(3 * (attempt + 1))
        with open(path, 'wb') as f:
            f.write(data)
        time.sleep(.15)  # be gentle with a free tile service
    return Image.open(path).convert('RGB')


def levels_from(img, cut=.5):
    """Per-channel black and white points (cut % clipped at each end) to stretch the dim Sentinel-2 colours."""
    a = np.asarray(img, dtype=np.float32).reshape(-1, 3)
    lo, hi = np.percentile(a, cut, axis=0), np.percentile(a, 100 - cut, axis=0)
    # A view that is nearly all dark ocean (Batanes) would stretch its few land pixels to glaring yellow-white;
    # never stretch a channel by more than 255/140 (~1.8x).
    return lo, np.maximum(hi, lo + 140)


def apply_levels(img, levels):
    lo, hi = levels
    a = (np.asarray(img, dtype=np.float32) - lo) / np.maximum(hi - lo, 1) * 255
    return Image.fromarray(np.clip(np.rint(a), 0, 255).astype(np.uint8), 'RGB')


def encode(img):
    img = ImageEnhance.Brightness(img).enhance(1.25)
    img = ImageEnhance.Color(img).enhance(1.25)
    buf = BytesIO()
    img.save(buf, 'WEBP', quality=72, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii'), len(buf.getvalue())


def image_for(bbox, span_km, size):
    """Raw satellite image of a bbox (same Web-Mercator crop as the terrain) and the zoom it came from."""
    south, west, north, east = bbox
    z = pick_zoom(span_km, size, (south + north) / 2)
    x0, y0 = lonlat_to_tile(west, north, z)
    x1, y1 = lonlat_to_tile(east, south, z)
    mosaic = Image.new('RGB', ((x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256))
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            mosaic.paste(fetch_tile(z, tx, ty), ((tx - x0) * 256, (ty - y0) * 256))
    px0, py0 = _merc(west, north, z)
    px1, py1 = _merc(east, south, z)
    box = ((px0 - x0) * 256, (py0 - y0) * 256, (px1 - x0) * 256, (py1 - y0) * 256)
    return mosaic.resize((size, size), Image.LANCZOS, box=box), z


def bake(tid, size=None):
    js = open(os.path.join(TERRAIN, f'{tid}.js'), encoding='utf-8').read()
    span_km = BOXES[tid][2]
    size = size or (2048 if span_km >= 30 else 1024)  # keep roughly 10-35 m per pixel at every destination
    inner_img, z = image_for(read_bbox(js, tid), span_km, size)
    outer_img, oz = image_for(read_bbox(js, f'{tid}:outer'), span_km * OUTER_FACTOR, 1024)  # the wide surroundings, coarse
    # Sentinel-2 cloudless is dim next to dusk lighting. Stretch both images with the SAME levels (taken from the
    # wide view) so the detailed square and its surroundings meet without a visible change in tone.
    lv = levels_from(outer_img)
    inner, kb = encode(apply_levels(inner_img, lv))
    outer, okb = encode(apply_levels(outer_img, lv))
    with open(os.path.join(TERRAIN, f'{tid}.sat.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016), CC BY 4.0\n'
                f"window.PH_SAT=window.PH_SAT||{{}};window.PH_SAT['{tid}']='{inner}';\n"
                f"window.PH_SAT['{tid}:outer']='{outer}';\n")
    print(f'{tid}: z{z} {size}px {kb // 1024} KB + outer z{oz} 1024px {okb // 1024} KB')


if __name__ == '__main__':
    args = sys.argv[1:]
    size = None
    if '--size' in args:
        i = args.index('--size'); size = int(args[i + 1]); del args[i:i + 2]
    ids = list(BOXES) if args == ['--all'] else args
    if not ids:
        sys.exit(__doc__)
    for tid in ids:
        bake(tid, size)
