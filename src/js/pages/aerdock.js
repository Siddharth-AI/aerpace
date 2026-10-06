// aerDock: torch hero (the pointer lights the dock in daylight), 160-frame scroll journey, services accordion, films.
import { gsap, reduced, fine, trackTrigger, whileVisible } from '../core/scroll.js';

function torch() {
  const sec = document.querySelector('[data-torch]');
  if (!sec) return;
  const lit = sec.querySelector('[data-torch-lit]');
  const trace = sec.querySelectorAll('.th__trace path');
  const T = { x: 50, y: 55, r: 0, tx: 50, ty: 55, user: false };
  const apply = () => { lit.style.setProperty('--mx', `${T.x}%`); lit.style.setProperty('--my', `${T.y}%`); lit.style.setProperty('--r', `${T.r}px`); };
  if (reduced) { T.r = 2000; apply(); gsap.set(trace, { strokeDashoffset: 0 }); return; }
  gsap.to(T, { r: Math.max(window.innerWidth, window.innerHeight) * .2, duration: 1.8, ease: 'expo.out', delay: .4, onUpdate: apply });
  gsap.to(trace, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: .3, delay: .6 });
  if (fine) sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); T.tx = ((e.clientX - r.left) / r.width) * 100; T.ty = ((e.clientY - r.top) / r.height) * 100; T.user = true; });
  sec.addEventListener('pointerleave', () => { T.user = false; });
  whileVisible(sec, (t) => {
    if (!T.user) { T.tx = 50 + Math.cos(t * .5) * 22; T.ty = 52 + Math.sin(t * .8) * 12; }
    T.x += (T.tx - T.x) * .08; T.y += (T.ty - T.y) * .08;
    apply();
  });
  gsap.to(sec.querySelector('.th__media'), { yPercent: 12, scale: 1.05, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } });
}

function journey() {
  const sec = document.querySelector('[data-journey]');
  if (!sec) return;
  const cv = sec.querySelector('[data-seq]');
  const ctx = cv.getContext('2d');
  const caps = [...sec.querySelectorAll('.jr__caps li')];
  const frameEl = sec.querySelector('[data-seq-frame]');
  const prog = sec.querySelector('[data-seq-prog]');
  const N = 160; const frames = new Array(N); let cur = -1; let want = 0;
  const src = (i) => `media/seq/dock/${String(i).padStart(3, '0')}.webp`;
  const size = () => { const r = cv.getBoundingClientRect(); const d = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); cur = -1; draw(want); };
  const near = (i) => { for (let k = 0; k < N; k++) { const a = frames[i - k]; if (a?.complete && a.naturalWidth) return a; const b = frames[i + k]; if (b?.complete && b.naturalWidth) return b; } return null; };
  const draw = (i) => {
    want = i;
    const img = near(i);
    if (!img || (i === cur && img === draw._last)) return;
    cur = i; draw._last = img;
    const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
    const w = img.naturalWidth * s; const h = img.naturalHeight * s;
    ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  };
  // load every 8th frame first, then fill in
  const order = []; for (let step = 8; step >= 1; step = Math.floor(step / 2)) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
  let started = false;
  const load = () => {
    if (started) return; started = true;
    let k = 0;
    const next = () => { if (k >= order.length) return; const i = order[k++]; const im = new Image(); im.decoding = 'async'; im.onload = () => { if (Math.abs(i - want) < 6) { cur = -1; draw(want); } next(); }; im.onerror = next; im.src = src(i); frames[i] = im; };
    for (let c = 0; c < 4; c++) next();
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: '150% 0px' }).observe(sec);
  size(); window.addEventListener('resize', size);
  let k0 = -1;
  trackTrigger(sec.querySelector('.jr__track'), {
    scrub: reduced ? true : .4,
    onUpdate: (s) => {
      const p = s.progress; const i = Math.min(N - 1, Math.round(p * (N - 1)));
      draw(i); frameEl.textContent = String(i).padStart(3, '0'); prog.style.transform = `scaleX(${p})`;
      const k = Math.min(caps.length - 1, Math.floor(p * caps.length));
      if (k !== k0) { k0 = k; caps.forEach((c, j) => c.classList.toggle('is-on', j === k)); }
    },
  });
}

function services() {
  const list = document.querySelector('[data-svc]');
  if (!list) return;
  const items = [...list.querySelectorAll('.svc')];
  const set = (i) => items.forEach((it, k) => it.classList.toggle('is-on', k === i));
  items.forEach((it, i) => { it.addEventListener('mouseenter', () => set(i)); it.addEventListener('focus', () => set(i)); it.addEventListener('click', () => set(i)); });
}

function films() {
  document.querySelectorAll('[data-film]').forEach((f) => {
    const v = f.querySelector('video');
    const play = () => { if (reduced) return; v.preload = 'auto'; v.muted = true; v.play().catch(() => {}); };
    const stop = () => v.pause();
    f.addEventListener('mouseenter', play); f.addEventListener('mouseleave', stop);
    f.addEventListener('click', () => (v.paused ? play() : stop()));
  });
}

export function init() {
  torch(); journey(); services(); films();
  return {};
}
