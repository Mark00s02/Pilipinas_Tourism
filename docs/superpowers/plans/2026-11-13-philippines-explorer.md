# Philippines Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single Dabaw page into a map-first site with 10 destination pages. Each page gets a real-elevation 3D scene, a trip card, a quiz and passport stamps.

**Architecture:** `index.html` is a static app shell with two views, a map and a destination, switched by `location.hash`. A shared three.js engine builds one destination at a time from a plain data object (`PH.register({...})`). Elevation is baked once by a Python tool into per-destination `.js` files. All data loads through `<script>` tags, so the site works from `file://` with no server.

**Tech Stack:** Vanilla JS (ES2020, no bundler), three.js (existing `assets/three.min.js`), Python 3.14 + Pillow + numpy (bake tools, installed), Node 26 (`node --test` for pure JS, `npx mapshaper` for the map), Microsoft Edge headless (screenshots and in-browser self-checks).

**Spec:** `docs/superpowers/specs/2026-11-13-philippines-explorer-design.md`

## Global Constraints

- The site must work by double-clicking `index.html` (`file://`). There is no `fetch()` of local files at runtime and no ES modules. Every data file is a classic `<script>` that assigns to `window.PH_*`.
- There are no runtime dependencies beyond `assets/three.min.js`. Tooling dependencies are only Python stdlib + Pillow + numpy, Node built-ins, and `npx mapshaper`.
- 10 destination ids, exactly: `dabaw el-nido boracay bohol siargao banaue vigan cebu mayon batanes`.
- Routes: `#/` = map, `#/<id>` = destination, `#/<id>/<section>` = destination scrolled to a section. Any unknown route goes to the map.
- The default terrain grid is 192×192 Int16 metres, and it may be larger for a destination if the total size of `assets/` stays ≤ 8 MB.
- Touch-ups never move coastlines. `cones`, `karst` and `terraces` only act where the real height is > 0. `reefShelf` and `lagoon` only act where the height is ≤ 0.
- Passport `localStorage` key: `ph.passport.v1`, holding a JSON array of ids. Every access is wrapped in try/catch.
- Tap targets are ≥ 44 px. Map destinations are keyboard-focusable buttons ordered north → south.
- Keep the existing visual identity: CSS tokens, Onest, grain, rail, `data-rv` reveals, dusk → night blend, `prefers-reduced-motion` handling and the `no-gl` fallback.
- Every photo, the terrain tiles, the province boundaries and the eagle model are credited. The footer is per destination, and the map screen has a global data-credits line.
- Copy is factual and stable (no "as of" numbers). The voice matches the current Dabaw copy. The trip card comes at the end of each page.

## Review Focus

1. **Old in-page anchors vs hash routing.** Dabaw's nav links are `#apo`, `#gulf` and so on. Clicking one must scroll within the page, not bounce to the map. → Test in Task 2 (`parseRoute('#apo')`) and Task 6 (links rewritten to `#/dabaw/apo`).
2. **`localStorage` throws or is empty** (private window, `file://` in some browsers). The map and stamps must still work for that session. → Test in Task 2 (throwing storage).
3. **Hopping between destinations repeatedly** must not leak GPU memory or let a slow build for place A land on screen after the user has moved to B. → `?selftest=cycle` check in Task 6.
4. **No WebGL.** The map must still work, and destination pages show text, photos, trip card and quiz without a 3D scene. → `?selftest=nogl` check in Task 6.
5. **Phone width, 390 px.** The tiny islands (Boracay, Batanes, Siargao) must still be tappable, and there must be no horizontal scroll. → Screenshot check in Task 5.

---

## File structure

