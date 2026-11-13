'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRoute, decodeTerrain, geoToGrid, applyTouchups, Passport } = require('../assets/js/core.js');

const IDS = ['dabaw', 'el-nido', 'boracay', 'bohol', 'siargao', 'banaue', 'vigan', 'cebu', 'mayon', 'batanes'];

test('parseRoute: empty and root go to the map', () => {
  assert.deepEqual(parseRoute('', IDS), { view: 'map' });
  assert.deepEqual(parseRoute('#/', IDS), { view: 'map' });
});
test('parseRoute: destination with and without section', () => {
  assert.deepEqual(parseRoute('#/bohol', IDS), { view: 'dest', id: 'bohol', section: null });
  assert.deepEqual(parseRoute('#/dabaw/apo', IDS), { view: 'dest', id: 'dabaw', section: 'apo' });
});
test('parseRoute: unknown ids and legacy anchors go to the map', () => {
  assert.deepEqual(parseRoute('#/nowhere', IDS), { view: 'map' });
  assert.deepEqual(parseRoute('#apo', IDS), { view: 'map' });
});

test('decodeTerrain: base64 Int16 LE back to floats', () => {
  const b64 = Buffer.from(new Int16Array([0, -5, 300, 2954]).buffer).toString('base64');
  const g = decodeTerrain({ w: 2, h: 2, bbox: [0, 0, 1, 1], cellM: 10, b64 });
  assert.ok(g.data instanceof Float32Array);
  assert.deepEqual([...g.data], [0, -5, 300, 2954]);
  assert.equal(g.w, 2);
});

test('geoToGrid: corners map to grid corners', () => {
  const g = { w: 11, h: 21, bbox: [10, 120, 11, 121] };
  assert.deepEqual(geoToGrid(g, 11, 120), { gx: 0, gy: 0 });
  assert.deepEqual(geoToGrid(g, 10, 121), { gx: 10, gy: 20 });
});

function halfGrid(landFn = () => 10) {
  const w = 20, h = 20, data = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = x < 10 ? landFn(x, y) : -20;
  return { w, h, bbox: [0, 0, 0.018, 0.018], cellM: 100, data };
}
const AREA = [0, 0, 0.018, 0.018];

test('touch-ups: cones raise land only', () => {
  const g = halfGrid();
  applyTouchups(g, [{ kind: 'cones', area: AREA, count: 30, height: 30, radius: 200 }]);
  let raised = false;
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
    const v = g.data[y * 20 + x];
    if (x >= 10) assert.equal(v, -20, `sea changed at ${x},${y}`);
    else if (v > 10) raised = true;
  }
  assert.ok(raised);
});
test('touch-ups: cones mark the cells they raise, and nothing else', () => {
  const g = halfGrid();
  applyTouchups(g, [{ kind: 'cones', area: AREA, count: 30, height: 30, radius: 200 }]);
  assert.ok(g.mark instanceof Uint8Array);
  for (let i = 0; i < g.data.length; i++) assert.equal(g.mark[i] === 1, g.data[i] > 10, `cell ${i}`);
});
test('touch-ups: reef shelf lifts sea near land only', () => {
  const g = halfGrid();
  applyTouchups(g, [{ kind: 'reefShelf', depth: 2, width: 300 }]);
  for (let y = 0; y < 20; y++) {
    assert.equal(g.data[y * 20 + 10], -2);
    assert.equal(g.data[y * 20 + 19], -20);
    assert.equal(g.data[y * 20 + 3], 10);
  }
});
test('touch-ups: terraces quantise land heights', () => {
  const g = halfGrid(x => x * 1.7 + 1);
  applyTouchups(g, [{ kind: 'terraces', area: AREA, step: 5 }]);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 10; x++) assert.equal(g.data[y * 20 + x] % 5, 0);
});
test('touch-ups: terraces mark land cells in their area with 2', () => {
  const g = halfGrid(x => x * 7 + 3);
  applyTouchups(g, [{ kind: 'terraces', area: AREA, step: 5 }]);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) assert.equal(g.mark[y * 20 + x], x < 10 ? 2 : 0);
});
test('touch-ups: karst and lagoon behave, same seed is deterministic', () => {
  const tus = [{ kind: 'karst', area: AREA, count: 10, height: 50, radius: 150 }, { kind: 'lagoon', at: [0.009, 0.004], radius: 250, depth: 4 }];
  const a = applyTouchups(halfGrid(), tus, 7), b = applyTouchups(halfGrid(), tus, 7);
  assert.deepEqual([...a.data], [...b.data]);
  assert.ok(a.data.some(v => v > 10));
  assert.equal(a.data[10 * 20 + 4], -4); // lagoon centre carved
  for (let y = 0; y < 20; y++) assert.equal(a.data[y * 20 + 19], -20); // far sea untouched
});

function fakeStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}
test('Passport: stamps persist in storage', () => {
  const s = fakeStorage();
  const p = Passport(s);
  assert.equal(p.add('bohol'), true);
  assert.equal(p.add('bohol'), false);
  assert.equal(Passport(s).has('bohol'), true);
  assert.deepEqual(Passport(s).all(), ['bohol']);
});
test('Passport: works in memory when storage throws', () => {
  const boom = () => { throw new Error('denied'); };
  const p = Passport({ getItem: boom, setItem: boom });
  assert.equal(p.add('cebu'), true);
  assert.equal(p.size(), 1);
});
test('Passport: garbage in storage reads as empty', () => {
  const s = fakeStorage();
  s.setItem('ph.passport.v1', '{nope');
  assert.equal(Passport(s).size(), 0);
  s.setItem('ph.passport.v1', '{"a":1}');
  assert.equal(Passport(s).size(), 0);
});
