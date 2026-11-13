/* Pure, DOM-free helpers shared by the site and the node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PH_CORE = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  // '#/' -> map, '#/<id>' -> destination, '#/<id>/<section>' -> destination at a section; anything else -> map.
  function parseRoute(hash, ids) {
    const m = /^#\/([\w-]+)(?:\/([\w-]+))?\/?$/.exec(hash || '');
    if (!m || !ids.includes(m[1])) return { view: 'map' };
    return { view: 'dest', id: m[1], section: m[2] || null };
  }

  function b64ToBytes(b64) {
    if (typeof atob === 'function') return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }

  function decodeTerrain(t) {
    const bytes = b64ToBytes(t.b64), dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const data = new Float32Array(t.w * t.h);
    for (let i = 0; i < data.length; i++) data[i] = dv.getInt16(i * 2, true);
    return { w: t.w, h: t.h, bbox: t.bbox, cellM: t.cellM, data };
  }

  // gx: 0..w-1 west -> east, gy: 0..h-1 north -> south.
  function geoToGrid(grid, lat, lon) {
    const [s, w, n, e] = grid.bbox;
    return { gx: (lon - w) / (e - w) * (grid.w - 1), gy: (n - lat) / (n - s) * (grid.h - 1) };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Grid-cell rectangle for a [s, w, n, e] area, clamped to the grid.
  function areaCells(grid, area) {
    const a = geoToGrid(grid, area[2], area[1]), b = geoToGrid(grid, area[0], area[3]);
    return {
      x0: clamp(Math.floor(Math.min(a.gx, b.gx)), 0, grid.w - 1), x1: clamp(Math.ceil(Math.max(a.gx, b.gx)), 0, grid.w - 1),
      y0: clamp(Math.floor(Math.min(a.gy, b.gy)), 0, grid.h - 1), y1: clamp(Math.ceil(Math.max(a.gy, b.gy)), 0, grid.h - 1),
    };
  }

  // Adds peaks (profile(d/r) * height) at random land points in the area; never touches sea cells.
  function stampPeaks(grid, t, rnd, profile, add) {
    const { w, h, data, cellM } = grid, r = t.radius / cellM, box = areaCells(grid, t.area), base = data.slice();
    for (let i = 0; i < t.count; i++) {
      const cx = lerp(box.x0, box.x1, rnd()), cy = lerp(box.y0, box.y1, rnd()), hgt = t.height * (0.6 + 0.4 * rnd());
      const ci = Math.round(cy) * w + Math.round(cx);
      if (base[ci] <= 0) continue;
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(h - 1, Math.ceil(cy + r)); y++) {
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(w - 1, Math.ceil(cx + r)); x++) {
          const k = y * w + x, d = Math.hypot(x - cx, y - cy) / r;
          if (d >= 1 || base[k] <= 0) continue;
          data[k] = add(data[k], base[k], hgt * profile(d));
        }
      }
    }
  }

  // Distance (in cells, 8-connected chamfer) from every cell to the nearest land cell.
  function distToLand(grid) {
    const { w, h, data } = grid, D = new Float32Array(w * h).fill(Infinity), q = [];
    for (let i = 0; i < D.length; i++) if (data[i] > 0) { D[i] = 0; q.push(i); }
    for (let qi = 0; qi < q.length; qi++) {
      const i = q[qi], x = i % w, y = (i / w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < w && ny < h) {
          const k = ny * w + nx, nd = D[i] + (dx && dy ? Math.SQRT2 : 1);
          if (nd < D[k]) { D[k] = nd; q.push(k); }
        }
      }
    }
    return D;
  }

  const TOUCHUPS = {
    cones(grid, t, rnd) {
      const before = grid.data.slice();
      stampPeaks(grid, t, rnd, d => 1 - d, (cur, base, add) => Math.max(cur, base + add));
      // Mark raised cells so the engine can colour the cones apart from the land around them.
      grid.mark = grid.mark || new Uint8Array(grid.data.length);
      for (let i = 0; i < before.length; i++) if (grid.data[i] > before[i]) grid.mark[i] = 1;
    },
    karst(grid, t, rnd) { stampPeaks(grid, t, rnd, d => 1 - d ** 4, (cur, base, add) => Math.max(cur, base + add)); },
    reefShelf(grid, t) {
      const D = distToLand(grid), lim = t.width / grid.cellM + 1e-6;
      for (let i = 0; i < D.length; i++) if (grid.data[i] <= 0 && D[i] <= lim) grid.data[i] = Math.max(grid.data[i], -t.depth);
    },
    lagoon(grid, t) {
      const { w, h, data, cellM } = grid, c = geoToGrid(grid, t.at[0], t.at[1]), r = t.radius / cellM;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d = Math.hypot(x - c.gx, y - c.gy);
        if (d <= r - 1) data[y * w + x] = Math.min(data[y * w + x], -t.depth); // outer 1-cell ring stays as the rim
      }
    },
    terraces(grid, t) {
      const b = areaCells(grid, t.area), { w, data } = grid;
      grid.mark = grid.mark || new Uint8Array(data.length);
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
        const k = y * w + x;
        if (data[k] > 0) { data[k] = Math.max(t.step, Math.floor(data[k] / t.step) * t.step); grid.mark[k] = 2; }
      }
    },
  };

  function applyTouchups(grid, touchups, seed = 1) {
    const rnd = mulberry32(seed);
    for (const t of touchups || []) {
      if (!TOUCHUPS[t.kind]) throw new Error(`unknown touch-up: ${t.kind}`);
      TOUCHUPS[t.kind](grid, t, rnd);
    }
    return grid;
  }

  const PASSPORT_KEY = 'ph.passport.v1';
  function Passport(storage) {
    let ids = [];
    try {
      const v = JSON.parse(storage.getItem(PASSPORT_KEY) || '[]');
      if (Array.isArray(v)) ids = v.filter(x => typeof x === 'string');
    } catch (e) { /* unreadable storage: start empty, keep working in memory */ }
    const save = () => { try { storage.setItem(PASSPORT_KEY, JSON.stringify(ids)); } catch (e) { /* memory only */ } };
    return {
      has: id => ids.includes(id),
      add(id) { if (ids.includes(id)) return false; ids.push(id); save(); return true; },
      size: () => ids.length,
      all: () => ids.slice(),
    };
  }

  return { clamp, smooth, lerp, parseRoute, decodeTerrain, geoToGrid, applyTouchups, Passport, mulberry32 };
});