| Path | Responsibility |
|---|---|
| `index.html` | Shell: `<head>`, both view containers, script tags in load order. CSS moves out. |
| `assets/css/site.css` | All styles (existing ones moved, plus map, card, trip, quiz, passport). |
| `assets/js/core.js` | Pure, DOM-free, testable: `clamp/smooth/lerp`, `parseRoute`, `decodeTerrain`, `geoToGrid`, `applyTouchups`, `Passport`. Exports via `module.exports` when present, else `window.PH_CORE`. |
| `assets/js/engine.js` | `PH.Engine`: one `WebGLRenderer`, `load(desc)` / `unload()`, terrain mesh, water, sky, clouds, lights, palette blend, camera keyframes, frame loop. |
| `assets/js/landmarks.js` | `PH.landmarks[kind](spec, ctx) -> THREE.Object3D` low-poly builders. Includes `loadGLB` (moved from `index.html`). |
| `assets/js/page.js` | `PH.renderPage(desc, el)` builds the destination DOM (hero, sections, trip, quiz, credits) and wires the rail and reveals. |
| `assets/js/map.js` | `PH.renderMap(el, passport)`: SVG map, pins, preview card, passport meter, all-10 overlay. |
| `assets/js/app.js` | Registry `PH.register`, router, view switching, self-tests. |
| `assets/map/ph-map.js` | `window.PH_MAP_SVG = '<svg…>'` (generated). |
| `assets/terrain/<id>.js` | `window.PH_TERRAIN['<id>'] = {w,h,bbox:[s,w,n,e],cellM,b64}` (generated). |
| `assets/destinations/<id>.js` | `PH.register({...})`, one per destination (content). |
| `assets/img/<id>/*.webp` | Photos (move today's 7 into `assets/img/dabaw/`). |
| `tools/bake_terrain.py`, `tools/test_bake_terrain.py` | Elevation bake + unittest. |
| `tools/build_map.py` | geoBoundaries → mapshaper → `assets/map/ph-map.js`. |
| `tools/fetch_photo.py` | Commons file → 1600 px WebP + prints credit line. |
| `tools/shoot.py` | Headless Edge: screenshot or `--dump-dom` of a URL. |
| `tests/core.test.js` | `node --test` for `core.js`. |

---

### Task 1: Repo, tooling and baked terrain (test bake: Bohol, El Nido, Siargao)

**Files:**
- Create: `.gitignore` (`tools/.cache/`), `tools/bake_terrain.py`, `tools/test_bake_terrain.py`, `tools/shoot.py`, `assets/terrain/{bohol,el-nido,siargao}.js`

**Interfaces:**
- Produces: `window.PH_TERRAIN[id] = { w:int, h:int, bbox:[south,west,north,east] (deg), cellM:float (metres per cell, x), b64:string (little-endian Int16, row 0 = north) }`.
- Produces: `python tools/shoot.py <url> <out.png> [--size 1440x900] [--wait 8000]` and `python tools/shoot.py <url> --dom` (prints the DOM to stdout).

- [ ] **Step 1:** `git init`, add `.gitignore`, and commit the existing site as-is (`chore: snapshot Dabaw before explorer rework`).
- [ ] **Step 2: Write failing tests** in `tools/test_bake_terrain.py` (unittest, stdlib):
  - `test_terrarium_decode`: pixel `(128, 0, 0)` → `0.0` m, and `(128, 100, 128)` → `100.5`.
  - `test_tile_math`: `lonlat_to_tile(124.17, 9.83, 12)` returns ints with `tile_to_lonlat` round-trip inside that tile.
  - `test_pick_zoom`: span 9 km, grid 192 → zoom where source px ≤ `9000/192/1.5` m, capped at 15.
  - `test_encode_roundtrip`: `encode_b64(np.array([[0,-5],[300,2954]],int16))` decodes back equal.
  - `test_write_js`: `write_js('x', arr, bbox, cellM)` output starts with `window.PH_TERRAIN=window.PH_TERRAIN||{};window.PH_TERRAIN['x']=`.
- [ ] **Step 3:** Run `python -m unittest tools/test_bake_terrain.py -v`. Expected: errors on missing names.
- [ ] **Step 4: Implement `tools/bake_terrain.py`** with the functions above, plus `bake(id, lat, lon, span_km, grid=192)` and a CLI `python tools/bake_terrain.py <id>... | --all`.
  - Height decodes as `R*256 + G + B/256 − 32768`.
  - Tiles come from `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` and are cached in `tools/.cache/`. Send the User-Agent `ph-explorer-bake`.
  - Stitch, crop to the bbox (square in km, using `cos(lat)`), and resample with Pillow `Image.resize(..., BILINEAR)` on a float32 mode-`F` image. Then round to int16.
  - Starting boxes (centre lat, lon, span km). Tune later:

    | id | lat | lon | span |
    |---|---|---|---|
    | dabaw | 7.03 | 125.48 | 70 |
    | el-nido | 11.13 | 119.38 | 22 |
    | boracay | 11.97 | 121.925 | 9 |
    | bohol | 9.75 | 124.10 | 35 |
    | siargao | 9.87 | 126.05 | 40 |
    | banaue | 16.93 | 121.07 | 18 |
    | vigan | 17.57 | 120.39 | 20 |
    | cebu | 10.00 | 123.65 | 110 |
    | mayon | 13.22 | 123.70 | 30 |
    | batanes | 20.40 | 121.95 | 30 |

- [ ] **Step 5:** Run the tests. Expected: 5 passed.
- [ ] **Step 6:** Run `python tools/bake_terrain.py bohol el-nido siargao`. Expected: three files of ~75 KB each, and a printed summary per id (`min/max m`). Sanity check: Bohol's max is between 600 and 900 m, El Nido has land and sea, and Siargao's min is < 0.
- [ ] **Step 7: Implement `tools/shoot.py`.** It runs Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, fallback Chrome) with `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=<wait> --window-size=W,H`, then `--screenshot=<abs out>` or `--dump-dom`. It converts relative file paths to `file:///` URLs.
- [ ] **Step 8: Commit** (`feat(tools): terrain bake + headless shoot; test bake bohol/el-nido/siargao`).

