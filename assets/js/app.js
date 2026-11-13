/* App shell: destination registry, hash router, view switching. */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const $ = s => document.querySelector(s);
  const list = [];
  // Self-test runs read failures from the DOM (headless browsers have no console to watch).
  if (/[?&]selftest=/.test(location.search)) {
    const report = msg => { const p = document.createElement('pre'); p.className = 'selftest-error'; p.textContent = 'ERROR ' + msg; document.documentElement.appendChild(p); };
    addEventListener('error', e => report(`${e.message} @ ${e.filename}:${e.lineno}`));
    addEventListener('unhandledrejection', e => report(String(e.reason && e.reason.stack || e.reason)));
  }
  PH.register = desc => { list.push(desc); };
  PH.get = id => list.find(d => d.id === id);
  PH.ids = () => list.map(d => d.id);

  function grain() {
    const c = document.createElement('canvas'); c.width = c.height = 180;
    const x = c.getContext('2d'), d = x.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
  }

  function boot() {
    grain();
    let storage = null;
    try { storage = window.localStorage; } catch (e) { /* blocked: Passport falls back to memory */ }
    const passport = PH_CORE.Passport(storage);
    PH.passport = passport;

    const forceNoGL = /[?&]selftest=nogl\b/.test(location.search);
    const engine = forceNoGL ? null : PH.Engine.create($('#gl'));
    if (!engine) document.documentElement.classList.add('no-gl');
    PH.engine = engine;

    const loader = $('#loader'), viewMap = $('#view-map'), viewDest = $('#view-dest');
    let page = null, map = null, current = null, token = 0;

    function showLoader(text) { $('#loader span').textContent = text; loader.classList.remove('done'); }
    function hideLoader() { loader.classList.add('done'); }

    function leaveDest() {
      if (page) { page.destroy(); page = null; }
      if (engine) engine.unload();
      current = null;
    }

    function route() {
      const r = PH_CORE.parseRoute(location.hash, PH.ids());
      const my = ++token;
      if (r.view === 'map') {
        if (!PH.renderMap) { location.replace('#/' + list[0].id); return; } // map arrives in a later step
        leaveDest();
        document.body.dataset.view = 'map';
        document.title = 'Pilipinas — pick your next trip';
        if (!map) map = PH.renderMap(viewMap, passport);
        scrollTo(0, 0);
        hideLoader();
        return;
      }
      if (current === r.id && page) { page.scrollToSection(r.section, true); return; }
      const desc = PH.get(r.id);
      if (map) { map.destroy(); map = null; }
      leaveDest();
      showLoader(desc.name);
      document.body.dataset.view = 'dest';
      document.title = `${desc.name} — Pilipinas`;
      current = r.id;
      page = PH.renderPage(desc, viewDest, {
        stamped: passport.has(desc.id),
        onCorrect: () => passport.add(desc.id),
        onScroll: p => engine && engine.setProgress(p),
      });
      page.scrollToSection(r.section, false);
      if (engine) {
        engine.setProgress(page.progress());
        engine.load(desc).then(ok => {
          if (!ok || my !== token) return;
          hideLoader();
          if (/[?&]selftest=/.test(location.search)) document.documentElement.dataset.state = JSON.stringify({ id: desc.id, scrollY, progress: page.progress(), info: engine.info() });
        }).catch(err => { console.error(err); hideLoader(); });
      } else hideLoader();
    }

    $('#burger').addEventListener('click', () => {
      const open = !document.documentElement.classList.contains('nav-open');
      document.documentElement.classList.toggle('nav-open', open);
      $('#burger').setAttribute('aria-expanded', String(open));
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') document.documentElement.classList.remove('nav-open'); });
    addEventListener('hashchange', route);
    route();
    PH.route = route;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
