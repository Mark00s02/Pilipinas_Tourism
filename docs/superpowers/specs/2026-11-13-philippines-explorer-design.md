# Philippines Explorer — design

Date: 2026-11-13
Status: draft, awaiting approval

## Intent

Today the site is **Dabaw**: one scroll-driven 3D page about Davao City (`index.html`, ~50 KB, three.js r1xx in `assets/three.min.js`).

The goal is to turn it into a travel-inspiration site for **tourists choosing where to go in the Philippines**:

1. The site opens on a map of the Philippines.
2. Ten destinations are highlighted on the map. Tapping one opens a 3D scroll-through page for that place in the same style as Dabaw.
3. The pages should be educational and fun, and written for someone deciding whether to go. The story sections lead each page, the way Dabaw does now, but they are angled at the traveller: what you'll see, do and eat there. History and geography appear as bite-sized facts. Practical info (getting there, season, budget, must-eat) sits in a "plan your trip" card at the end. A small passport-stamp game rewards exploring.

## Goals

- A map home screen with 10 tappable destinations. Each shows a hover/tap preview card before you enter.
- One 3D page per destination. Each page has a terrain model built from **real elevation data** for that place, rendered in Dabaw's low-poly, flat-shaded style.
- Every page ends with a "plan your trip" card and a single quiz question. A correct answer earns a passport stamp.
- A passport meter on the map screen (`N / 10 stamps`). Collecting all 10 triggers a short celebration.
- The site still works offline when opened from the folder, as it does now.

## Non-goals

- Booking, prices from live APIs, maps for navigation, accounts and servers.
- Covering every province. The other provinces are a dim, non-interactive backdrop.
- Exact-scale geography. Terrain is real but vertically exaggerated for drama.

## Anti-goals (it fails if…)

- It reads like a government regions explainer instead of "where should I go?"
- The ten pages feel like the same scene recoloured. Each needs its own signature landscape and at least one signature landmark.
- It breaks when opened by double-clicking `index.html` (the `file://` protocol). The current page deliberately supports this: `assets/models/eagle.glb.js` exists so the model loads without `fetch`.
- Uncredited photos or data.

## Destinations (decided)

| id | Name | Province shaded on map | Signature terrain / landmark | Content hooks |
|---|---|---|---|---|
| `dabaw` | Dabaw | Davao del Sur | Mt Apo, Davao Gulf, Samal; Philippine eagle (existing GLB) | Kadayawan, durian |
| `el-nido` | El Nido | Palawan | Bacuit Bay karst islands, lagoons; bangka boats | Island-hopping tours A–D |
| `boracay` | Boracay | Aklan | Small island, White Beach; paraw sailboats | Sunsets, Puka beach |
| `bohol` | Bohol | Bohol | Chocolate Hills (cones added as touch-ups); tarsier | Loboc River, Baclayon church |
| `siargao` | Siargao | Surigao del Norte | Island + reef edge; Cloud 9 boardwalk, surfer | Sugba lagoon, surf season |
| `banaue` | Banaue | Ifugao | Steep valleys; rice terraces (terracing applied to slope bands) | UNESCO, Ifugao culture |
| `vigan` | Vigan | Ilocos Sur | Flat coastal plain + Abra river; Calle Crisologo houses, kalesa | Empanada, UNESCO |
| `cebu` | Cebu | Cebu | Long spine island; Magellan's Cross kiosk, whale shark | Kawasan Falls, lechon |
| `mayon` | Mayon / Albay | Albay | Mayon's near-perfect cone; Cagsawa ruins belfry | Cagsawa history, pili |
| `batanes` | Batanes | Batanes | Rolling hills, cliffs; stone houses, Basco lighthouse | Ivatan culture |

## Approaches

Three were considered.

- **A. One shared template, with 10 data entries, on procedural terrain.** This was the original recommendation.
- **B. Copy the Dabaw page 10 times.** This was rejected because 10 diverging files multiply every fix.
- **C. Real elevation data for each place.** **Chosen by the user.**

C answers where the terrain comes from. The user then chose real data **plus touch-ups** over raw data only, because these pages exist to sell each place, and the famous features are what do that. It is combined with A's structure: one shared engine, with each destination described as data. This combination is the builder's call.

## Decided how

### Structure

- `index.html` is the single page and the app shell. It contains the map view and the destination view, switched by URL hash (`#/` = map, `#/el-nido` = destination). The browser back button returns to the map, and links are shareable.
- `assets/js/engine.js` holds the shared 3D scene builder, extracted from today's inline script. It contains the sky shader, water, fog, lights, palette blending, the scroll-to-camera keyframes, clouds, palm instancing, city lights and the GLB reader.
- `assets/destinations/<id>.js` holds one file per destination. Each registers a description object. It is loaded with `<script>` so it works on `file://`.
- `assets/terrain/<id>.js` holds baked elevation per destination, as a base64 `Int16Array` assigned to a global. It uses the same pattern as `eagle.glb.js`, which avoids the `fetch` and canvas-taint problems on `file://`.
- No build step and no npm for the site itself. The one-off data-baking script lives in `tools/` (see below).

### Destination description (shape, not final)