### Task 2: `core.js` — routing, terrain decode, touch-ups, passport

**Files:**
- Create: `assets/js/core.js`, `tests/core.test.js`

**Interfaces:**
- Produces (on `window.PH_CORE`, and in `module.exports` for node):
  - `clamp(v,a,b)`, `smooth(e0,e1,x)`, `lerp(a,b,t)` (moved verbatim from `index.html`).
  - `parseRoute(hash:string, ids:string[]) -> {view:'map'} | {view:'dest', id:string, section:string|null}`
  - `decodeTerrain(t) -> {w,h,bbox,cellM,data:Float32Array}` (from the `PH_TERRAIN` entry; node uses `Buffer`, the browser uses `atob`).
  - `geoToGrid(grid, lat, lon) -> {gx:float, gy:float}` (gx 0..w-1 west→east, gy 0..h-1 north→south).
  - `applyTouchups(grid, touchups:Array, seed=1) -> grid` (mutates and returns `data`).
  - `Passport(storage)` → `{ has(id), add(id) -> bool (true if newly added), size(), all() }`. It is memory-backed when storage throws.

Touch-up specs (all positions are `[lat, lon]`, all sizes are metres):
- `{kind:'cones', area:[s,w,n,e], count, height, radius}`: seeded random cones, only on land, using `max(h, h0 + cone)`.
- `{kind:'karst', area, count, height, radius}`: steep-sided spires (`height * (1 - (d/r)^4)`). Applied where there is land.
- `{kind:'reefShelf', depth, width}`: sea cells within `width` metres of land are raised to `max(h, -depth)`.
- `{kind:'lagoon', at:[lat,lon], radius, depth}`: land cells inside the radius become `-depth`, except a 1-cell rim that keeps the original height.
- `{kind:'terraces', area, step}`: land heights in the area are quantised to `floor(h/step)*step`.

> `lagoon` is the one touch-up that turns land into water. It is allowed because it carves an enclosed basin and keeps the rim, so the outer coastline is unchanged.

