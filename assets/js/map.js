/* Map home screen: PH.renderMap(el, passport) -> { destroy() }.
   Mouse: hover previews, click enters. Touch: first tap previews, second tap (or "Explore") enters. */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const esc = s => PH.esc(s);
  const DONE_KEY = 'ph.passport.v1.done';
  const safeGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* memory only */ } };

  function renderMap(el, passport) {
    const P = window.PH_MAP_PROJ, dests = PH.ids().map(PH.get);
    const [, , vw, vh] = (/viewBox="([^"]+)"/.exec(window.PH_MAP_SVG)[1]).split(' ').map(Number);
    const pos = d => ({ x: (d.mapPin[1] - P.lon0) * P.kx / vw * 100, y: (P.lat1 - d.mapPin[0]) * P.ky / vh * 100 });
    const total = dests.length;

    el.innerHTML = `
<main class="map-view page">
  <section class="map-panel">
    <p class="eyebrow">Pilipinas · ${total} destinations</p>
    <h1>Pick your next trip.</h1>
    <p class="body">Seven thousand islands, ${total} unforgettable places. Tap a glowing spot to preview it, then fly in for a 3D tour built from real elevation data.</p>
    <button class="passport" type="button" aria-describedby="passport-help">
      <span class="tiny">Passport</span>
      <span class="passport-count"><b>${passport.size()}</b> / ${total} stamps</span>
      <span class="passport-dots" aria-hidden="true">${dests.map(d => `<i class="${passport.has(d.id) ? 'on' : ''}" title="${esc(d.name)}"></i>`).join('')}</span>
    </button>
    <p id="passport-help" class="tiny passport-help">Answer each place's passport question to collect its stamp.</p>
    <ol class="dest-list">${dests.map((d, i) => `<li><a href="#/${d.id}" data-id="${d.id}"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(d.name)}<small>${esc(d.province)}</small></span>${passport.has(d.id) ? '<em aria-label="stamped">✓</em>' : ''}</a></li>`).join('')}</ol>
  </section>
  <section class="map-stage" aria-label="Map of the Philippines">
    <div class="map-frame" style="aspect-ratio:${vw} / ${vh}">
      ${window.PH_MAP_SVG}
      ${dests.map(d => { const p = pos(d); return `<button class="pin${passport.has(d.id) ? ' stamped' : ''}${d.mapLabel ? ' label-' + d.mapLabel : ''}" type="button" data-id="${d.id}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%" aria-label="${esc(d.name)}, ${esc(d.province)}${passport.has(d.id) ? ' (stamped)' : ''}"><i></i><span>${esc(d.name)}</span></button>`; }).join('')}
    </div>
    <article class="map-card" hidden aria-live="polite"></article>
  </section>
  <p class="map-credits tiny">Province outlines: <a href="https://www.geoboundaries.org/">geoBoundaries</a> (NAMRIA, PSA, OCHA) · CC BY 3.0 IGO. Elevation: <a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> on AWS Open Data. Photo credits on each destination page. A design concept, not an official tourism site.</p>
</main>
<div class="overlay" hidden role="dialog" aria-modal="true" aria-labelledby="ov-h">
  <div class="overlay-box">
    <p class="eyebrow">Passport complete</p>
    <h2 id="ov-h">You've seen the Philippines.</h2>
    <p class="body">All ${total} stamps — from the hills of the north to the gulf of the south. Mabuhay, and safe travels.</p>
    <div class="stamp-wall">${dests.map(d => `<span>${esc(d.name)}</span>`).join('')}</div>
    <button class="btn" type="button" data-close>Keep exploring</button>
  </div>
</div>`;

    // Header for the map view
    const nav = document.getElementById('nav');
    nav.querySelector('.brand b').textContent = 'PILIPINAS';
    nav.querySelector('.brand small').textContent = 'Pick your next trip';
    nav.classList.remove('hide', 'stuck');
    document.getElementById('navlinks').innerHTML = '';
    document.getElementById('rail').innerHTML = '';

    const card = el.querySelector('.map-card'), off = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); off.push(() => t.removeEventListener(ev, fn, o)); };
    let selected = null;

    function select(id) {
      selected = id;
      const d = PH.get(id);
      el.querySelectorAll('.pin').forEach(p => p.classList.toggle('on', p.dataset.id === id));
      el.querySelectorAll('[data-province]').forEach(p => p.classList.toggle('on', p.dataset.province === d.province));
      el.querySelectorAll('.dest-list a').forEach(a => a.classList.toggle('on', a.dataset.id === id));
      const stamped = passport.has(id);
      card.innerHTML = `
        <img src="assets/img/${d.id}/${d.hero.plate.src}" alt="${esc(d.hero.plate.alt)}" width="${d.hero.plate.w || 1600}" height="${d.hero.plate.h || 1067}">
        <div class="map-card-body">
          <p class="tiny">${esc(d.region)}</p>
          <h2>${esc(d.name)}</h2>
          <p class="hook">${esc(d.hook)}</p>
          <p class="best"><span class="tiny">Best months</span> ${esc(d.bestMonths)}</p>
          <div class="map-card-foot">
            <a class="btn" href="#/${d.id}">Explore ${esc(d.name)} →</a>
            <span class="stamp-state${stamped ? ' on' : ''}">${stamped ? '✓ Stamped' : 'Not stamped yet'}</span>
          </div>
        </div>`;
      card.hidden = false;
    }

    el.querySelectorAll('.pin').forEach(pin => {
      const id = pin.dataset.id;
      on(pin, 'pointerenter', e => { if (e.pointerType === 'mouse') select(id); });
      on(pin, 'focus', () => { if (pin.matches(':focus-visible')) select(id); }); // keyboard only: a tap also focuses, and must stay a first tap
      on(pin, 'click', () => { if (selected === id) location.hash = `#/${id}`; else select(id); });
    });
    // Tapping a destination's province works like tapping its pin.
    el.querySelectorAll('[data-province]').forEach(path => {
      const d = dests.find(x => x.province === path.dataset.province);
      if (!d) return;
      path.classList.add('is-dest');
      on(path, 'click', () => { if (selected === d.id) location.hash = `#/${d.id}`; else select(d.id); });
      on(path, 'pointerenter', e => { if (e.pointerType === 'mouse') select(d.id); });
    });

    // Passport overlay: shown once when the last stamp lands; the meter replays it afterwards.
    const overlay = el.querySelector('.overlay');
    const openOverlay = () => { overlay.hidden = false; overlay.querySelector('[data-close]').focus(); };
    const closeOverlay = () => { overlay.hidden = true; el.querySelector('.passport').focus(); };
    on(overlay.querySelector('[data-close]'), 'click', closeOverlay);
    on(overlay, 'click', e => { if (e.target === overlay) closeOverlay(); });
    on(window, 'keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeOverlay(); });
    on(el.querySelector('.passport'), 'click', () => { if (passport.size() >= total) openOverlay(); else el.querySelector('.pin:not(.stamped)')?.focus(); });
    if (passport.size() >= total && !safeGet(DONE_KEY)) { safeSet(DONE_KEY, '1'); openOverlay(); }

    return { destroy() { off.splice(0).forEach(f => f()); el.innerHTML = ''; } };
  }

  PH.renderMap = renderMap;
})();