```js
PH.register({
  id: 'el-nido', name: 'El Nido', province: 'Palawan',
  hook: 'Limestone cliffs and hidden lagoons',
  bestMonths: 'Dec – May',
  terrain: { global: 'TERRAIN_EL_NIDO', vScale: 2.2, seaLevel: 0, palette: {...} },
  landmarks: [ { kind: 'bangka', at: [x, z], count: 6 }, ... ],   // procedural low-poly builders in engine
  sections: [ { eyebrow, title, body, stats: [[value, label]...], plates: [imgId...], cam: [[pos],[look]] }, ... ],
  trip: { getThere, season, budget, mustEat },
  quiz: { q, options: [...], answer: 1, explain },
  credits: [ { plate, title, author, license, url }, ... ],
});
```

The destination view renders the hero, the sections, the trip card, the quiz and the credits from this object. The current Dabaw markup and CSS become the template.

### Real terrain

- **Source:** AWS Open Data "Terrain Tiles" in Terrarium encoding (`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`). Elevation = `R*256 + G + B/256 − 32768`. It is public, has no API key, and includes bathymetry, so coastlines come out right. The underwater detail is coarse, which is why reefs are touch-ups (see below). Credit in the footer per their attribution list (SRTM, ETOPO1, etc.).
- **Bake (one-time, `tools/bake_terrain.py`):** for each destination, take a bounding box in lat/lon (listed in the script). Fetch zoom ~11–12 tiles, stitch and crop, then resample to a **192×192** grid of metres. Write `assets/terrain/<id>.js`. Commit the outputs, because the site never fetches tiles at runtime.
- **Runtime:** the engine builds the `PlaneGeometry` from the grid. It applies `vScale` and keeps flat shading. Vertex colours come from height and slope (beach → lowland green → forest → bare rock), with a per-destination palette. Water is the existing animated plane at `seaLevel`.
- **Touch-ups on top of real data (decided by the user).** The real elevation sets the land's shape and coastline. Where the data is too coarse to show a signature feature, a per-destination `terrain.touchups` list adds it procedurally on top of the grid. The engine provides a small set of modifiers:
  - `cones`: Bohol's Chocolate Hills, placed over their real area around Carmen;
  - `karst`: steep limestone spires/cliffs for El Nido's islands;
  - `reefShelf`: a shallow flat ring at a set depth around a coastline (Siargao, Boracay, Samal);
  - `lagoon`: a carved, enclosed shallow basin (El Nido);
  - `terraces`: elevation quantised into steps on chosen slopes (Banaue).
  Touch-ups only add features that really exist at that spot, and they never move coastlines.
- **First build step is a test bake** of Bohol, El Nido and Siargao, to confirm the box sizes, grid size and touch-ups look right before the other seven are done. The grid can grow above 192² for a destination that needs it, as long as the size budget holds.
- **Dabaw switches to real Mt Apo + Davao Gulf + Samal terrain.** Its camera keyframes, eagle circle and city-light points are re-placed for the new geometry.

### Map screen

- **Province outlines:** geoBoundaries `PHL ADM2` = provinces (source NAMRIA/PSA/OCHA, licence CC BY 3.0 IGO — credit it). It is simplified offline, using the same tool, to a single inline SVG of ≤ ~150 KB.
- **Styling:** non-destination provinces are a dim silhouette. The 10 destination provinces are coloured and glow on hover/focus. Each destination also gets a pin/label so the small ones (Boracay, Batanes, Siargao) are tappable. Minimum tap target is 44 px.
- **Interaction:** the first tap or hover shows a preview card (name, hook, best months, a small photo, and a stamp if collected). An "Explore" button, or a second tap, navigates to `#/<id>`. Keyboard: each destination is a focusable button in a logical north → south order.
- **Passport:** a meter shows `N / 10`. Stamps are stored in `localStorage` (wrapped in try/catch, and the page works without it). Collecting all 10 shows a one-time "You've seen the Philippines" overlay, which can be replayed from the meter.

### Moving between screens

- Map → destination: the map zooms toward the chosen province (CSS transform), the loader shows, and the 3D scene for that destination is built. Destination → map: the scene is disposed (geometries, materials, textures) to avoid GPU leaks.
- One `WebGLRenderer` is reused for the whole session.

### Content

- **Pages:** each page has a hero plus 3–4 sections, then the trip card, quiz and credits. The voice and length match the current Dabaw copy. Dabaw's existing text stays as it is, and it gains a trip card and a quiz like the others.
- **Photos:** 2–5 per destination from Wikimedia Commons with free licences, resized to 1600 px wide WebP in `assets/img/<id>/`. Credits use the same format as the current footer.
- **Facts:** facts must be checkable and be written as stable facts, not "as of" numbers that go stale.

### Kept from today

The visual identity stays the same: tokens, Onest font, grain, nav, section rail, reveal animations and the dusk-to-night palette blend. So do the reduced-motion handling, the WebGL-unavailable fallback (`no-gl`), and the mouse parallax.

## Left to the builder

- Exact bounding boxes, `vScale`, palettes and camera keyframes per destination. Tune these visually.
- Which procedural landmark builders to write. Each destination needs at least one, and they should be shared where possible (boats, houses and palms reuse).
- The map projection and SVG simplification tolerance.
- The quiz question wording and the copy, within the content rules above.
- Whether the baking tool uses Pillow or the stdlib (`zlib`) for PNG decode. Either way, there are no new runtime dependencies for the site.

## Risks

- **Small islands at 192² over a large box lose detail.** Boxes should be tight. Boracay especially needs a small box around the island.
- **File size:** 10 terrains at about 75 KB of base64 each, plus about 40 photos, total roughly 6–8 MB. This is acceptable for a showcase, and the photos lazy-load.
- **Licences:** this is CC BY-SA content in a design concept, the same as today. Credits must be complete.
