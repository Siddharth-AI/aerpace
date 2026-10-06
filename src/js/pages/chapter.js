// Chapter pages: story hero that settles into a frame, eco rows with a sticky image, orbit, aerOS graph, news list, tabs.
import { gsap, ScrollTrigger, reduced, fine, whileVisible } from '../core/scroll.js';
import { initTabs } from '../core/ui.js';

function storyHero() {
  const sec = document.querySelector('[data-sh]');
  if (!sec || reduced) return;
  const m = sec.querySelector('[data-sh-media]');
  gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } })
    .fromTo(m, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: 'inset(8% 4% 14% 4% round 28px)', ease: 'none' }, 0)
    .to(m.querySelector('img, video'), { scale: 1.12, ease: 'none' }, 0)
    .to(sec.querySelector('.sh__content'), { yPercent: -10, opacity: 0, ease: 'none' }, 0);
}

function ecoHero() {
  const media = document.querySelector('[data-eh-media]');
  if (!media || reduced) return;
  gsap.fromTo(media, { clipPath: 'inset(12% 0% 0% 30% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.8, ease: 'expo.inOut', delay: .1 });
  gsap.fromTo(media.querySelector('img, video'), { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out', delay: .1 });
  const name = document.querySelector('[data-eh-name]');
  if (name) gsap.fromTo(name, { xPercent: 0 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: name.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
}

function ecoRows() {
  const sec = document.querySelector('[data-rs]');
  if (!sec) return;
  const figs = [...sec.querySelectorAll('.rs__fig')];
  sec.querySelectorAll('.rs__item').forEach((it, i) => {
    ScrollTrigger.create({ trigger: it, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => { if (s.isActive) figs.forEach((f, k) => f.classList.toggle('is-on', k === i)); } });
  });
}

function orbit() {
  const root = document.querySelector('[data-orbit]');
  if (!root) return;
  const nodes = [...root.querySelectorAll('.orbit__node')];
  const items = [...root.querySelectorAll('.orbit__item')];
  const lines = [...root.querySelectorAll('.orbit__svg line')];
  let cur = 0; let touched = false;
  const show = (k) => { cur = k; nodes.forEach((n, i) => n.classList.toggle('is-on', i === k)); items.forEach((it, i) => it.classList.toggle('is-on', i === k)); lines.forEach((l, i) => l.classList.toggle('is-on', i === k)); };
  nodes.forEach((n, i) => { n.addEventListener('click', () => { touched = true; show(i); }); if (fine) n.addEventListener('mouseenter', () => { touched = true; show(i); }); n.addEventListener('focus', () => show(i)); });
  show(0);
  if (!reduced) {
    const t = setInterval(() => { if (touched) { clearInterval(t); return; } show((cur + 1) % nodes.length); }, 3400);
    gsap.from(nodes, { scale: 0, opacity: 0, stagger: .08, duration: 1, ease: 'back.out(1.8)', scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
  }
}

function graph() {
  const cv = document.querySelector('[data-graph]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const names = ['aerWing', 'aerDock', 'aerCar', 'aerVolt', 'aerShield'];
  const S = { w: 1, h: 1, d: 1 };
  const size = () => { const r = cv.getBoundingClientRect(); S.d = Math.min(window.devicePixelRatio || 1, 2); S.w = r.width; S.h = r.height; cv.width = S.w * S.d; cv.height = S.h * S.d; };
  size(); window.addEventListener('resize', size);
  const pos = (i, t) => {
    const cx = S.w / 2; const cy = S.h / 2; const R = Math.min(S.w, S.h) * .36;
    const a = -Math.PI / 2 + i * (Math.PI * 2 / names.length) + (reduced ? 0 : t * .035);
    return [cx + Math.cos(a) * R * (S.w > 700 ? 1.35 : 1.05), cy + Math.sin(a) * R];
  };
  const draw = (t) => {
    ctx.setTransform(S.d, 0, 0, S.d, 0, 0); ctx.clearRect(0, 0, S.w, S.h);
    const c = [S.w / 2, S.h / 2];
    const P = names.map((_, i) => pos(i, t));
    P.forEach((p, i) => {
      P.forEach((q, j) => { if (j <= i) return; ctx.strokeStyle = 'rgba(243,241,236,.07)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(243,241,236,.28)'; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.setLineDash([]);
      for (let k = 0; k < 2; k++) {
        const u = ((t * .26 + i * .19 + k * .5) % 1); const back = (i + k) % 2;
        const x = back ? p[0] + (c[0] - p[0]) * u : c[0] + (p[0] - c[0]) * u; const y = back ? p[1] + (c[1] - p[1]) * u : c[1] + (p[1] - c[1]) * u;
        ctx.fillStyle = back ? '#EEF1F3' : '#7CE3FF'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
      }
    });
    P.forEach((p, i) => {
      ctx.fillStyle = '#13181D'; ctx.strokeStyle = 'rgba(243,241,236,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#EEF1F3'; ctx.font = '500 12px "Geist Mono Variable", monospace'; ctx.textAlign = 'center'; ctx.fillText(names[i].toUpperCase(), p[0], p[1] + 54);
      ctx.fillStyle = '#7CE3FF'; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill();
    });
    const pulse = reduced ? 0 : (Math.sin(t * 2) + 1) / 2;
    ctx.strokeStyle = `rgba(124,227,255,${.35 - pulse * .25})`; ctx.beginPath(); ctx.arc(c[0], c[1], 56 + pulse * 14, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#EEF1F3'; ctx.beginPath(); ctx.arc(c[0], c[1], 48, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0E1216'; ctx.font = 'italic 400 22px "Instrument Serif", serif'; ctx.textAlign = 'center'; ctx.fillText('aerOS', c[0], c[1] + 7);
  };
  draw(0);
  whileVisible(cv, (t) => draw(t));
}

function news() {
  const root = document.querySelector('[data-filters]');
  if (!root) return;
  const chips = [...root.querySelectorAll('[data-filter]')];
  const rows = [...document.querySelectorAll('[data-newslist] .nrow')];
  const empty = document.querySelector('[data-empty]');
  chips.forEach((c) => c.addEventListener('click', () => {
    const f = c.dataset.filter;
    chips.forEach((x) => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
    let n = 0;
    rows.forEach((r) => { const on = f === 'all' || r.dataset.cat === f; r.hidden = !on; if (on) n += 1; });
    empty.hidden = n > 0;
    if (!reduced) gsap.from(rows.filter((r) => !r.hidden), { y: 16, opacity: 0, stagger: .05, duration: .6, ease: 'expo.out' });
  }));
  const float = document.querySelector('[data-float]');
  if (!float || !fine || reduced) return;
  const img = float.querySelector('img');
  gsap.set(float, { xPercent: -50, yPercent: -50, scale: .8 });
  const xTo = gsap.quickTo(float, 'x', { duration: .6, ease: 'power3' }); const yTo = gsap.quickTo(float, 'y', { duration: .6, ease: 'power3' });
  rows.forEach((r) => {
    const a = r.querySelector('a');
    a.addEventListener('pointerenter', (e) => { img.src = a.dataset.img; gsap.set(float, { x: e.clientX, y: e.clientY }); gsap.to(float, { opacity: 1, scale: 1, duration: .45, ease: 'expo.out' }); });
    a.addEventListener('pointermove', (e) => { xTo(e.clientX + 180); yTo(e.clientY); });
    a.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: .8, duration: .3 }));
  });
}

export function init() {
  storyHero(); ecoHero(); ecoRows(); orbit(); graph(); news(); initTabs();
  return {};
}
