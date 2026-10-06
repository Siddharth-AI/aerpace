import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

export { gsap, ScrollTrigger };
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isDesktop = () => window.matchMedia('(min-width: 961px)').matches;
export let lenis = null;

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.1, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    const el = document.querySelector(url.hash);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
  });
  // images that arrive late change heights: refresh once things settle
  let t;
  const soon = () => { clearTimeout(t); t = setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 220); };
  document.querySelectorAll('main img').forEach((img) => { if (!img.complete) img.addEventListener('load', soon, { once: true }); });
  window.addEventListener('load', soon);
  document.fonts?.ready.then(soon);
}

export function scrollToEl(el, offset = 0) {
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
export function scrollToY(y, duration = 1.2) {
  if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
export const scrollStop = () => { lenis?.stop(); document.documentElement.style.overflow = 'hidden'; };
export const scrollStart = () => { lenis?.start(); document.documentElement.style.overflow = ''; };

/** Run fn on every gsap tick only while el is near the viewport. */
export function whileVisible(el, fn, margin = '15%') {
  let on = false;
  const tick = (t, dt) => fn(t, dt);
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { gsap.ticker.add(tick); on = true; }
    else if (!e.isIntersecting && on) { gsap.ticker.remove(tick); on = false; }
  }, { rootMargin: `${margin} 0px` });
  io.observe(el);
  return () => { io.disconnect(); if (on) gsap.ticker.remove(tick); };
}

export function toast(msg) {
  const t = document.querySelector('[data-toast]');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('is-on'), 3800);
}

/** Stage progress for a sticky track: 0 at track top hitting the viewport top, 1 when its bottom meets the viewport bottom. */
export function trackTrigger(track, vars) {
  return ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', ...vars });
}
