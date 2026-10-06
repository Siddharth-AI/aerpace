// Nav pill, mega cards, mobile menu, Pune clock, cursor label, magnetic buttons, page transitions, autoplay media, next preview.
import { gsap, ScrollTrigger, fine, reduced, scrollStop, scrollStart, scrollToY } from './scroll.js';
import { MENU_GROUPS } from '../../data/site.js';

const PAGE_NAMES = { index: 'Home', ...Object.fromEntries(MENU_GROUPS.flatMap(([, l]) => l)) };
PAGE_NAMES.racers = 'aerpace Racers';

/* ---------------------------------------------------------------- nav */
export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (nav.classList.contains('is-open') || nav.classList.contains('mega-open')) { lastY = y; return; }
      if (y > 240 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 240) nav.classList.remove('is-hidden');
      lastY = y;
    },
  });
  // dark sections flip the nav to paper-on-ink
  document.querySelectorAll('main > section[data-theme], footer[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top top+=38', end: 'bottom top+=38',
      onToggle: (s) => { if (s.isActive) nav.classList.toggle('is-dark', sec.dataset.theme === 'night'); },
    });
  });

  // sliding highlight inside the pill
  const pill = nav.querySelector('[data-pill]');
  const hl = pill?.querySelector('.nav__hl');
  const links = pill ? [...pill.querySelectorAll('.nav__a')] : [];
  const hot = (a) => {
    links.forEach((l) => l.classList.toggle('is-hot', l === a));
    if (!a) { hl.style.opacity = '0'; return; }
    hl.style.opacity = '1';
    gsap.to(hl, { x: a.offsetLeft, width: a.offsetWidth, duration: hl._seen ? .45 : 0, ease: 'expo.out' });
    hl._seen = true;
  };
  links.forEach((a) => { a.addEventListener('mouseenter', () => hot(a)); a.addEventListener('focus', () => hot(a)); });
  pill?.addEventListener('mouseleave', () => { if (!openKey) { hot(null); hl._seen = false; } });

  // mega cards
  const btns = [...nav.querySelectorAll('[data-mega-btn]')];
  const panels = [...nav.querySelectorAll('[data-mega]')];
  let openKey = null; let closeT;
  const setMega = (k) => {
    clearTimeout(closeT);
    if (k === openKey) return;
    openKey = k;
    btns.forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.megaBtn === k)));
    panels.forEach((m) => m.classList.toggle('is-open', m.dataset.mega === k));
    nav.classList.toggle('mega-open', !!k);
    if (!k) { hot(null); hl && (hl._seen = false); return; }
    hot(btns.find((b) => b.dataset.megaBtn === k));
    if (!reduced) gsap.fromTo(nav.querySelectorAll(`[data-mega="${k}"] li, [data-mega="${k}"] .mg__feat, [data-mega="${k}"] .mg__all`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .03, ease: 'expo.out', delay: .08 });
  };
  btns.forEach((b) => {
    b.addEventListener('click', () => setMega(openKey === b.dataset.megaBtn ? null : b.dataset.megaBtn));
    b.addEventListener('mouseenter', () => { if (fine) setMega(b.dataset.megaBtn); });
  });
  links.filter((l) => !l.dataset.megaBtn).forEach((l) => l.addEventListener('mouseenter', () => { if (openKey) setMega(null); hot(l); }));
  nav.addEventListener('mouseleave', () => { if (openKey) closeT = setTimeout(() => setMega(null), 260); });
  nav.addEventListener('mouseenter', () => clearTimeout(closeT));
  nav.querySelectorAll('.nav__logo, .nav__end').forEach((l) => l.addEventListener('mouseenter', () => { if (openKey) setMega(null); }));
  // preview image follows the hovered vertical
  const prev = nav.querySelectorAll('.mg__prev img');
  nav.querySelectorAll('.mg__item').forEach((it) => {
    const on = () => prev.forEach((p) => p.classList.toggle('is-on', p.dataset.i === it.dataset.i));
    it.addEventListener('mouseenter', on); it.addEventListener('focus', on);
  });
  document.addEventListener('click', (e) => { if (openKey && !e.target.closest('[data-nav]')) setMega(null); });

  // full-screen menu (tablet / phone)
  const menu = document.querySelector('[data-menu]');
  const mb = nav.querySelector('[data-menu-btn]');
  menu?.setAttribute('data-lenis-prevent', '');
  const toggleMenu = (force) => {
    const on = force ?? !menu.classList.contains('is-open');
    if (on === menu.classList.contains('is-open')) return;
    menu.classList.toggle('is-open', on); nav.classList.toggle('is-open', on);
    mb.setAttribute('aria-expanded', String(on)); mb.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!on));
    if (on) {
      scrollStop(); nav.classList.remove('is-dark');
      if (!reduced) gsap.fromTo(menu.querySelectorAll('.mm__group .meta, .mm__group li, .mm__foot'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .02, duration: .9, ease: 'expo.out', delay: .3 });
    } else { scrollStart(); ScrollTrigger.refresh(); }
  };
  mb?.addEventListener('click', () => toggleMenu());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMega(null); if (menu?.classList.contains('is-open')) toggleMenu(false); } });
}

