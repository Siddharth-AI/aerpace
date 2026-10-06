// Configurations (index + cursor preview), technology (sticky drawing board), safety (exploded layers),
// aerDock (the "a" opens into the film), India network (auto-cycling phases), ecosystem marquee.
import { gsap, ScrollTrigger, reduced, fine, trackTrigger, isDesktop, scrollToY } from '../core/scroll.js';
import { ROUTES, ICAO } from '../../data/site.js';

/* ---------------------------------------------------------------- SAFETY */
export function initSafety() {
  const sec = document.querySelector('[data-sf]');
  if (!sec) return;
  const track = sec.querySelector('.sf__track');
  const stack = sec.querySelector('[data-sf-stack]');
  const plates = [...sec.querySelectorAll('.sl__plate')];
  const items = [...sec.querySelectorAll('.sl__item')];
  const top = sec.querySelector('.sf__top');
  const title = sec.querySelectorAll('.sf__head .hl > span');
  const S = { gap: 4, rot: -34 };
  const apply = () => {
    plates.forEach((p, i) => { p.style.transform = `translateZ(${-(i + 1) * S.gap}px)`; });
    top.style.transform = `translateZ(${S.gap * .6}px)`;
    stack.style.transform = `rotateX(58deg) rotateZ(${S.rot}deg)`;
  };
  const set = (k) => { plates.forEach((p, i) => p.classList.toggle('is-on', i === k)); items.forEach((it, i) => it.classList.toggle('is-on', i === k)); };
  set(0); apply();
  if (reduced) { S.gap = 46; apply(); return; }
  gsap.from(title, { yPercent: 115, duration: 1.3, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 60%', once: true } });
  let k0 = 0;
  const gapMax = () => Math.min(64, window.innerHeight * .07);
  trackTrigger(track, {
    scrub: .8,
    onUpdate: (s) => {
      const p = s.progress;
      S.gap = 4 + gapMax() * gsap.parseEase('power2.out')(Math.min(1, p / .22));
      S.rot = -34 + 14 * p;
      apply();
      const k = Math.min(plates.length - 1, Math.max(0, Math.floor((p - .14) / .82 * plates.length)));
      if (k !== k0) { k0 = k; set(k); }
    },
  });
}

/* ---------------------------------------------------------------- AERDOCK: the "a" opens into the film */
export function initDock() {
  const sec = document.querySelector('[data-dk]');
  if (!sec) return;
  const track = sec.querySelector('.dk__track');
  const svg = sec.querySelector('[data-dk-svg]');
  const rect = sec.querySelector('[data-dk-rect]');
  const veil = sec.querySelector('[data-dk-veil]');
  const aG = sec.querySelector('[data-dk-a]');
  const vid = sec.querySelector('.dk__video');
  const end = sec.querySelector('.dk__end');
  const title = sec.querySelectorAll('.dk__title .hl > span');
  const O = [807, 548]; // origin inside the left stem of the letter, so the counter slides away as it grows
  const S = { s: .0, w: 1, h: 1 };
  const size = () => {
    S.w = svg.clientWidth; S.h = svg.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${S.w} ${S.h}`);
    [rect, veil].forEach((r) => { r.setAttribute('width', S.w); r.setAttribute('height', S.h); });
    draw();
  };
  const draw = () => {
    const base = Math.min((S.h * .26) / 426, (S.w * .5) / 485); // the letter starts about a quarter of the screen tall
    const k = base * S.s;
    // the letter is centred at its starting size and grows about a point in its left stem
    const ax = S.w / 2 + (O[0] - 982) * base; const ay = S.h * .56 + (O[1] - 548) * base;
    aG.setAttribute('transform', `translate(${ax} ${ay}) scale(${k}) translate(${-O[0]} ${-O[1]})`);
  };
  size();
  window.addEventListener('resize', size);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !reduced) { vid.muted = true; vid.play().catch(() => {}); } else vid.pause(); }, { rootMargin: '0px' });
  io.observe(sec.querySelector('.dk__stage'));
  if (reduced) { S.s = 60; draw(); gsap.set(end, { opacity: 1 }); return; }
  gsap.from(title, { yPercent: 115, duration: 1.3, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 55%', once: true } });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.fromTo(S, { s: 0 }, { s: 1, duration: .16, ease: 'expo.out', onUpdate: draw }, 0)
    .to(S, { s: 70, duration: .62, ease: 'power3.in', onUpdate: draw }, .2)
    .to(vid, { scale: 1, duration: .8 }, .1)
    .to(veil, { opacity: 0, duration: .04 }, .8)
    .fromTo(end, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .12, ease: 'power2.out' }, .84);
  trackTrigger(track, { scrub: .7, animation: tl });
}

/* ---------------------------------------------------------------- NETWORK */
const hav = (a, b) => {
  const R = 6371; const r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r; const dLon = (b[1] - a[1]) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
export function initNetwork() {
  const sec = document.querySelector('[data-nw]');
  if (!sec) return;
  const svg = sec.querySelector('[data-nw-svg]');
  const tip = sec.querySelector('[data-nw-tip]');
  const map = sec.querySelector('[data-nw-map]');
  const btns = [...sec.querySelectorAll('[data-phase]')];
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent = svg) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; };
  const VW = 888; const VH = 1000;
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  let geo = null; const groups = {}; let phase = -1; let timer = null; let bar = null;

  const P = (n) => [geo.cities[n][0] * VW, geo.cities[n][1] * VH];
  const curve = (a, b, k) => { const A = P(a); const B = P(b); const mx = (A[0] + B[0]) / 2; const my = (A[1] + B[1]) / 2; const dx = B[0] - A[0]; const dy = B[1] - A[1]; return `M${A[0].toFixed(1)} ${A[1].toFixed(1)}Q${(mx - dy * k).toFixed(1)} ${(my + dx * k).toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`; };

  const build = () => {
    const land = el('g');
    geo.outline.forEach((poly) => { if (poly.length < 3) return; el('path', { class: 'nw__land', d: `M${poly.map(([x, y]) => `${(x * VW).toFixed(1)} ${(y * VH).toFixed(1)}`).join('L')}Z` }, land); });
    const dots = el('g');
    geo.dots.forEach(([x, y], i) => { if (i % 2) return; el('circle', { class: 'nw__dot', cx: (x * VW).toFixed(1), cy: (y * VH).toFixed(1), r: 1.3 }, dots); });
    groups.hops = el('g'); groups.spokes = el('g'); groups.city = el('g'); groups.care = el('g'); groups.cargo = el('g'); groups.pkts = el('g'); groups.cities = el('g');
    ROUTES.metros.forEach((m) => {
      const [x, y] = P(m);
      el('circle', { class: 'nw__hop', cx: x, cy: y, r: 13, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, groups.hops);
      for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + x; el('path', { class: 'nw__route nw__route--city', d: `M${x} ${y}L${(x + Math.cos(a) * 28).toFixed(1)} ${(y + Math.sin(a) * 28).toFixed(1)}`, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, groups.spokes); }
    });
    const route = (g, list, cls, k) => list.map(([a, b]) => el('path', { class: `nw__route nw__route--${cls}`, d: curve(a, b, k) }, g));
    groups.cityR = route(groups.city, ROUTES.intercity, 'city', .18);
    groups.careR = route(groups.care, ROUTES.care, 'care', -.22);
    groups.cargoR = route(groups.cargo, ROUTES.cargo, 'cargo', .3);
    Object.keys(geo.cities).forEach((n) => {
      const [x, y] = P(n); const metro = ROUTES.metros.includes(n);
      const g = el('g', { class: `nw__city${metro ? ' is-metro' : ''}`, 'data-n': n }, groups.cities);
      el('circle', { cx: x, cy: y, r: metro ? 4.5 : 3 }, g);
      const t = el('text', { x: x + 7, y: y - 6 }, g); t.textContent = ICAO[n] || n.slice(0, 4).toUpperCase();
    });
    // moving packets on intercity routes
    groups.cityR.forEach((p, i) => { const c = el('circle', { class: 'nw__pkt', r: 2.4, opacity: 0 }, groups.pkts); c._p = p; c._o = (i * .137) % 1; });
  };

  const showRoutes = (paths, on, dur = 1.4) => paths.forEach((p, i) => {
    const L = p.getTotalLength();
    if (!p._len) { p._len = L; }
    if (p.classList.contains('nw__route--city')) { p.style.strokeDasharray = `${L} ${L}`; }
    gsap.to(p, { strokeDashoffset: on ? 0 : L, opacity: on ? 1 : 0, duration: reduced ? 0 : dur, delay: on ? i * .05 : 0, ease: 'power2.inOut', overwrite: true,
      onStart: () => { if (!p.classList.contains('nw__route--city')) p.style.strokeDasharray = ''; } });
  });
  const prime = () => {
    [...groups.cityR, ...groups.careR, ...groups.cargoR].forEach((p) => { const L = p.getTotalLength(); if (p.classList.contains('nw__route--city')) { p.style.strokeDasharray = `${L} ${L}`; gsap.set(p, { strokeDashoffset: L, opacity: 0 }); } else gsap.set(p, { opacity: 0 }); });
  };

  const setPhase = (k, auto = false) => {
    if (!geo || k === phase) return;
    phase = k;
    btns.forEach((b, i) => { b.classList.toggle('is-on', i === k); b.setAttribute('aria-pressed', String(i === k)); gsap.set(b.querySelector('.ph__bar b'), { scaleX: i < k ? 1 : 0 }); });
    gsap.to(groups.hops.children, { strokeDashoffset: 0, duration: reduced ? 0 : 1, stagger: .06, ease: 'power2.out' });
    gsap.to(groups.spokes.children, { strokeDashoffset: k >= 1 ? 0 : 1, duration: reduced ? 0 : .9, stagger: .01, ease: 'power2.out' });
    showRoutes(groups.cityR, k >= 2);
    showRoutes(groups.careR, k >= 3); showRoutes(groups.cargoR, k >= 3);
    bar?.kill();
    if (!reduced) bar = gsap.fromTo(btns[k].querySelector('.ph__bar b'), { scaleX: 0 }, { scaleX: 1, duration: auto === 'manual' ? 9 : 4.6, ease: 'none', onComplete: () => { if (inView) setPhase((k + 1) % btns.length, true); } });
  };
  btns.forEach((b, i) => b.addEventListener('click', () => { phase = -1; setPhase(i, 'manual'); }));

  let inView = false;
  ScrollTrigger.create({ trigger: map, start: 'top 75%', end: 'bottom 15%', onToggle: (s) => { inView = s.isActive; if (inView && phase < 0) setPhase(0, true); else if (inView && bar && !bar.isActive()) setPhase((phase + 1) % btns.length, true); } });

  // packets
  gsap.ticker.add((t) => {
    if (!geo || !inView || reduced) return;
    groups.pkts.childNodes.forEach((c) => {
      const p = c._p; const on = phase >= 2;
      c.setAttribute('opacity', on ? 1 : 0);
      if (!on) return;
      const u = ((t * .16 + c._o) % 1); const pt = p.getPointAtLength(u * p._len || u * p.getTotalLength());
      c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1));
    });
  });

  // hover: city card
  map.addEventListener('pointermove', (e) => {
    const g = e.target.closest?.('.nw__city');
    svg.querySelectorAll('.nw__city.is-hot').forEach((x) => x.classList.remove('is-hot'));
    if (!g) { tip.hidden = true; return; }
    g.classList.add('is-hot');
    const n = g.dataset.n; const c = geo.cities[n];
    const pairs = [...ROUTES.intercity, ...ROUTES.care, ...ROUTES.cargo].filter((p) => p.includes(n)).map((p) => { const o = p[0] === n ? p[1] : p[0]; return `${ICAO[o]} ${Math.round(hav([c[2], c[3]], [geo.cities[o][2], geo.cities[o][3]]))} km`; });
    tip.innerHTML = `<b>${ICAO[n]}</b> · ${n} · ${c[2].toFixed(2)}°N ${c[3].toFixed(2)}°E${pairs.length && phase >= 2 ? `<br>Direct: ${[...new Set(pairs)].slice(0, 3).join(' · ')}` : ''}`;
    const r = map.getBoundingClientRect();
    tip.style.left = `${e.clientX - r.left}px`; tip.style.top = `${e.clientY - r.top}px`; tip.hidden = false;
  });
  map.addEventListener('pointerleave', () => { tip.hidden = true; });

  fetch('media/geo/india.json').then((r) => r.json()).then((g) => { geo = g; build(); prime(); if (inView) setPhase(0, true); }).catch(() => {});
}

export function initTurntable() {
  const sec = document.querySelector('[data-tt]');
  if (!sec) return;
  const track = sec.querySelector('.tt__track');
  const imgs = [...sec.querySelectorAll('.tt__img')];
  const specs = [...sec.querySelectorAll('.tt__spec')];
  const tabs = [...sec.querySelectorAll('[data-tt-tab]')];
  const ticks = sec.querySelector('[data-tt-ticks]');
  const title = sec.querySelectorAll('.tt__title .hl > span');
  const n = imgs.length;
  let k0 = 0;
  const set = (k) => {
    if (k === k0) return;
    k0 = k;
    specs.forEach((s, i) => s.classList.toggle('is-on', i === k));
    tabs.forEach((t, i) => { t.classList.toggle('is-on', i === k); t.setAttribute('aria-pressed', String(i === k)); });
  };
  const render = (f) => {
    imgs.forEach((img, i) => {
      const d = i - f;
      const o = Math.max(0, 1 - Math.abs(d) * 2.4);
      gsap.set(img, { opacity: o, x: `${d * -14}%`, scale: .9 + o * .1, rotationY: d * -18 });
    });
    if (ticks) gsap.set(ticks, { rotation: f * -72 });
    set(Math.round(f));
  };
  render(0);
  if (reduced) {
    tabs.forEach((t, i) => t.addEventListener('click', () => render(i)));
    return;
  }
  const enter = { trigger: sec, start: 'top 55%', once: true };
  gsap.from(title, { opacity: 0, x: -30, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: enter });
  gsap.from(sec.querySelector('.tt__plane > svg'), { scale: .7, opacity: 0, rotation: -40, duration: 1.6, ease: 'expo.out', scrollTrigger: enter });
  gsap.from(sec.querySelector('[data-tt-views]'), { y: 70, opacity: 0, scale: .92, duration: 1.5, ease: 'expo.out', delay: .1, scrollTrigger: enter });
  const st = trackTrigger(track, { scrub: .5, onUpdate: (s) => render(gsap.parseEase('power1.inOut')(s.progress) * (n - 1)) });
  const inv = (p) => { let lo = 0; let hi = 1; for (let j = 0; j < 24; j++) { const m = (lo + hi) / 2; if (gsap.parseEase('power1.inOut')(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  tabs.forEach((t, i) => t.addEventListener('click', () => scrollToY(st.start + (st.end - st.start) * inv(i / (n - 1)) + 2, 1)));
}

export function initPower() {
  const sec = document.querySelector('[data-pw]');
  if (!sec) return;
  const charge = sec.querySelector('[data-pw-charge]');
  const dot = sec.querySelector('[data-pw-dot]');
  const nodes = [...sec.querySelectorAll('.pw-node')];
  const items = [...sec.querySelectorAll('[data-pw-i]')];
  const core = sec.querySelector('[data-pw-core]');
  const names = items.map((b) => b.querySelector('.pw__name').textContent);
  const S = { a: 0 };
  let k0 = -1;
  const place = () => {
    const a = -Math.PI / 2 + S.a * Math.PI * 2;
    gsap.set(dot, { attr: { transform: `translate(${(300 + Math.cos(a) * 230).toFixed(1)} ${(300 + Math.sin(a) * 230).toFixed(1)})` } });
    gsap.set(charge, { strokeDashoffset: 1 - S.a });
    const k = Math.round(S.a * 4) % 4;
    if (k !== k0) {
      k0 = k;
      nodes.forEach((nd, i) => nd.classList.toggle('is-on', i === k));
      items.forEach((b, i) => { b.classList.toggle('is-on', i === k); b.setAttribute('aria-pressed', String(i === k)); });
      core.textContent = names[k];
    }
  };
  place();
  if (reduced) {
    items.forEach((b, i) => b.addEventListener('click', () => { S.a = i / 4; place(); }));
    return;
  }
  const enter = { trigger: sec, start: 'top 70%', once: true };
  gsap.fromTo(sec.querySelector('.pw__title'), { clipPath: 'inset(0% 100% 0% 0%)', x: -24 }, { clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 1.3, ease: 'expo.inOut', scrollTrigger: enter });
  gsap.from(sec.querySelector('.pw__loop'), { scale: .86, opacity: 0, rotation: -30, duration: 1.6, ease: 'expo.out', scrollTrigger: enter });
  let manual = false;
  const st = ScrollTrigger.create({ trigger: sec, start: 'top 65%', end: 'bottom 55%', scrub: .6,
    onUpdate: (s) => { if (manual) return; S.a = s.progress * .999; place(); } });
  items.forEach((b, i) => b.addEventListener('click', () => {
    manual = true;
    gsap.to(S, { a: i / 4, duration: .9, ease: 'power3.inOut', onUpdate: place, onComplete: () => { manual = false; } });
  }));
  return st;
}

export function initConfigs() {
  const sec = document.querySelector('[data-cf]');
  if (!sec) return;
  const tabs = [...sec.querySelectorAll('[data-cf-i]')];
  const panels = [...sec.querySelectorAll('[data-cf-p]')];
  let cur = 0;
  const play = (p, on) => { const v = p.querySelector('video'); if (!v) return; if (on && !reduced) { v.muted = true; v.play().catch(() => {}); } else v.pause(); };
  const show = (i, focus = false) => {
    if (i === cur) return;
    const prev = panels[cur]; const next = panels[i];
    tabs.forEach((t, k) => { const on = k === i; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) tabs[i].focus();
    next.hidden = false; next.classList.add('is-on');
    play(next, true);
    if (reduced) { prev.hidden = true; prev.classList.remove('is-on'); play(prev, false); cur = i; return; }
    gsap.set(next, { zIndex: 2 }); gsap.set(prev, { zIndex: 1 });
    gsap.fromTo(next, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'expo.inOut',
      onComplete: () => { prev.hidden = true; prev.classList.remove('is-on'); play(prev, false); } });
    gsap.fromTo(next.querySelector('.cf__media'), { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
    gsap.fromTo(next.querySelectorAll('.cf__cap > *'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'expo.out', delay: .25 });
    cur = i;
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    if (fine) t.addEventListener('pointerenter', () => show(i));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault(); show((cur + d + tabs.length) % tabs.length, true);
    });
  });
  const io = new IntersectionObserver(([e]) => play(panels[cur], e.isIntersecting));
  io.observe(sec.querySelector('.cf__screen'));
  if (!reduced) {
    gsap.fromTo(sec.querySelector('.cf__screen'), { clipPath: 'inset(10% 12% 10% 12% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: sec.querySelector('.cf__body'), start: 'top 82%', once: true } });
    gsap.from(tabs, { y: 30, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: sec.querySelector('.cf__body'), start: 'top 82%', once: true } });
  }
}

export function initCta() {
  const sec = document.querySelector('[data-cta]');
  if (!sec) return;
  const pad = sec.querySelector('.cta__pad');
  const acts = sec.querySelector('.cta__actions');
  let t = null;
  const live = (on, ms = 0) => { clearTimeout(t); sec.classList.toggle('is-live', on && !reduced); if (on && ms) t = setTimeout(() => sec.classList.remove('is-live'), ms); };
  ScrollTrigger.create({ trigger: pad, start: 'top 80%', once: true, onEnter: () => live(true, 7200) });
  acts.addEventListener('pointerenter', () => live(true));
  acts.addEventListener('pointerleave', () => live(false));
  acts.addEventListener('focusin', () => live(true));
  acts.addEventListener('focusout', () => live(false));
  if (!reduced) gsap.from(sec.querySelector('.cta__pad'), { scale: .8, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 75%', once: true } });
}

export { isDesktop };
