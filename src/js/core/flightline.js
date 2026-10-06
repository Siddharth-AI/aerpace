// The flight line: a planned route (dotted) runs down the whole page through anchor points declared with data-fp="x,y;x,y"
// (x = fraction of page width, y = fraction of that section's height, "@pad" = centre of the landing pad).
// The flown part (solid) follows the scroll, and a small aircraft rides its tip, turned to the direction of travel.
// Sections marked data-solid sit above the line, so the aircraft flies behind them and comes out the other side.
import { gsap, ScrollTrigger, reduced } from './scroll.js';

const catmull = (pts) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = pts[i + 2] || p2;
    const t = 0.5;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

export function initFlightLine() {
  const main = document.querySelector('main');
  const anchors = [...document.querySelectorAll('[data-fp]')];
  const planeSrc = document.querySelector('[data-plane-top]')?.content.querySelector('.plane');
  if (!main || anchors.length < 2 || !planeSrc || window.innerWidth < 1100) return;

  const NS = 'http://www.w3.org/2000/svg';
  const wrap = document.createElement('div');
  wrap.className = 'fl'; wrap.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  const plan = document.createElementNS(NS, 'path'); plan.setAttribute('class', 'fl__plan');
  const flown = document.createElementNS(NS, 'path'); flown.setAttribute('class', 'fl__flown');
  svg.append(plan, flown);
  const craft = document.createElement('div'); craft.className = 'fl__craft';
  craft.appendChild(planeSrc.cloneNode(true));
  wrap.append(svg, craft);
  main.prepend(wrap);

  const pad = document.querySelector('[data-cta-pad]');
  const padLabel = document.querySelector('[data-pad-label]');
  let L = { lens: [], xs: [], ys: [], ymax: [], total: 0 };
  let cur = 0; let ready = false; let landed = false;

  const build = () => {
    const mr = main.getBoundingClientRect();
    const top0 = mr.top + window.scrollY;
    const W = main.clientWidth; const H = main.scrollHeight;
    const wrapEl = document.querySelector('main .wrap');
    const wr = wrapEl ? wrapEl.getBoundingClientRect() : { left: 0 };
    const gutter = wrapEl ? (wr.left - mr.left) + parseFloat(getComputedStyle(wrapEl).paddingLeft) : 48;
    wrap.style.setProperty('--fl-size', `${Math.round(Math.max(30, Math.min(54, gutter * 1.15)))}px`);
    const X = (t) => (t === 'L' ? gutter / 2 : t === 'R' ? W - gutter / 2 : parseFloat(t) * W);
    const Y = (t, top, h) => (/px$/.test(t) ? (parseFloat(t) < 0 ? top + h + parseFloat(t) : top + parseFloat(t)) : top + parseFloat(t) * h);
    wrap.style.height = `${H}px`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const pts = [];
    anchors.forEach((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY - top0;
      el.dataset.fp.split(';').forEach((spec) => {
        if (spec.trim() === '@pad') {
          if (!pad) return;
          const pr = pad.querySelector('svg').getBoundingClientRect();
          pts.push([pr.left + pr.width / 2 - mr.left, pr.top + window.scrollY - top0 + pr.height / 2]);
          return;
        }
        const [fx, fy] = spec.split(',').map((v) => v.trim());
        pts.push([X(fx), Y(fy, top, r.height)]);
      });
    });
    const d = catmull(pts);
    plan.setAttribute('d', d); flown.setAttribute('d', d);
    const total = flown.getTotalLength();
    const n = Math.max(200, Math.min(4000, Math.round(total / 6)));
    const lens = new Float32Array(n + 1); const xs = new Float32Array(n + 1); const ys = new Float32Array(n + 1); const ymax = new Float32Array(n + 1);
    let m = -Infinity;
    for (let i = 0; i <= n; i++) {
      const l = (i / n) * total; const p = flown.getPointAtLength(l);
      lens[i] = l; xs[i] = p.x; ys[i] = p.y; m = Math.max(m, p.y); ymax[i] = m;
    }
    L = { lens, xs, ys, ymax, total, n, top0 };
    flown.style.strokeDasharray = `${cur} ${total + 10}`;
    ready = true;
  };

  const at = (len) => {
    const { n, total, xs, ys } = L;
    const f = Math.max(0, Math.min(1, len / total)) * n;
    const i = Math.min(n - 1, Math.floor(f)); const k = f - i;
    return [xs[i] + (xs[i + 1] - xs[i]) * k, ys[i] + (ys[i + 1] - ys[i]) * k, Math.atan2(ys[i + 1] - ys[i], xs[i + 1] - xs[i])];
  };
  const lenForY = (y) => {
    const { ymax, lens, n } = L;
    let lo = 0; let hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (ymax[mid] < y) lo = mid + 1; else hi = mid; }
    return lens[lo];
  };

  let ang = Math.PI / 2; let sc = 1;
  const update = () => {
    if (!ready) return;
    const y = window.scrollY + window.innerHeight * 0.6 - L.top0;
    const target = lenForY(y);
    cur += (target - cur) * (reduced ? 1 : 0.14);
    if (Math.abs(target - cur) < 0.05) cur = target;
    flown.style.strokeDasharray = `${cur.toFixed(1)} ${L.total + 10}`;
    const end = cur > L.total - 3;
    const [x, yy, a0] = at(Math.max(1, cur));
    const a = end ? -Math.PI / 2 : a0;
    let da = a - ang; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    ang += da * 0.18;
    sc += ((end ? 1.35 : 1) - sc) * .08;
    craft.style.transform = `translate(${x.toFixed(1)}px, ${yy.toFixed(1)}px) rotate(${(ang * 180 / Math.PI - 90).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    if (end !== landed) {
      landed = end;
      pad?.classList.toggle('is-landed', end);
      if (padLabel) padLabel.textContent = end ? 'Pad · landed' : 'Pad · awaiting arrival';
    }
  };

  build();
  gsap.ticker.add(update);
  ScrollTrigger.addEventListener('refresh', build);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 300); });
}
