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

  function selftestReport(name, problems) {
    const p = document.createElement('pre'); p.id = 'selftest';
    p.textContent = problems.length ? `selftest:${name} FAIL ${problems.join('; ')}` : `selftest:${name} ok`;
    document.body.appendChild(p);
  }
  // Every map pin must be a comfortable tap target (>= 44x44 CSS px) and inside the viewport.
  function selftestMap() {
    requestAnimationFrame(() => {
      const bad = [];
      document.querySelectorAll('.pin').forEach(b => {
        const r = b.getBoundingClientRect();
        if (r.width < 44 || r.height < 44) bad.push(`${b.dataset.id} ${r.width}x${r.height}`);
        if (r.left < 0 || r.right > innerWidth) bad.push(`${b.dataset.id} off-screen`);
      });
      if (document.documentElement.scrollWidth > innerWidth) bad.push(`horizontal scroll ${document.documentElement.scrollWidth}>${innerWidth}`);
      selftestReport('map', bad);
    });
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
      // Two quick hash changes can both read the newest hash; the second then only scrolls and must not bump the token.
      if (r.view === 'dest' && current === r.id && page) { page.scrollToSection(r.section, true); return; }
      const my = ++token;
      if (r.view === 'map') {
        if (!PH.renderMap) { location.replace('#/' + list[0].id); return; } // map arrives in a later step
        leaveDest();
        document.body.dataset.view = 'map';
        document.title = 'Pilipinas — pick your next trip';
        if (!map) map = PH.renderMap(viewMap, passport);
        if (/[?&]selftest=map(&|$)/.test(location.search)) selftestMap();
        scrollTo(0, 0);
        hideLoader();
        return;
      }
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
    const st = /[?&]selftest=(cycle|nogl)(&|$)/.exec(location.search);
    if (st) (st[1] === 'cycle' ? selftestCycle : selftestNoGL)().catch(e => selftestReport(st[1], [String(e && e.stack || e)]));
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitLoaded(ms = 15000) {
    const t0 = Date.now();
    while (!$('#loader').classList.contains('done')) { if (Date.now() - t0 > ms) throw new Error(`load timeout at ${location.hash}`); await sleep(100); }
  }
  const go = async hash => { location.hash = hash; await sleep(60); await waitLoaded(); };

  // Hop through every destination twice; GPU memory on the map must not grow between rounds,
  // and a rapid A -> B switch must end showing B (both page and 3D scene).
  async function selftestCycle() {
    const bad = [], ids = PH.ids(), info = () => JSON.stringify(PH.engine.info());
    await go('#/');
    const rounds = [];
    for (let r = 0; r < 2; r++) {
      for (const id of ids) await go(`#/${id}`);
      await go('#/'); await sleep(200);
      rounds.push(info());
    }
    if (rounds[0] !== rounds[1]) bad.push(`GPU memory grew: ${rounds[0]} -> ${rounds[1]}`);
    location.hash = `#/${ids[0]}`; await sleep(50);
    location.hash = `#/${ids[1]}`; await sleep(60); await waitLoaded(); await sleep(300);
    const shown = $('#view-dest .hero h1') && PH.get(ids[1]).hero.title === $('#view-dest .hero h1').textContent;
    if (!shown) bad.push('rapid switch: page is not the last route');
    if (!PH.engine.world || PH.engine.world.id !== ids[1]) bad.push(`rapid switch: scene is ${PH.engine.world && PH.engine.world.id}, expected ${ids[1]}`);
    selftestReport('cycle', bad);
  }

  // Without WebGL a destination still shows its story, trip card and quiz.
  async function selftestNoGL() {
    const bad = [];
    await go('#/bohol'); await sleep(200);
    if (!document.documentElement.classList.contains('no-gl')) bad.push('no no-gl class');
    if ($$('#view-dest .sec').length < 4) bad.push('sections missing');
    if (!$('#view-dest .trip') || !$('#view-dest .quiz')) bad.push('trip card or quiz missing');
    selftestReport('nogl', bad);
  }
  const $$ = s => [...document.querySelectorAll(s)];

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