- [ ] **Step 1: Write failing tests** in `tests/core.test.js` (`node:test` + `node:assert`):
  - `parseRoute`:
    - `('', ids)` and `('#/', ids)` → `{view:'map'}`
    - `('#/bohol', ids)` → `{view:'dest',id:'bohol',section:null}`
    - `('#/dabaw/apo', ids)` → section `'apo'`
    - `('#/nowhere', ids)` → map
    - `('#apo', ids)` → map (legacy anchors are never routes; Task 6 rewrites them)
  - `decodeTerrain`: a 2×2 entry encoding `[0,-5,300,2954]` → `data` equals those numbers as floats.
  - `applyTouchups`, on a 20×20 grid (cellM 100, bbox `[0,0,0.018,0.018]`), left half land at 10 m and right half sea at −20 m:
    - `cones` over the whole area: no sea cell changes, and at least one land cell is > 10.
    - `reefShelf {depth:2,width:300}`: sea cells in column 10 become −2, column 19 stays −20, and land is unchanged.
    - `terraces {step:5}` on a land ramp: all values are multiples of 5.
    - Same seed → identical output twice.
  - `Passport`:
    - with a `Map`-backed fake storage, `add('bohol')` → true and a second `add('bohol')` → false. A new `Passport` on the same storage → `has('bohol')`.
    - With storage whose `getItem`/`setItem` throw, `add` still works and `size()===1`.
    - Garbage JSON in storage → `size()===0`.
- [ ] **Step 2:** Run `node --test tests/`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `assets/js/core.js` as a UMD-style IIFE. Seeded RNG: mulberry32.
- [ ] **Step 4:** Run `node --test tests/`. Expected: all pass.
- [ ] **Step 5: Commit** (`feat(core): routing, terrain decode, touch-ups, passport`).

### Task 3: Split `index.html` into shell + engine, with Dabaw on real terrain

The goal is that Dabaw looks and behaves as it does today, but its world comes from `PH.register` data and the baked real terrain.

**Files:**
- Create: `assets/css/site.css`, `assets/js/engine.js`, `assets/js/landmarks.js`, `assets/js/page.js`, `assets/js/app.js`, `assets/destinations/dabaw.js`, `assets/terrain/dabaw.js`
- Move: `assets/img/*.webp` → `assets/img/dabaw/`
- Modify: `index.html` (strip to shell)

**Interfaces:**
- Consumes: `PH_CORE.*` (Task 2), `PH_TERRAIN` (Task 1).
- Produces:
  - `PH.register(desc)`, `PH.get(id)`, `PH.ids()` (in registration order = north → south script order).
  - `PH.Engine`: `create(canvas) -> engine|null` (null if WebGL fails), `engine.load(desc) -> Promise<void>`, `engine.unload()`, `engine.setProgress(p:number)`, `engine.info() -> {geometries, textures}`.
  - `PH.geo(desc, lat, lon, altM) -> THREE.Vector3`. World X = east, Z = south. The box maps to 380 world units. Height uses `altM * (380/spanM) * vScale`.
  - `PH.landmarks[kind](spec, ctx) -> THREE.Object3D`, where `ctx = {geo, heightAt(lat,lon), scene, seed}`. In this task: `palms`, `clouds`, `cityLights`, `eagle` (GLB with fallback, moved from `index.html`).
  - `PH.renderPage(desc, el) -> {sections: HTMLElement[]}` (the `data-cam` elements, for `progress()`).
  - The description shape is the spec's. `sections[i].cam = {pos:[lat,lon,altM], look:[lat,lon,altM]}`, and `hero.cam` is the same. The optional `sections[i].follow:'eagle'` keeps today's eagle-tracking camera. `palette` is optional and defaults to the current `PAL`.

