// aerWing: view inspector (drag / tabs / keys / autoplay), stacked configuration cards, cabin hotspots,
// horizontal technology track on a sticky stage.
import { gsap, ScrollTrigger, reduced, fine, trackTrigger } from '../core/scroll.js';
import { initTabs } from '../core/ui.js';

function inspector() {
  const root = document.querySelector('[data-iv]');
  if (!root) return;
  const stage = root.querySelector('[data-iv-stage]');
  const imgs = [...root.querySelectorAll('.iv__img')];
  const tabs = [...root.querySelectorAll('[data-view-btn]')];
  const label = root.querySelector('[data-iv-label]');
  const names = ['Side', '3/4', 'Front', 'Plan', 'Above'];
  let cur = 0; let auto = null; let touched = false;
  const show = (k, dir = 1) => {
    k = (k + imgs.length) % imgs.length;
    if (k === cur) return;
    const a = imgs[cur]; const b = imgs[k];
    if (!b.complete) b.loading = 'eager';
    tabs.forEach((t, i) => { t.classList.toggle('is-on', i === k); t.setAttribute('aria-pressed', String(i === k)); });
    label.textContent = `View · ${names[k]}`;
    if (reduced) { a.classList.remove('is-on'); b.classList.add('is-on'); cur = k; return; }
    gsap.killTweensOf([a, b]);
    gsap.to(a, { opacity: 0, x: -60 * dir, scale: .94, filter: 'blur(6px)', duration: .55, ease: 'power3.in', onComplete: () => a.classList.remove('is-on') });
    b.classList.add('is-on');
    gsap.fromTo(b, { opacity: 0, x: 80 * dir, scale: 1.04, filter: 'blur(8px)' }, { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out', delay: .25 });
    cur = k;
  };
  const stop = () => { touched = true; clearInterval(auto); };
  tabs.forEach((t, i) => t.addEventListener('click', () => { stop(); show(i, i > cur ? 1 : -1); }));
  // drag to turn
  let sx = null; let moved = 0;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; moved = 0; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 70) { stop(); show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); sx = e.clientX; moved++; }
  });
  const up = () => { sx = null; };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.tabIndex = 0; stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', 'aerWing viewer. Use the arrow keys to turn the aircraft.');
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { stop(); show(cur + 1, 1); } if (e.key === 'ArrowLeft') { stop(); show(cur - 1, -1); } });
  // gentle idle float + pointer tilt
  if (!reduced) {
    gsap.to(stage, { y: -8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (fine) {
      const rx = gsap.quickTo(stage, 'rotationY', { duration: 1.2, ease: 'power3' }); const ry = gsap.quickTo(stage, 'rotationX', { duration: 1.2, ease: 'power3' });
      gsap.set(stage, { transformPerspective: 1600 });
      root.addEventListener('pointermove', (e) => { const r = root.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 10); ry(((e.clientY - r.top) / r.height - .5) * -6); });
    }
    auto = setInterval(() => { if (!touched && !document.hidden) show(cur + 1, 1); }, 3600);
    // scroll: the title sinks behind the aircraft
    gsap.to(root.querySelector('.iv__title'), { yPercent: 30, opacity: .2, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
  }
}

function stack() {
  const cards = [...document.querySelectorAll('[data-stk]')];
  if (reduced || !cards.length) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(c.querySelector('.stk__inner'), { scale: .93, filter: 'brightness(.93)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: true } });
    });
  });
}

function hotspots() {
  const root = document.querySelector('[data-cab]');
  if (!root) return;
  const hs = [...root.querySelectorAll('[data-hs]')];
  const n = root.querySelector('[data-hs-n]'); const t = root.querySelector('[data-hs-title]'); const b = root.querySelector('[data-hs-body]');
  const set = (i) => {
    hs.forEach((h, k) => h.classList.toggle('is-on', k === i));
    n.textContent = `Point ${['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][i]} of eight`;
    t.textContent = hs[i].dataset.title; b.textContent = hs[i].dataset.body;
    if (!reduced) gsap.fromTo([t, b], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'expo.out' });
  };
  hs.forEach((h, i) => { h.addEventListener('click', () => set(i)); if (fine) h.addEventListener('mouseenter', () => set(i)); });
  set(0);
  if (!reduced) gsap.from(hs, { scale: 0, opacity: 0, stagger: .07, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: root.querySelector('.cab__media'), start: 'top 70%', once: true } });
}

function track() {
  const sec = document.querySelector('[data-ht]');
  if (!sec || reduced) return;
  const row = sec.querySelector('[data-ht-row]');
  const prog = sec.querySelector('[data-ht-prog]');
  const title = sec.querySelectorAll('.ht__title .hl > span');
  gsap.from(title, { yPercent: 115, duration: 1.3, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 60%', once: true } });
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const dist = () => Math.max(0, row.scrollWidth - window.innerWidth);
    const tw = gsap.to(row, { x: () => -dist(), ease: 'none' });
    const st = trackTrigger(sec.querySelector('.ht__track'), { scrub: .8, animation: tw, invalidateOnRefresh: true, onUpdate: (s) => { prog.style.transform = `scaleX(${s.progress})`; } });
    return () => { st.kill(); tw.kill(); gsap.set(row, { x: 0 }); };
  });
}

export function init() {
  inspector(); stack(); hotspots(); track(); initTabs();
  return {};
}

export { ScrollTrigger };
