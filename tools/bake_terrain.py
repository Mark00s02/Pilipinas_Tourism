"""Bake real elevation for each destination into assets/terrain/<id>.js.

Source: AWS Open Data Terrain Tiles (Terrarium encoding). Run once; outputs are committed.
Usage: python tools/bake_terrain.py <id> [<id> ...] | --all
"""
import base64
import json
import math
import os
import sys
import urllib.request
from io import BytesIO

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'terrarium')
OUT = os.path.join(ROOT, 'assets', 'terrain')
TILE_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
EQUATOR_M_PER_PX = 156543.03  # web-mercator metres per pixel at zoom 0, 256 px tiles

# id: (centre lat, centre lon, span km[, grid])
BOXES = {
    'dabaw': (7.03, 125.48, 70),
    'el-nido': (11.13, 119.38, 22),
    'boracay': (11.97, 121.925, 9),
    'bohol': (9.73, 124.06, 40),
    'siargao': (9.87, 126.05, 40),
    'banaue': (16.93, 121.07, 18),
    'vigan': (17.57, 120.39, 20),
    'cebu': (9.88, 123.65, 115),
    'mayon': (13.22, 123.70, 30),
    'batanes': (20.40, 121.95, 30),
}


def decode_terrarium(px):
    px = px.astype(np.float64)
    return px[..., 0] * 256 + px[..., 1] + px[..., 2] / 256 - 32768


def _merc(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def lonlat_to_tile(lon, lat, z):
    x, y = _merc(lon, lat, z)
    return int(math.floor(x)), int(math.floor(y))


def tile_to_lonlat(x, y, z):
    n = 2 ** z
    return x / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))


def pick_zoom(span_km, grid, lat=0.0):
    need = span_km * 1000 / grid / 1.5
    for z in range(0, 16):
        if EQUATOR_M_PER_PX * math.cos(math.radians(lat)) / 2 ** z <= need:
            return z
    return 15


def encode_b64(arr):
    return base64.b64encode(np.ascontiguousarray(arr, dtype='<i2').tobytes()).decode('ascii')


def write_js(tid, arr, bbox, cell_m):
    h, w = arr.shape
    payload = json.dumps({'w': w, 'h': h, 'bbox': [round(v, 6) for v in bbox], 'cellM': round(cell_m, 3), 'b64': encode_b64(arr)})
    return f"window.PH_TERRAIN=window.PH_TERRAIN||{{}};window.PH_TERRAIN['{tid}']={payload};\n"


def fetch_tile(z, x, y):
    path = os.path.join(CACHE, str(z), str(x), f'{y}.png')
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers={'User-Agent': 'ph-explorer-bake'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(path, 'wb') as f:
            f.write(data)
    return decode_terrarium(np.asarray(Image.open(path).convert('RGB')))


OUTER_FACTOR, OUTER_GRID = 6, 160  # the wide, coarse ring of real land and sea around each destination


def grid_for(lat, lon, span_km, grid):
    """Real heights (int16 metres) on a grid x grid square centred on lat/lon, span_km wide."""
    half = span_km / 2
    dlat = half / 111.32
    dlon = half / (111.32 * math.cos(math.radians(lat)))
    south, north, west, east = lat - dlat, lat + dlat, lon - dlon, lon + dlon
    z = pick_zoom(span_km, grid, lat)
    x0, y0 = lonlat_to_tile(west, north, z)
    x1, y1 = lonlat_to_tile(east, south, z)
    mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), np.float32)
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            mosaic[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = fetch_tile(z, tx, ty)
    px0, py0 = _merc(west, north, z)
    px1, py1 = _merc(east, south, z)
    box = ((px0 - x0) * 256, (py0 - y0) * 256, (px1 - x0) * 256, (py1 - y0) * 256)
    img = Image.fromarray(mosaic, mode='F').resize((grid, grid), Image.BILINEAR, box=box)
    arr = np.clip(np.rint(np.asarray(img)), -32768, 32767).astype(np.int16)
    return arr, [south, west, north, east], span_km * 1000 / grid, z


def bake(tid, lat, lon, span_km, grid=192):
    arr, bbox, cell_m, z = grid_for(lat, lon, span_km, grid)
    # The surroundings: without them a mainland place (Davao, Vigan, Banaue) looks like an island in an empty sea.
    outer, obox, ocell, oz = grid_for(lat, lon, span_km * OUTER_FACTOR, OUTER_GRID)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, f'{tid}.js'), 'w', encoding='utf-8') as f:
        f.write(write_js(tid, arr, bbox, cell_m))
        f.write(write_js(f'{tid}:outer', outer, obox, ocell))
    print(f'{tid}: z{z} -> {grid}^2, min {arr.min()} m, max {arr.max()} m, land {np.mean(arr > 0):.0%}; '
          f'outer z{oz} {span_km * OUTER_FACTOR:.0f} km, land {np.mean(outer > 0):.0%}')


def main(argv):
    ids = list(BOXES) if argv == ['--all'] else argv
    if not ids:
        sys.exit(__doc__)
    for tid in ids:
        lat, lon, span, *rest = BOXES[tid]
        bake(tid, lat, lon, span, *(rest or [192]))


if __name__ == '__main__':
    main(sys.argv[1:])