- [ ] **Step 1:** Bake: `python tools/bake_terrain.py dabaw`.
- [ ] **Step 2:** Move the CSS verbatim to `site.css`. Move the GLB reader and the eagle builder to `landmarks.js`. Move sky, water, fog, lights, clouds, palette blend and the frame loop to `engine.js`, replacing `height()` with a bilinear sample of the decoded grid. Vertex colours come from height + slope bands (beach < 3 m, lowland, forest, rock > 1800 m), with flat shading kept.
- [ ] **Step 3:** Write `assets/destinations/dabaw.js` with today's copy, stats, plates and credits moved verbatim from `index.html`. Re-aim the cameras with lat/lon: Apo summit 6.987, 125.270, 2954 m; Samal 7.08, 125.72; city 7.07, 125.61. Add `trip` and `quiz`:
  - trip: get there: fly to Davao (DVO); season: Mar–May dry, Aug for Kadayawan; budget: mid; must-eat: durian.
  - quiz: "Mount Apo is the highest peak in the Philippines. Roughly how tall is it?"; options `1,200 m / 2,954 m / 4,100 m`; answer 1.
- [ ] **Step 4:** `index.html` becomes the shell. It keeps the head, grain, loader, header/nav, `<canvas id="gl">`, `<main id="view-map">`, `<main id="view-dest">` and the footer slot, plus script tags in this order: three, core, landmarks, engine, page, map (Task 5), app, `ph-map.js`, all `destinations/*.js`, all `terrain/*.js`, `eagle.glb.js`. `app.js` boots on `DOMContentLoaded`. In this task, `#/` still opens Dabaw.
- [ ] **Step 5: Verify.** Run `python tools/shoot.py "index.html#/dabaw" shots/dabaw-hero.png`, and repeat for `#/dabaw/haribon` and `#/dabaw/madayaw`. Expected: Apo visible inland, the gulf and Samal to the east, the eagle in frame on `haribon`, and night city lights on `madayaw`. Compare against the old page (`git stash`-free: open the Task 1 commit in a second checkout if needed). Also run `node --test tests/`, which still passes.
- [ ] **Step 6: Commit** (`refactor: data-driven engine; Dabaw on real Apo terrain`).

### Task 4: Landmarks and touch-ups for the test-bake three; review gate

**Files:**
- Create: `assets/destinations/{bohol,el-nido,siargao}.js`, `assets/img/{bohol,el-nido,siargao}/*.webp`, `tools/fetch_photo.py`
- Modify: `assets/js/landmarks.js`, `assets/js/engine.js` (call `applyTouchups` after decode)

**Interfaces:**
- Produces: landmark kinds `bangka`, `belfry`, `boardwalk`, `surfer`. Each takes `{at:[lat,lon]|area, count?, heading?}`.
- Produces: `python tools/fetch_photo.py "<Commons File: title>" <id> <name>`. It writes `assets/img/<id>/<name>.webp` (1600 px wide, q≈80) and prints a credit object `{title,author,license,url}` read from the Commons API `imageinfo&iiprop=extmetadata`. It refuses any file whose licence is not CC0/PD/CC BY/CC BY-SA.

- [ ] **Step 1:** Write the three destination files. Each has a hero + 3–4 sections, `trip`, `quiz`, 2–5 photos fetched with `fetch_photo.py`, and credits. Touch-ups:
  - **Bohol:** `cones` over area `[9.78,124.10,9.92,124.25]`, count about 260, height 60, radius 120. Landmarks: `belfry` at Baclayon (9.623, 123.912). Loboc river camera.
  - **El Nido:** `karst` over the Bacuit Bay islands area, `lagoon` at Miniloc (11.150, 119.322), `reefShelf {depth:3,width:150}`. Landmarks: `bangka` ×6.
  - **Siargao:** `reefShelf {depth:2,width:400}`. Landmarks: `boardwalk` + `surfer` at Cloud 9 (9.812, 126.168), `palms`.
