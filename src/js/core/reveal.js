// Reveal vocabulary. Each section uses a different one, so the page never repeats the same entrance twice in a row.
// lines   – heading lines rise out of a mask
// rise    – block lifts 36px and fades in
// clip    – image opens from a slim window and settles from 1.2x
// words   – words brighten with scroll (statement)
// blur    – words come into focus with scroll (vision)
// count / scramble – numbers count up, codes decode
import { gsap, ScrollTrigger, reduced } from './scroll.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return [...el.querySelectorAll('.w')];
}

const lines = (el, vars = {}) => SplitText.create(el, {
  type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'rl',
  onSplit: (self) => gsap.from(self.lines, { yPercent: 115, duration: 1.25, ease: 'expo.out', stagger: .08, ...vars }),
});

export function count(el, delay = 0) {
  const target = parseFloat(el.dataset.count);
  const dec = (el.dataset.count.split('.')[1] || '').length;
  const o = { v: 0 };
  gsap.to(o, { v: target, duration: 1.8, delay, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
}

const GLYPHS = 'ABCDEFGHKLMNPRSTVWXYZ0123456789₂';
export function scramble(el, delay = 0) {
  const final = el.dataset.scramble;
  const o = { p: 0 };
  gsap.to(o, { p: 1, duration: 1.1, delay, ease: 'power2.out', onUpdate: () => {
    const n = Math.floor(o.p * final.length);
    el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
  }, onComplete: () => { el.textContent = final; } });
}

export function initReveals(scope = document) {
  if (reduced) return;
  scope.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
    lines(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  ScrollTrigger.batch(scope.querySelectorAll('[data-reveal="rise"]'), {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .07, overwrite: true }),
  });
  gsap.set(scope.querySelectorAll('[data-reveal="rise"]'), { opacity: 0 });
  scope.querySelectorAll('[data-reveal="clip"]').forEach((el) => {
    const m = el.querySelector('img, video');
    const st = { trigger: el, start: 'top 86%', once: true };
    gsap.fromTo(el, { clipPath: 'inset(18% 26% 18% 26% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: st });
    if (m) gsap.fromTo(m, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: st });
  });
  scope.querySelectorAll('[data-reveal="words"]').forEach((el) => {
    const w = splitWords(el);
    gsap.fromTo(w, { opacity: .12 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  scope.querySelectorAll('[data-blur]').forEach((el) => {
    const w = splitWords(el);
    gsap.fromTo(w, { opacity: .06, y: 26, scale: .96 }, { opacity: 1, y: 0, scale: 1, stagger: .14, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 82%', end: 'center 52%', scrub: .6 } });
  });
  scope.querySelectorAll('[data-count]:not([data-manual])').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => count(el) });
  });
  scope.querySelectorAll('[data-scramble]:not([data-manual])').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => scramble(el) });
  });
  scope.querySelectorAll('[data-parallax]').forEach((el) => {
    const v = parseFloat(el.dataset.parallax) || -10;
    gsap.fromTo(el, { yPercent: v }, { yPercent: -v, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  scope.querySelectorAll('[data-timeline]').forEach((tl) => {
    const rail = tl.querySelector('.tl__rail i');
    if (rail) gsap.fromTo(rail, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 60%', scrub: true } });
  });
  // footer wordmark rises out of the floor
  const mark = document.querySelector('[data-ft-mark] svg');
  if (mark) gsap.fromTo(mark, { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ft', start: 'top 85%', end: 'bottom bottom', scrub: true } });
}

/** Page-entry choreography for a hero: title lines, then the supporting pieces. */
export function heroIn(scope = document) {
  if (reduced) return;
  const title = scope.querySelector('[data-split="hero"]');
  if (title) SplitText.create(title, {
    type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'rl',
    onSplit: (self) => gsap.from(self.lines, { yPercent: 118, rotate: 2.5, transformOrigin: '0 100%', duration: 1.5, ease: 'expo.out', stagger: .09, delay: .05 }),
  });
  const ins = scope.querySelectorAll('[data-in]');
  if (ins.length) gsap.from(ins, { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .08, delay: .35 });
}