/* ---------------------------------------------------------------- clock (Asia/Kolkata) */
export function initClock() {
  const hm = document.querySelectorAll('[data-clock]');
  const hms = document.querySelectorAll('[data-clock-s]');
  if (!hm.length && !hms.length) return;
  const f1 = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  const f2 = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { const d = new Date(); const a = f1.format(d); const b = f2.format(d); hm.forEach((e) => { e.textContent = a; }); hms.forEach((e) => { e.textContent = b; }); };
  tick(); setInterval(tick, 1000);
}

/* ---------------------------------------------------------------- cursor label (only where it says something) */
export function initCursor() {
  const el = document.querySelector('[data-cursor-el]');
  if (!fine || !el) return;
  const label = el.querySelector('[data-cursor-label]');
  const xTo = gsap.quickTo(el, 'x', { duration: .35, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: .35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); el.style.opacity = '1'; }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    el.classList.toggle('is-on', !!lab);
    if (lab) label.textContent = lab.dataset.cursor;
  });
  document.documentElement.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
}

export function initMagnetic() {
  if (!fine || reduced) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: .8, ease: 'elastic.out(1, .45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: .8, ease: 'elastic.out(1, .45)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
      xTo((e.clientX - r.left - r.width / 2) * .18); yTo((e.clientY - r.top - r.height / 2) * .28);
    });
    el.addEventListener('pointerenter', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------------------------------------------------------- page transitions: a short flight to the next page */
const TR = 'aer-tr';
const nameFor = (url) => {
  const slug = (url.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  return PAGE_NAMES[slug] || slug;
};
export function initTransitions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.target === '_blank' || a.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    leave(url);
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.documentElement.classList.remove('is-entering');
      const c = document.querySelector('[data-curtain]');
      if (c) { c.classList.remove('is-on'); gsap.set(c, { clipPath: 'inset(100% 0% 0% 0%)' }); }
    }
  });
}

function leave(url) {
  const c = document.querySelector('[data-curtain]');
  const name = nameFor(url);
  if (!c || reduced) { location.href = url.href; return; }
  try { sessionStorage.setItem(TR, name); } catch { /* storage blocked */ }
  const plane = c.querySelector('.cur__plane'); const nm = c.querySelector('[data-cur-name]'); const lab = c.querySelector('[data-cur-label]');
  nm.textContent = name; lab.textContent = 'Now boarding';
  c.classList.add('is-on');
  gsap.timeline({ onComplete: () => { location.href = url.href; } })
    .set(c, { clipPath: 'inset(100% 0% 0% 0%)' })
    .set(plane, { x: -140 })
    .set([nm, lab], { yPercent: 60, opacity: 0 })
    .to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: .75, ease: 'expo.inOut' })
    .to(plane, { x: () => window.innerWidth / 2 - 60, duration: .7, ease: 'power3.out' }, .35)
    .to([lab, nm], { yPercent: 0, opacity: 1, duration: .6, stagger: .05, ease: 'expo.out' }, .45);
}

export function pageIn() {
  const c = document.querySelector('[data-curtain]');
  const root = document.documentElement;
  let name = null;
  try { name = sessionStorage.getItem(TR); sessionStorage.removeItem(TR); } catch { /* ignore */ }
  if (!root.classList.contains('is-entering') || !c) { root.classList.remove('is-entering'); return Promise.resolve(); }
  const plane = c.querySelector('.cur__plane'); const nm = c.querySelector('[data-cur-name]'); const lab = c.querySelector('[data-cur-label]');
  nm.textContent = name || ''; lab.textContent = 'Arrived';
  c.classList.add('is-on');
  gsap.set(c, { clipPath: 'inset(0% 0% 0% 0%)' });
  gsap.set(plane, { x: window.innerWidth / 2 - 60 });
  root.classList.remove('is-entering');
  return new Promise((res) => {
    gsap.timeline({ onComplete: () => { c.classList.remove('is-on'); res(); } })
      .to(plane, { x: window.innerWidth + 140, duration: .8, ease: 'power3.in' }, .05)
      .to([nm, lab], { yPercent: -60, opacity: 0, duration: .45, ease: 'power2.in', stagger: .03 }, .1)
      .to(c, { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, .42);
  });
}

/* ---------------------------------------------------------------- media */
export function initMedia() {
  const vids = document.querySelectorAll('video[data-autoplay]');
  if (reduced) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.muted = true; v.play?.().catch(() => {}); } else v.pause?.();
  }), { rootMargin: '10% 0px' });
  vids.forEach((v) => io.observe(v));
}

export function initNext() {
  document.querySelectorAll('.next').forEach((sec) => {
    const prev = sec.querySelector('.next__prev');
    if (!prev || !fine) return;
    gsap.set(prev, { xPercent: -50, yPercent: -50, scale: .8 });
    const xTo = gsap.quickTo(prev, 'x', { duration: .6, ease: 'power3' });
    const yTo = gsap.quickTo(prev, 'y', { duration: .6, ease: 'power3' });
    const rTo = gsap.quickTo(prev, 'rotation', { duration: .8, ease: 'power3' });
    let lx = 0;
    sec.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); rTo(gsap.utils.clamp(-8, 8, (e.clientX - lx) * .4)); lx = e.clientX; });
    sec.addEventListener('pointerenter', (e) => { gsap.set(prev, { x: e.clientX, y: e.clientY }); gsap.to(prev, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); });
    sec.addEventListener('pointerleave', () => gsap.to(prev, { opacity: 0, scale: .8, duration: .4 }));
  });
  document.querySelectorAll('[data-to-top]').forEach((b) => b.addEventListener('click', () => scrollToY(0, 2)));
}