- [ ] **Step 2:** Run `node --test tests/`. Expected: pass. Load `index.html#/bohol`, `#/el-nido` and `#/siargao` in Edge with the devtools console open. Expected: no errors.
- [ ] **Step 3:** Screenshot every section of the three (`tools/shoot.py` in a loop) into `shots/test-bake/`.
- [ ] **Step 4: STOP — user review.** Show the screenshots. The user approves the look or asks for tuning (box, `vScale`, grid size, touch-up strength). Iterate, then continue only on approval.
- [ ] **Step 5: Commit** (`feat: Bohol, El Nido, Siargao destinations with touch-ups`).

### Task 5: Map home screen + passport

**Files:**
- Create: `tools/build_map.py`, `assets/map/ph-map.js`, `assets/js/map.js`
- Modify: `assets/js/app.js` (`#/` → map), `assets/css/site.css`

**Interfaces:**
- Consumes: `PH.ids()`, `PH.get(id).{name, province, hook, bestMonths, plates[0], mapPin:[lat,lon]}`, `PH_CORE.Passport`.
- Produces: `window.PH_MAP_SVG`, an SVG string with `<path data-province="<shapeName>">` per province and a `viewBox` in projected units. It also has `window.PH_MAP_PROJ = {lon0, lat0, scale, …}` so `map.js` can place pins from lat/lon.
- Produces: `PH.renderMap(el, passport) -> {destroy()}`.

- [ ] **Step 1: Implement `tools/build_map.py`.**
  - Fetch `https://www.geoboundaries.org/api/current/gbOpen/PHL/ADM2/`, take `simplifiedGeometryGeoJSON`, and cache it.
  - Run `npx -y mapshaper <in> -simplify 3% keep-shapes -proj +proj=merc -o format=svg id-field=shapeName <tmp.svg>`.
  - Emit `ph-map.js`, plus the projection params needed to place pins. Use the same mercator, and read the bounds that mapshaper reports with `-info`, or compute them in Python.
  - Target size is ≤ 150 KB, so raise the simplify % if it's over.
- [ ] **Step 2:** Run it, and check that all 10 provinces exist by name. Ilocos Sur, Ifugao, Albay, Batanes, Aklan, Palawan, Bohol, Cebu, Surigao del Norte and Davao del Sur must all be present (print the missing ones and fail if any are missing). For Dabaw, `Davao del Sur` may be split as `Davao City`, so match either name.
- [ ] **Step 3: Implement `map.js`.**
  - The SVG is inlined into `#view-map`. Destination provinces get the class `is-dest`, and the rest stay dim.
  - Each destination gets a `<button class="pin">` that is absolutely positioned from `mapPin` and is ≥ 44 px.
  - The first tap or hover/focus shows the preview card (name, hook, best months, photo, stamp state, "Explore →" link to `#/<id>`). A second tap on the same pin navigates.
  - Passport meter `N / 10`. When `size()` hits 10 for the first time, the overlay shows once, guarded by the `ph.passport.v1.done` key. Once all 10 are collected, clicking the meter replays it.
  - The title copy is "Pilipinas — pick your next trip". The data-credits line covers geoBoundaries, the AWS Terrain Tiles sources and the eagle.
- [ ] **Step 4: Wire the quiz → stamp in `page.js`.** A correct answer calls `passport.add(id)` and shows the stamp, with "Back to the map". A wrong answer shows `quiz.explain` and lets the user retry.
- [ ] **Step 5: Verify.**
  - Run `tools/shoot.py "index.html#/" shots/map-desktop.png` and `--size 390x844 shots/map-phone.png`. Expected: all 10 pins visible and none overlapping, and no horizontal scrollbar on phone. For pins that are too close (Bohol/Cebu), offset the labels.
  - Run `?selftest=map` with `--dom`, which prints `selftest:map ok` once every pin's bounding rect is ≥ 44×44 at 390 px.
- [ ] **Step 6: Commit** (`feat: map home screen, preview cards, passport stamps`).

### Task 6: Routing polish, transitions, self-tests

**Files:**
- Modify: `assets/js/app.js`, `assets/js/page.js`, `assets/js/engine.js`

