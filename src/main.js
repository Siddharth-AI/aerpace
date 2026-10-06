import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/pages.css';

import { ScrollTrigger, initScroll, scrollToEl } from './js/core/scroll.js';
import { initNav, initClock, initCursor, initMagnetic, initTransitions, pageIn, initMedia, initNext } from './js/core/chrome.js';
import { initReveals, heroIn } from './js/core/reveal.js';
import { initDrag, initForms } from './js/core/ui.js';
import { runLoader } from './js/core/loader.js';

const page = document.body.dataset.page;
const modules = {
  home: () => import('./js/pages/home.js'),
  aerwing: () => import('./js/pages/aerwing.js'),
  aerdock: () => import('./js/pages/aerdock.js'),
  chapter: () => import('./js/pages/chapter.js'),
};

async function boot() {
  initScroll();
  initNav();
  initClock();
  initCursor();
  initMagnetic();
  initTransitions();
  initMedia();
  initDrag();
  initForms();
  initNext();
  const mod = await (modules[page] || modules.chapter)();
  const ctx = mod.init() || {};
  initReveals();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (page === 'home') {
    await runLoader(ctx.ready, ctx.critical || [], () => { ctx.intro?.(); });
  } else {
    await pageIn();
    heroIn();
    ctx.intro?.();
  }
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (location.hash.length > 1) {
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => scrollToEl(el), 300);
  }
}

let rz; let lastW = window.innerWidth;
window.addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) < 2 && window.matchMedia('(pointer: coarse)').matches) return; lastW = window.innerWidth; ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 400);
});

boot();
