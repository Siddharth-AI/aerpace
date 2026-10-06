// Manifesto: a procedural city plan. The road route from A to B is found on the street graph (a river with two bridges
// forces the detour), then the air route draws as one clean arc. The readouts are measured from this drawing.
import { gsap, reduced, trackTrigger, whileVisible } from '../core/scroll.js';

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function initManifesto() {
  const sec = document.querySelector('[data-mf]');
  if (!sec) return;
  const track = sec.querySelector('.mf__track');
  const cv = sec.querySelector('[data-city]');
  const ctx = cv.getContext('2d');
  const lines = [...sec.querySelectorAll('[data-mf-l]')];
  const pinA = sec.querySelector('[data-pin="a"]'); const pinB = sec.querySelector('[data-pin="b"]');
  const roadEl = sec.querySelector('[data-road]'); const airEl = sec.querySelector('[data-air]'); const ratioEl = sec.querySelector('[data-ratio]');
  const roadBar = sec.querySelector('[data-road-bar]'); const airBar = sec.querySelector('[data-air-bar]');
  const planePath = new Path2D(document.querySelector('[data-plane-top]')?.content.querySelector('path')?.getAttribute('d') || 'M0 0');

  const S = { w: 1, h: 1, dpr: 1, cols: [], rows: [], river: null, bridges: [], route: [], routeLen: 0, air: null, airLen: 0, block: 1, cars: [], base: null };
  const P = { pins: 0, road: 0, air: 0, fade: 0 };

  const build = () => {
    const r = cv.getBoundingClientRect();
    S.dpr = Math.min(window.devicePixelRatio || 1, 2); S.w = r.width; S.h = r.height;
    cv.width = Math.round(S.w * S.dpr); cv.height = Math.round(S.h * S.dpr);
    const rand = rng(7);
    const small = S.w < 760;
    // streets: jittered grid
    const gx = small ? 58 : 84; const gy = small ? 58 : 76;
    S.cols = []; for (let x = -gx * .3; x < S.w + gx; x += gx * (0.75 + rand() * 0.5)) S.cols.push(x);
    S.rows = []; for (let y = -gy * .3; y < S.h + gy; y += gy * (0.75 + rand() * 0.5)) S.rows.push(y);
    S.block = (gx + gy) / 2;
    const nc = S.cols.length; const nr = S.rows.length;
    S.major = { c: new Set(), r: new Set() };
    S.cols.forEach((_, i) => { if (i % 4 === 2) S.major.c.add(i); });
    S.rows.forEach((_, i) => { if (i % 3 === 1) S.major.r.add(i); });
    // river: a band between two row indices, wandering
    const rr = Math.floor(nr * (small ? .58 : .52));
    S.river = { row: rr, y0: S.rows[rr], y1: S.rows[rr + 1] };
    S.bridges = new Set([Math.floor(nc * .12), Math.floor(nc * .93)]);
    // nodes
    const id = (c, r2) => r2 * nc + c;
    const node = (k) => [S.cols[k % nc], S.rows[Math.floor(k / nc)]];
    // A and B
    const A = id(Math.floor(nc * (small ? .2 : .26)), Math.floor(nr * (small ? .74 : .7)));
    const B = id(Math.floor(nc * (small ? .78 : .8)), Math.floor(nr * (small ? .4 : .26)));
    // Dijkstra on the grid; edges crossing the river only at bridges; major roads are faster
    const dist = new Float64Array(nc * nr).fill(Infinity); const prev = new Int32Array(nc * nr).fill(-1); const done = new Uint8Array(nc * nr);
    dist[A] = 0;
    for (;;) {
      let u = -1; let best = Infinity;
      for (let i = 0; i < dist.length; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0 || u === B) break;
      done[u] = 1;
      const c = u % nc; const r2 = Math.floor(u / nc);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const c2 = c + dc; const r3 = r2 + dr;
        if (c2 < 0 || r3 < 0 || c2 >= nc || r3 >= nr) return;
        if (dr && (Math.min(r2, r3) === S.river.row) && !S.bridges.has(c)) return;
        const v = id(c2, r3);
        const [x1, y1] = node(u); const [x2, y2] = node(v);
        const major = dr ? S.major.c.has(c) : S.major.r.has(r2);
        const w = Math.hypot(x2 - x1, y2 - y1) * (major ? .72 : 1);
        if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
      });
    }
    const route = []; for (let k = B; k >= 0; k = prev[k]) { route.push(node(k)); if (k === A) break; }
    route.reverse();
    S.route = route;
    S.routeLen = route.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - route[i - 1][0], p[1] - route[i - 1][1]) : 0), 0);
    S.segLen = route.map((p, i) => (i ? Math.hypot(p[0] - route[i - 1][0], p[1] - route[i - 1][1]) : 0));
    const a = node(A); const b = node(B);
    const mx = (a[0] + b[0]) / 2; const my = (a[1] + b[1]) / 2; const dx = b[0] - a[0]; const dy = b[1] - a[1];
    S.air = { a, b, c: [mx + dy * .18, my - dx * .18] };
    // arc length of the quadratic
    let al = 0; let q0 = a; for (let i = 1; i <= 60; i++) { const q = qp(i / 60); al += Math.hypot(q[0] - q0[0], q[1] - q0[1]); q0 = q; }
    S.airLen = al;
    S.A = a; S.B = b;
    pinA.style.transform = `translate(${a[0] - 14}px, ${a[1] - 14}px)`;
    pinB.style.transform = `translate(${b[0] - 14}px, ${b[1] - 14}px)`;
    // traffic
    S.cars = Array.from({ length: small ? 40 : 90 }, () => {
      const horiz = rand() > .5;
      return { horiz, i: Math.floor(rand() * (horiz ? nr : nc)), t: rand(), v: (.012 + rand() * .03) * (rand() > .5 ? 1 : -1) };
    });
    // static layer
    S.base = document.createElement('canvas'); S.base.width = cv.width; S.base.height = cv.height;
    const b2 = S.base.getContext('2d'); b2.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    b2.fillStyle = '#EEF1F3'; b2.fillRect(0, 0, S.w, S.h);
    // blocks with building footprints
    for (let i = 0; i < nc - 1; i++) for (let j = 0; j < nr - 1; j++) {
      if (j === S.river.row) continue;
      const x0 = S.cols[i] + 7; const y0 = S.rows[j] + 7; const x1 = S.cols[i + 1] - 7; const y1 = S.rows[j + 1] - 7;
      if (x1 - x0 < 8 || y1 - y0 < 8) continue;
      const park = rand() < .07;
      b2.fillStyle = park ? 'rgba(160, 178, 160, .16)' : 'rgba(14, 18, 22, .045)';
      b2.fillRect(x0, y0, x1 - x0, y1 - y0);
      if (!park) {
        b2.strokeStyle = 'rgba(14, 18, 22, .07)'; b2.lineWidth = 1;
        const k = 1 + Math.floor(rand() * 3);
        for (let s = 0; s < k; s++) { const xx = x0 + (x1 - x0) * rand(); b2.beginPath(); b2.moveTo(xx, y0); b2.lineTo(xx, y1); b2.stroke(); }
      }
    }
    // river
    b2.fillStyle = 'rgba(169, 193, 209, .45)';
    b2.beginPath();
    b2.moveTo(0, S.river.y0 + 4);
    for (let x = 0; x <= S.w; x += 20) b2.lineTo(x, S.river.y0 + 4 + Math.sin(x / 140) * 5);
    for (let x = S.w; x >= 0; x -= 20) b2.lineTo(x, S.river.y1 - 4 + Math.sin(x / 120 + 1) * 5);
    b2.closePath(); b2.fill();
    // streets
    const street = (x1, y1, x2, y2, major) => { b2.strokeStyle = major ? 'rgba(14, 18, 22, .2)' : 'rgba(14, 18, 22, .1)'; b2.lineWidth = major ? 2.2 : 1; b2.beginPath(); b2.moveTo(x1, y1); b2.lineTo(x2, y2); b2.stroke(); };
    S.cols.forEach((x, i) => {
      if (S.bridges.has(i)) street(x, 0, x, S.h, S.major.c.has(i));
      else { street(x, 0, x, S.river.y0, S.major.c.has(i)); street(x, S.river.y1, x, S.h, S.major.c.has(i)); }
    });
    S.rows.forEach((y, j) => { if (j !== S.river.row && j !== S.river.row + 1) street(0, y, S.w, y, S.major.r.has(j)); else street(0, y, S.w, y, false); });
    S.bridges.forEach((i) => { const x = S.cols[i]; b2.fillStyle = 'rgba(14, 18, 22, .5)'; b2.fillRect(x - 5, S.river.y0 - 2, 10, 3); b2.fillRect(x - 5, S.river.y1 - 1, 10, 3); });
    draw(0);
  };

  const qp = (t) => { const { a, b, c } = S.air; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; };
  const along = (p) => {
    let rem = p * S.routeLen;
    for (let i = 1; i < S.route.length; i++) {
      if (rem <= S.segLen[i]) { const k = rem / S.segLen[i]; const a = S.route[i - 1]; const b = S.route[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, i]; }
      rem -= S.segLen[i];
    }
    const l = S.route[S.route.length - 1]; return [l[0], l[1], S.route.length - 1];
  };

  function draw(t) {
    if (!S.base) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(S.base, 0, 0);
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    // traffic crawling along the streets (it does not stop)
    ctx.fillStyle = `rgba(14, 18, 22, ${0.42 * (1 - P.fade * .6)})`;
    S.cars.forEach((c) => {
      const u = ((c.t + t * c.v) % 1 + 1) % 1;
      const x = c.horiz ? u * S.w : S.cols[c.i]; const y = c.horiz ? S.rows[c.i] : u * S.h;
      if (y === undefined || x === undefined) return;
      if (!c.horiz && y > S.river.y0 && y < S.river.y1 && !S.bridges.has(c.i)) return;
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    });
    // road route
    if (P.road > 0) {
      const [x, y, k] = along(P.road);
      ctx.strokeStyle = `rgba(62, 71, 80, ${1 - P.fade * .55})`; ctx.lineWidth = 3.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(S.route[0][0], S.route[0][1]);
      for (let i = 1; i < k; i++) ctx.lineTo(S.route[i][0], S.route[i][1]);
      ctx.lineTo(x, y); ctx.stroke();
      if (P.road < 1) { ctx.fillStyle = '#0E1216'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); }
    }
    // air route
    if (P.air > 0) {
      ctx.save();
      ctx.strokeStyle = '#0A6C86'; ctx.lineWidth = 2.6; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); const a = S.air.a; ctx.moveTo(a[0], a[1]);
      const n = Math.max(1, Math.round(60 * P.air)); for (let i = 1; i <= n; i++) { const q = qp((i / 60)); ctx.lineTo(q[0], q[1]); }
      ctx.stroke(); ctx.restore();
      const tt = Math.min(1, P.air); const q = qp(tt); const q2 = qp(Math.min(1, tt + .01)); const q1 = qp(Math.max(0, tt - .01));
      const ang = Math.atan2(q2[1] - q1[1], q2[0] - q1[0]);
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang - Math.PI / 2);
      const sc = 54 / 1200; ctx.scale(sc, sc); ctx.translate(-600, -281);
      ctx.fillStyle = '#0E1216'; ctx.fill(planePath); ctx.restore();
    }
  }

  const readouts = () => {
    const road = (S.routeLen / S.block) * Math.min(1, P.road); const air = (S.airLen / S.block) * Math.min(1, P.air);
    roadEl.textContent = road.toFixed(1); airEl.textContent = air.toFixed(1);
    roadBar.style.transform = `scaleX(${Math.min(1, P.road)})`;
    airBar.style.transform = `scaleX(${Math.min(1, P.air) * (S.airLen / S.routeLen)})`;
    ratioEl.textContent = P.air > .98 ? (S.routeLen / S.airLen).toFixed(1) : '—';
  };

  build();
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 250); });
  whileVisible(sec, (t) => draw(reduced ? 0 : t));

  if (reduced) { P.pins = 1; P.road = 1; P.air = 1; gsap.set(lines[1].querySelectorAll('.hl > span'), { yPercent: 0 }); gsap.set(lines[0], { opacity: 0 }); gsap.set([pinA, pinB], { opacity: 1 }); readouts(); draw(0); return; }

  const l0 = lines[0].querySelectorAll('.hl > span'); const l1 = lines[1].querySelectorAll('.hl > span');
  gsap.set(l1, { yPercent: 110 });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  gsap.from(l0, { opacity: 0, y: 34, skewY: 3, duration: 1.1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 62%', once: true } });
  tl.to([pinA, pinB], { opacity: 1, duration: .05, stagger: .02 }, 0)
    .to(P, { road: 1, duration: .38, ease: 'power1.inOut' }, .04)
    .to(l0, { yPercent: -110, duration: .07, stagger: .02, ease: 'power2.in' }, .46)
    .to(l1, { yPercent: 0, duration: .08, stagger: .02, ease: 'power3.out' }, .52)
    .to(P, { air: 1, duration: .28, ease: 'power2.inOut' }, .54)
    .to(P, { fade: 1, duration: .12 }, .84);
  trackTrigger(track, { scrub: .7, animation: tl, onUpdate: () => { readouts(); } });
}