**Interfaces:**
- Consumes: everything above.
- Produces: `?selftest=cycle|nogl|map` modes. Each appends `<pre id="selftest">` with a single line `selftest:<name> ok` or `selftest:<name> FAIL <reason>`.

- [ ] **Step 1:** In `page.js`, rewrite in-page links to `#/<id>/<section>`, and scroll to the section on route. This fixes Review Focus 1.
- [ ] **Step 2:** The router keeps a `loadToken`, and `engine.load` resolves only if its token is still current. Otherwise the scene is disposed immediately (Review Focus 3). Map → destination shows the existing `#loader`, with a CSS zoom on the map toward the pin (skipped under reduced motion). Destination → map calls `engine.unload()`, which disposes every geometry, material and texture in the scene.
- [ ] **Step 3: Self-tests.**
  - `cycle`: visit all 10 ids, then the map, twice, at 1 s intervals, including two rapid switches at 50 ms. Pass when `engine.info()` on the map after round 2 equals the value after round 1, and the visible page id equals the last route.
  - `nogl`: force `PH.Engine.create` to return null. Pass when `#/bohol` renders its sections, trip card and quiz, and `documentElement` has `no-gl`.
- [ ] **Step 4:** Run `python tools/shoot.py "index.html?selftest=cycle#/" --dom --wait 40000`, then the same for `nogl`. Expected: an `ok` line each.
- [ ] **Step 5: Commit** (`feat: routing, transitions, leak/no-GL self-tests`).

### Task 7: Remaining six destinations

**Files:**
- Create: `assets/destinations/{boracay,banaue,vigan,cebu,mayon,batanes}.js`, `assets/terrain/{…}.js`, `assets/img/{…}/*.webp`
- Modify: `assets/js/landmarks.js` (new kinds: `paraw`, `huts`, `houses`, `kalesa`, `kiosk`, `whaleShark`, `lighthouse`)

- [ ] **Step 1:** `python tools/bake_terrain.py boracay banaue vigan cebu mayon batanes`
- [ ] **Step 2:** One destination file each, following Task 4's pattern. Signature touch-ups and landmarks:
  - **Boracay:** `reefShelf {depth:2,width:250}`, `paraw` ×5 off White Beach (11.962, 121.924), `palms`.
  - **Banaue:** `terraces {step:6}` over the Batad amphitheatre area (around 16.97, 121.10) and the Banaue viewpoint slopes. `huts`.
  - **Vigan:** `houses` grid along Calle Crisologo (17.571, 120.387), `kalesa`.
  - **Cebu:** `kiosk` (Magellan's Cross, 10.293, 123.902), `whaleShark` ×3 off Oslob (9.46, 123.38), `palms`.
  - **Mayon:** the cone comes from real data, so there are no touch-ups. `belfry` (Cagsawa, 13.166, 123.711). A dusk palette with a faint summit glow.
  - **Batanes:** `lighthouse` (Basco/Naidi Hills, 20.454, 121.968), `houses` (stone, Ivatan style).
- [ ] **Step 3:** Shoot all sections into `shots/all/`, and fix anything that looks broken (camera inside terrain, landmark floating or buried).
- [ ] **Step 4:** Run `?selftest=cycle` again, plus `node --test tests/`. Also run `du -sh assets` (or the PowerShell sum), which should be ≤ 8 MB.
- [ ] **Step 5: Commit** (`feat: Boracay, Banaue, Vigan, Cebu, Mayon, Batanes`).

### Task 8: Final check

- [ ] **Step 1:** Open `index.html` by double-click (`file://`). Click the map → three destinations → quiz → stamp → back. Expected: no console errors, and the stamp persists after reload.
- [ ] **Step 2:** Repeat over `python -m http.server`.
- [ ] **Step 3:** Run every self-test, `node --test tests/` and `python -m unittest tools/test_bake_terrain.py`. All should pass.
- [ ] **Step 4:** Check credits. Every `assets/img/**.webp` appears in exactly one destination's `credits`, verified with a small one-off script.
- [ ] **Step 5: Commit** (`chore: final verification`).
