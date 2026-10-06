import { gsap, ScrollTrigger, reduced, fine } from '../core/scroll.js';

export function initHero() {
  const sec = document.querySelector('[data-hero]');
  if (!sec) return {};
  const craft = sec.querySelector('[data-hero-craft]');
  const img = craft.querySelector('img');
  const pad = sec.querySelector('[data-hero-pad]');
  const shadow = sec.querySelector('[data-hero-shadow]');
  const light = sec.querySelector('.hero__light');
  const title = sec.querySelector('[data-hero-title]');

  const io = new IntersectionObserver(([e]) => sec.classList.toggle('is-off', !e.isIntersecting));
  io.observe(sec);

  let bob = null;
  if (!reduced) {
    bob = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 2.8, ease: 'sine.inOut' } })
      .to(img, { y: -14, rotation: -.5 }, 0)
      .to(shadow, { scale: .86, opacity: .7 }, 0)
      .to(light, { scale: 1.08, opacity: .85 }, 0);
    bob.pause();
  }

  if (fine && !reduced) {
    const xTo = gsap.quickTo(craft, 'x', { duration: 1.2, ease: 'power3' });
    const yTo = gsap.quickTo(craft, 'y', { duration: 1.2, ease: 'power3' });
    const rTo = gsap.quickTo(craft, 'rotation', { duration: 1.2, ease: 'power3' });
    const pTo = gsap.quickTo(pad, 'x', { duration: 1.4, ease: 'power3' });
    sec.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      xTo(px * 36); yTo(py * 14); rTo(px * -3); pTo(px * 22);
    });
    sec.addEventListener('pointerleave', () => { xTo(0); yTo(0); rTo(0); pTo(0); });
  }

  if (!reduced) {
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: .6 } })
      .to(craft, { yPercent: -150, scale: .78, ease: 'power1.in' }, 0)
      .to(shadow, { scale: .3, opacity: 0, ease: 'none' }, 0)
      .to(light, { opacity: 0, ease: 'none' }, 0)
      .to(title, { yPercent: -18, opacity: 0, ease: 'none' }, 0)
      .to(sec.querySelectorAll('.hero__foot'), { y: -50, opacity: 0, ease: 'none' }, 0);
  }

  const intro = () => {
    if (reduced) return;
    gsap.fromTo(title.querySelectorAll('.hl > span'), { yPercent: 115 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .09, delay: .15 });
    gsap.fromTo(sec.querySelectorAll('[data-in]'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .08, delay: .45 });
    gsap.fromTo(pad, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' });
    gsap.fromTo(craft, { yPercent: 38, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.8, ease: 'expo.out', delay: .1, onComplete: () => bob?.play() });
  };
  const ready = new Promise((r) => { if (img.complete) r(); else { img.onload = img.onerror = () => r(); } });
  return { intro, ready, critical: ['media/cut/v-side.webp'], bob };
}

export { ScrollTrigger };
