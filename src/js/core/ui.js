// Drag galleries, lightbox, forms, tabs.
import { gsap, reduced, scrollStop, scrollStart, toast } from './scroll.js';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export function initDrag() {
  document.querySelectorAll('[data-drag]').forEach((track) => {
    const inner = track.querySelector('.strip__inner');
    if (!inner) return;
    const bounds = () => ({ minX: Math.min(0, track.clientWidth - inner.scrollWidth), maxX: 0 });
    const [d] = Draggable.create(inner, {
      type: 'x', bounds: bounds(), inertia: true, edgeResistance: .85, dragClickables: true, minimumMovement: 6,
      onClick(e) {
        const fig = e.target.closest('[data-lightbox]');
        if (fig) openLightbox(fig);
      },
    });
    const upd = () => d.applyBounds(bounds());
    window.addEventListener('resize', upd);
    inner.querySelectorAll('img').forEach((i) => { if (!i.complete) i.addEventListener('load', upd, { once: true }); });
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'Gallery. Drag or use the arrow keys to move.');
    track.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const b = bounds(); const x = gsap.getProperty(inner, 'x') + (e.key === 'ArrowRight' ? -360 : 360);
      gsap.to(inner, { x: Math.max(b.minX, Math.min(0, x)), duration: .7, ease: 'expo.out', onUpdate: () => d.update() });
    });
  });
}

let lb;
function openLightbox(fig) {
  const all = [...fig.parentElement.querySelectorAll('[data-lightbox] img')];
  let i = all.indexOf(fig.querySelector('img'));
  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = `<div class="lightbox__bar meta"><span data-lb-n></span><div class="lightbox__btns"><button type="button" data-lb="prev" aria-label="Previous image">←</button><button type="button" data-lb="next" aria-label="Next image">→</button><button type="button" data-lb="close" aria-label="Close">✕</button></div></div><img alt="">`;
    document.body.appendChild(lb);
  }
  const img = lb.querySelector('img'); const n = lb.querySelector('[data-lb-n]');
  const show = (k) => { i = (k + all.length) % all.length; img.src = all[i].currentSrc || all[i].src; n.textContent = `${String(i + 1).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}`; gsap.fromTo(img, { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); };
  const close = () => { lb.classList.remove('is-open'); scrollStart(); document.removeEventListener('keydown', key); fig.focus?.(); };
  const key = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); };
  lb.onclick = (e) => { const b = e.target.closest('[data-lb]'); if (b) { if (b.dataset.lb === 'close') close(); else show(i + (b.dataset.lb === 'next' ? 1 : -1)); } else if (e.target === lb) close(); };
  document.addEventListener('keydown', key);
  show(i); lb.classList.add('is-open'); scrollStop();
  lb.querySelector('[data-lb="close"]').focus();
}

const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initForms() {
  document.querySelectorAll('[data-request]').forEach((b) => b.addEventListener('click', () => {
    const f = b.parentElement.querySelector('.dl__form');
    f.hidden = !f.hidden;
    b.querySelector('span').textContent = f.hidden ? 'Request' : 'Cancel';
    if (!f.hidden) f.querySelector('input').focus();
  }));
  document.querySelectorAll('[data-form]').forEach((f) => {
    f.addEventListener('input', (e) => { e.target.closest('.field')?.classList.remove('is-err'); e.target.closest('.chips')?.classList.remove('is-err'); });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const seen = new Set();
      f.querySelectorAll('[required]').forEach((inp) => {
        let valid;
        if (inp.type === 'radio') {
          if (seen.has(inp.name)) return; seen.add(inp.name);
          valid = !!f.querySelector(`input[name="${inp.name}"]:checked`);
          inp.closest('.chips')?.classList.toggle('is-err', !valid);
        } else {
          valid = inp.type === 'checkbox' ? inp.checked : (inp.value.trim() !== '' && inp.checkValidity());
          inp.closest('.field')?.classList.toggle('is-err', !valid);
        }
        inp.setAttribute('aria-invalid', String(!valid));
        if (!valid) ok = false;
      });
      if (!ok) {
        toast('Some fields need attention. They are marked in red.');
        f.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const kind = f.dataset.form;
      if (kind === 'request') {
        const row = f.closest('.dl__row');
        f.hidden = true;
        const b = row.querySelector('[data-request]');
        b.querySelector('span').textContent = 'Requested'; b.disabled = true;
        toast('Request noted. This prototype does not send email yet.');
        return;
      }
      if (kind === 'newsletter') {
        f.querySelector('input').value = '';
        toast('You are on the list. (Prototype: nothing was sent.)');
        return;
      }
      const name = f.querySelector('[name="name"]')?.value.trim();
      const done = document.createElement('div');
      done.className = 'form__done';
      done.setAttribute('tabindex', '-1');
      done.innerHTML = `<p class="tag"><i></i>Received</p><p class="t-m">Thank you${name ? `, ${escHtml(name)}` : ''}.</p><p class="t-body">${kind === 'events' ? 'You are on the list for the next event announcement.' : 'Your message is ready for the aerpace team.'} This prototype does not send anything yet; in production it goes straight to the right inbox.</p>`;
      gsap.to(f, { opacity: 0, y: -10, duration: .35, onComplete: () => { f.replaceWith(done); gsap.from(done, { opacity: 0, y: 14, duration: .7, ease: 'expo.out' }); done.focus(); } });
    });
  });
}

export function initTabs(scope = document) {
  scope.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (k, focus) => {
      tabs.forEach((t, i) => { const on = i === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[i].hidden = !on; panels[i].classList.toggle('is-on', on); });
      if (!reduced) gsap.fromTo(panels[k].children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'expo.out' });
      if (focus) tabs[k].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  });
}
