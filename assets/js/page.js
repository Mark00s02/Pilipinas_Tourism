/* Destination page: PH.renderPage(desc, el, opts) builds the DOM from a destination description.
   opts: { stamped:boolean, onCorrect() }  ->  { sections, progress(), scrollToSection(id|null), destroy() } */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const { clamp } = PH_CORE;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');

  const stats = list => `<div class="stats" data-rv="up">${(list || []).map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>`;

  function renderPage(desc, el, opts = {}) {
    const id = desc.id, img = p => `assets/img/${id}/${p.src}`, href = s => `#/${id}/${s}`;
    let plateNo = 0;
    const plate = p => `<figure class="plate" data-rv="up"><span class="frame"><img loading="lazy" src="${img(p)}" alt="${esc(p.alt)}" width="${p.w || 1600}" height="${p.h || 1067}"></span><figcaption>${esc(p.caption)} <em>Plate ${pad(++plateNo)}</em></figcaption></figure>`;
    const H = desc.hero, first = desc.sections[0];

    const hero = `
<section class="hero" id="hero" data-cam="0">
  <div class="hero-top">
    <p class="eyebrow" data-rv="up">${esc(H.eyebrow)}</p>
    <h1 data-rv="up">${esc(H.title)}</h1>
    <p class="hero-sub body" data-rv="up">${esc(H.sub)}</p>
  </div>
  <div class="wordmark${H.wordmark.length > 6 ? ' long' : ''}" aria-hidden="true">${[...H.wordmark].map(c => `<span>${esc(c)}</span>`).join('')}</div>
  <div class="hero-spacer"></div>
  <div class="hero-foot">
    <div>
      <div class="hero-cue" data-rv="fade"><span>Scroll to enter</span><span class="track"><i></i></span></div>
      <div class="hero-index" data-rv="up">${desc.sections.map((s, i) => `<a href="${href(s.id)}"><b>${pad(i + 1)}</b><span>${esc(s.indexLabel || s.nav)}</span></a>`).join('')}</div>
    </div>
    <a class="hero-plate" href="${href(first.id)}" data-rv="up">
      <span class="frame"><img src="${img(H.plate)}" alt="${esc(H.plate.alt)}" width="${H.plate.w || 1600}" height="${H.plate.h || 1067}"></span>
      <span class="tiny">${esc(H.plate.caption)}</span>
    </a>
  </div>
  <div class="hero-side" aria-hidden="true">${esc(H.side)}</div>
</section>`;

    const sections = desc.sections.map((s, i) => `
<section class="sec${i % 2 ? ' r' : ''}" id="${esc(s.id)}" data-cam="${i + 1}">
  <div class="copy">
    <span class="num" data-rv="up">${pad(i + 1)}</span>
    <p class="eyebrow" data-rv="up">${esc(s.eyebrow)}</p>
    <h2 data-rv="up">${esc(s.title)}</h2>
    <p class="body" data-rv="up">${esc(s.body)}</p>
    ${stats(s.stats)}
  </div>
  <div class="plates">${s.plates.map(plate).join('')}</div>
</section>`).join('');

    const F = desc.finale, T = desc.trip, Q = desc.quiz, finKey = desc.sections.length + 1;
    const finale = `
<section class="sec fin" id="${esc(F.id || 'plan')}" data-cam="${finKey}">
  <p class="eyebrow" data-rv="up">${esc(F.eyebrow)}</p>
  <h2 data-rv="up">${esc(F.title)}</h2>
  <p class="body" data-rv="up">${esc(F.body)}</p>
  ${stats(F.stats)}
  <div class="trip" data-rv="up" aria-labelledby="trip-h">
    <h3 id="trip-h" class="eyebrow">Plan your trip</h3>
    <dl>
      <div><dt>Getting there</dt><dd>${esc(T.getThere)}</dd></div>
      <div><dt>Best time to go</dt><dd>${esc(T.season)}</dd></div>
      <div><dt>Budget feel</dt><dd>${esc(T.budget)}</dd></div>
      <div><dt>Must eat</dt><dd>${esc(T.mustEat)}</dd></div>
    </dl>
  </div>
  <form class="quiz" data-rv="up" novalidate>
    <fieldset>
      <legend><span class="eyebrow">Passport question</span><span class="q">${esc(Q.q)}</span></legend>
      <div class="opts">${Q.options.map((o, i) => `<label><input type="radio" name="quiz" value="${i}"><span>${esc(o)}</span></label>`).join('')}</div>
    </fieldset>
    <div class="quiz-foot"><button class="btn" type="submit">Check answer</button><p class="quiz-msg" role="status" aria-live="polite">${opts.stamped ? 'Already stamped in your passport. Answer again for fun.' : 'Answer right to earn this stamp.'}</p></div>
  </form>
  <div class="fin-actions" data-rv="up">
    <a class="btn" href="#/">← Back to the map</a>
    <a class="btn ghost" href="#/${id}">Back to the top ↑</a>
  </div>
</section>`;

    const credits = `
<footer class="foot">
  <div>
    <p style="margin:0 0 8px;color:var(--bone-dim)">${esc(desc.name)} — part of Pilipinas, a 3D travel showcase.</p>
    <p style="margin:0">A design concept, not an official tourism site. 3D world built with Three.js from real elevation data; type set in Onest.</p>
  </div>
  <div>
    <p style="margin:0 0 12px" class="tiny">Photographs via Wikimedia Commons</p>
    <ol>${(desc.credits || []).map(c => `<li><b>${esc(c.plate)}</b> — <a href="${esc(c.url)}">${esc(c.title)}</a>, ${esc(c.author)} · ${c.licenseUrl ? `<a href="${esc(c.licenseUrl)}">${esc(c.license)}</a>` : esc(c.license)}</li>`).join('')}</ol>
    <p style="margin:12px 0 0">Images resized and converted to WebP.</p>
    <p style="margin:12px 0 0">Elevation — <a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> on AWS Open Data (SRTM, ETOPO1, GMTED and others). Signature features shaped by hand on top.</p>
    ${(desc.creditsExtra || []).map(x => `<p style="margin:12px 0 0">${x}</p>`).join('')}
  </div>
</footer>`;

    el.innerHTML = `<main class="page" id="top">${hero}${sections}${finale}</main>${credits}`;

    // Header: brand returns to the map, links jump to sections.
    const nav = $('#nav'), navlinks = $('#navlinks'), rail = $('#rail');
    $('.brand b', nav).textContent = desc.name.toUpperCase();
    $('.brand small', nav).textContent = desc.region;
    navlinks.innerHTML = `<a class="nav-link back" href="#/"><span>← Map</span><span class="alt">All places</span></a>` +
      desc.sections.map(s => `<a class="nav-link" href="${href(s.id)}"><span>${esc(s.nav)}</span><span class="alt">${esc(s.navAlt || '')}</span></a>`).join('');

    const SECS = $$('[data-cam]', el);
    const progress = () => {
      const y = scrollY + innerHeight * .5;
      let p = 0;
      for (let i = 0; i < SECS.length; i++) {
        const top = SECS[i].offsetTop, next = i + 1 < SECS.length ? SECS[i + 1].offsetTop : document.documentElement.scrollHeight;
        if (y >= top) p = i + clamp((y - top) / (next - top), 0, 1);
      }
      return clamp(p - .5, 0, SECS.length - 1); // keyframe i is centred on section i
    };

    const off = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); off.push(() => t.removeEventListener(ev, fn, o)); };
    const burger = $('#burger');
    const setMenu = open => { document.documentElement.classList.toggle('nav-open', open); burger.setAttribute('aria-expanded', String(open)); };
    const links = $$('.nav-link', navlinks).filter(l => !l.classList.contains('back'));
    $$('.nav-link', navlinks).forEach(l => on(l, 'click', () => setMenu(false)));

    rail.innerHTML = '';
    const dots = SECS.map((s, i) => {
      const b = document.createElement('button'); b.setAttribute('aria-label', `Go to section ${i}`);
      on(b, 'click', () => scrollTo({ top: s.offsetTop, behavior: REDUCE ? 'auto' : 'smooth' }));
      rail.appendChild(b); return b;
    });
    const linkSec = links.map(l => SECS.indexOf($('#' + l.getAttribute('href').split('/').pop(), el)));
    const wm = $('.wordmark', el);
    let last = 0, active = -1;
    const onScroll = () => {
      const y = scrollY;
      nav.classList.toggle('stuck', y > 40);
      nav.classList.toggle('hide', !document.documentElement.classList.contains('nav-open') && y > last + 4 && y > innerHeight * .8);
      if (y < last - 4) nav.classList.remove('hide');
      last = y;
      const a = Math.round(progress());
      if (a !== active) {
        active = a;
        dots.forEach((d, i) => d.classList.toggle('on', i === a));
        links.forEach((l, i) => l.classList.toggle('on', linkSec[i] === a));
      }
      if (!REDUCE) { const k = clamp(y / innerHeight, 0, 1); wm.style.transform = `translateY(${k * 120}px) scale(${1 + k * .08})`; wm.style.opacity = String(.92 * (1 - k * 1.2)); }
      if (opts.onScroll) opts.onScroll(progress());
    };
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll);

    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15 });
    $$('[data-rv], .plate', el).forEach(x => io.observe(x));
    off.push(() => io.disconnect());

    // Quiz: a right answer stamps the passport; a wrong one explains and invites another go.
    const form = $('.quiz', el), msg = $('.quiz-msg', form);
    on(form, 'submit', e => {
      e.preventDefault();
      const pick = form.querySelector('input:checked');
      form.classList.remove('ok', 'no');
      if (!pick) { msg.textContent = 'Pick an answer first.'; return; }
      if (Number(pick.value) === Q.answer) {
        form.classList.add('ok');
        const fresh = opts.onCorrect ? opts.onCorrect() : false;
        msg.textContent = `Correct! ${Q.explain || ''}${fresh ? ` ${desc.name} is now stamped in your passport.` : ''}`.trim();
      } else {
        form.classList.add('no');
        msg.textContent = `Not quite. ${Q.hint || ''} Try again.`.replace(/\s+/g, ' ');
      }
    });

    const scrollToSection = (sid, smoothly) => {
      const t = sid ? $('#' + CSS.escape(sid), el) : null;
      scrollTo({ top: t ? t.offsetTop : 0, behavior: smoothly && !REDUCE ? 'smooth' : 'auto' });
    };

    onScroll();
    return {
      sections: SECS, progress, scrollToSection,
      destroy() { off.splice(0).forEach(f => f()); setMenu(false); el.innerHTML = ''; rail.innerHTML = ''; },
    };
  }

  PH.renderPage = renderPage;
  PH.esc = esc;
})();
