import { gsap, reduced } from './scroll.js';

const loadImg = (src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });

export async function runLoader(ready, critical = [], onReveal) {
  const L = document.querySelector('[data-loader]');
  if (!L) { onReveal?.(); return; }
  document.documentElement.classList.remove('is-entering');
  try { sessionStorage.removeItem('aer-tr'); } catch { }
  if (reduced) { L.remove(); onReveal?.(); return; }
  let quick = false;
  try { quick = sessionStorage.getItem('aer-visited') === '1'; sessionStorage.setItem('aer-visited', '1'); } catch { }

  const charge = L.querySelector('[data-ld-charge]');
  const waves = L.querySelectorAll('.ld__wave');
  const emblem = L.querySelector('.ld__emblem');
  const word = L.querySelector('[data-ld-word]');

  const jobs = [...critical.map(loadImg), Promise.resolve(ready), document.fonts ? document.fonts.ready : Promise.resolve()];
  let done = 0; let target = 0;
  jobs.forEach((j) => j.then(() => { done += 1; target = done / jobs.length; }));
  const minDur = quick ? .45 : .95;
  const maxWait = 4;

  gsap.to([emblem, word], { opacity: 1, duration: .5, ease: 'power2.out', stagger: .08 });

  let v = 0;
  await new Promise((res) => {
    const t0 = performance.now();
    const tick = () => {
      const el = (performance.now() - t0) / 1000;
      const cap = Math.min(1, el / minDur);
      const goal = el > maxWait ? 1 : Math.min(target, cap);
      v += (goal - v) * .18;
      if (goal >= 1 && v > .992) v = 1;
      gsap.set(charge, { strokeDashoffset: 1 - v });
      if (v >= 1) res(); else requestAnimationFrame(tick);
    };
    tick();
  });

  const reach = Math.hypot(window.innerWidth, window.innerHeight);
  await new Promise((res) => {
    const tl = gsap.timeline({ onComplete: res });
    tl.to(waves, { opacity: .7, duration: .01, stagger: .12 }, 0)
      .to(waves, { scale: 4.2, opacity: 0, duration: 1.1, ease: 'power2.out', stagger: .12 }, 0)
      .to([emblem, word], { opacity: 0, duration: .3, ease: 'power2.in' }, .1)
      .to(L.querySelector('.ld__rings'), { scale: 1.3, opacity: 0, duration: .5, ease: 'power2.in' }, .15)
      .to(L, { '--h': `${reach}px`, duration: .95, ease: 'expo.inOut' }, .2)
      .add(() => onReveal?.(), .35);
  });
  L.remove();
}
