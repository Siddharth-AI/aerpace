// Builds every HTML page at the project root from templates + data.
// Run before `vite` / `vite build` (npm scripts do this for you).
import fs from 'node:fs';
import path from 'node:path';
import { ECOSYSTEM, MENU_GROUPS, NEWS, COMPANY, SPECS, CONFIGS, SAFETY, PHASES, ICAO, TURNTABLE, POWER } from '../src/data/site.js';
import { CHAPTERS } from '../src/data/chapters.js';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s = '') => String(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const plain = (s = '') => String(s).replace(/\*/g, '');

const cleanSvg = (file, cls) => read(`public/media/brand/${file}`)
  .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->|<style[\s\S]*?<\/style>/g, '')
  .replace(/\s(class|id|x|y|style|xml:space|xmlns:xlink|version)="[^"]*"/g, '')
  .replace('<svg', `<svg class="${cls}" fill="currentColor" aria-hidden="true" focusable="false"`)
  .replace(/\s+/g, ' ').trim();

const WORDMARK = cleanSvg('wordmark.svg', 'wordmark');
const ARROW = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const EXT = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const PLUS = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

// plan-view outline (top.json, 1200 x 562, nose pointing down)
const TOP = JSON.parse(read('public/media/vec/top.json'));
const SIDE = JSON.parse(read('public/media/vec/side.json'));
const OUTER = TOP.paths.filter((p) => p[0] === 'o').map((p) => p[1]).join('');
// small aircraft silhouette used by the flight line and the curtain (nose points right after rotate(-90))
const PLANE = `<svg class="plane" viewBox="0 0 ${TOP.w} ${TOP.h}" aria-hidden="true"><path d="${OUTER}" /></svg>`;
const SIDE_OUTER = SIDE.paths.filter((p) => p[0] === 'o').map((p) => p[1]).join('');
// side profile, nose pointing right: used where the aircraft crosses the screen
const PLANE_SIDE = `<svg class="plane-side" viewBox="0 0 ${SIDE.w} ${SIDE.h}" aria-hidden="true"><path d="${SIDE_OUTER}" transform="translate(${SIDE.w} 0) scale(-1 1)"/></svg>`;
const outlineSvg = (cls, data = TOP, inner = true) => `<svg class="${cls}" viewBox="0 0 ${data.w} ${data.h}" aria-hidden="true">${data.paths
  .filter((p) => inner || p[0] === 'o').map((p) => `<path class="${p[0] === 'o' ? 'po' : 'pi'}" d="${p[1]}" pathLength="1"/>`).join('')}</svg>`;
const titleOf = (slug) => ({ index: 'Home', aerwing: 'aerWing', aerdock: 'aerDock', ...Object.fromEntries(CHAPTERS.map((c) => [c.slug, c.title])) }[slug] || slug);
const btn = (label, href, kind = '', extra = '') =>
  `<a class="btn${kind ? ` btn--${kind}` : ''}" href="${href}" data-magnetic ${extra}><span>${label}</span><span class="btn__ico">${ARROW}</span></a>`;

/* ================================================================ header */
function header(page) {
  const cur = (p) => (p === page ? ' aria-current="page"' : '');
  const eco = ECOSYSTEM.map((e, i) => `
          <li><a class="mg__item" href="${e.slug}.html" data-i="${i}"${cur(e.slug)}>
            <span class="mg__name">${e.name}</span><span class="tag">${e.tag}</span>
            <span class="mg__line">${e.line}</span>
          </a></li>`).join('');
  const ecoPrev = ECOSYSTEM.map((e, i) => `<img src="${e.img}" alt="" loading="lazy" data-i="${i}"${i ? '' : ' class="is-on"'}>`).join('');
  const co = MENU_GROUPS[2][1].map(([s, t]) => `<li><a href="${s}.html"${cur(s)}><span>${t}</span>${ARROW}</a></li>`).join('');
  const groups = MENU_GROUPS.map(([g, links]) => `
      <div class="mm__group">
        <p class="meta">${g}</p>
        <ul>${links.map(([s, t]) => `<li><a href="${s}.html"${cur(s)}>${t}</a></li>`).join('')}</ul>
      </div>`).join('');
  return `
<header class="nav" data-nav>
  <a class="nav__logo" href="index.html" aria-label="aerpace, home">${WORDMARK}</a>
  <nav class="nav__pill" aria-label="Primary" data-pill>
    <span class="nav__hl" aria-hidden="true"></span>
    <a class="nav__a" href="aerwing.html"${cur('aerwing')}>aerWing</a>
    <a class="nav__a" href="aerdock.html"${cur('aerdock')}>aerDock</a>
    <button class="nav__a" type="button" data-mega-btn="eco" aria-expanded="false" aria-controls="mega-eco">Ecosystem<i class="nav__chev" aria-hidden="true"></i></button>
    <button class="nav__a" type="button" data-mega-btn="co" aria-expanded="false" aria-controls="mega-co">Company<i class="nav__chev" aria-hidden="true"></i></button>
    <a class="nav__a" href="newsroom.html"${cur('newsroom')}>Newsroom</a>
    <a class="nav__a" href="investors.html"${cur('investors')}>Investors</a>
  </nav>
  <div class="nav__end">
    <p class="nav__clock meta" aria-label="Local time at the Pune hub"><span>Pune</span> <b data-clock>--:--</b> <span>IST</span></p>
    <a class="nav__cta" href="contact.html"${cur('contact')}><span>Talk to us</span><i aria-hidden="true"></i></a>
    <button class="nav__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu" data-menu-btn><span></span><span></span></button>
  </div>
  <div class="mg" id="mega-eco" data-mega="eco">
    <div class="mg__card mg__card--eco">
      <div class="mg__prev">${ecoPrev}<p class="mg__cap"><span class="meta">aerVerse</span><span class="t-serif">Six parts, one network.</span></p></div>
      <ul class="mg__list">${eco}</ul>
      <a class="mg__all link" href="aerverse.html">See how they connect ${ARROW}</a>
    </div>
  </div>
  <div class="mg" id="mega-co" data-mega="co">
    <div class="mg__card mg__card--co">
      <ul class="mg__links">${co}</ul>
      <a class="mg__feat" href="racers.html"><img src="media/img/racers-07.webp" alt="" loading="lazy"><span class="tag">Motorsport</span><span class="mg__name">aerpace Racers</span></a>
      <a class="mg__feat" href="maketime.html"><img src="media/img/ridge.webp" alt="" loading="lazy"><span class="tag">Movement</span><span class="mg__name">#MakeTime</span></a>
    </div>
  </div>
</header>
<div class="mm" id="site-menu" data-menu aria-hidden="true">
  <div class="mm__inner">
    <div class="mm__groups">${groups}</div>
    <a class="btn mm__cta" href="contact.html"><span>Talk to aerpace</span><span class="btn__ico">${ARROW}</span></a>
    <div class="mm__foot meta"><span>${COMPANY.name}</span><span>${COMPANY.exchange} ${COMPANY.scrip}</span><span>${COMPANY.hub} · ${COMPANY.hubCoords}</span></div>
  </div>
</div>`;
}

/* ================================================================ footer */
function footer() {
  const col = (t, links) => `<div class="ft__col"><p class="meta">${t}</p><ul>${links.map(([s, l]) => `<li><a href="${s}.html">${l}</a></li>`).join('')}</ul></div>`;
  return `
<footer class="ft" data-theme="night">
  <div class="wrap ft__top">
    <div class="ft__news">
      <p class="tag"><i></i>Flight notes</p>
      <p class="ft__lede">Occasional letters from the hangar: tests, docks, first flights. <em>No noise.</em></p>
      <form class="ft__form" data-form="newsletter" novalidate>
        <label class="sr" for="nl-email">Email address</label>
        <div class="field"><input id="nl-email" name="email" type="email" placeholder="you@company.com" autocomplete="email" required></div>
        <button type="submit" aria-label="Subscribe">${ARROW}</button>
      </form>
      <p class="meta ft__note">Prototype form · nothing is sent</p>
    </div>
    <nav class="ft__cols" aria-label="Footer">
      ${MENU_GROUPS.map(([g, l]) => col(g, l)).join('')}
    </nav>
  </div>
  <div class="wrap ft__bar">
    <div class="ft__cell"><p class="meta">Central hub</p><p>${COMPANY.hub}, Maharashtra · <span class="tabular">${COMPANY.hubCoords}</span></p></div>
    <div class="ft__cell"><p class="meta">Local time</p><p class="tabular"><span data-clock-s>--:--:--</span> IST</p></div>
    <div class="ft__cell"><p class="meta">Listed</p><p>${COMPANY.exchange} · <span class="tabular">${COMPANY.scrip}</span></p></div>
    <button class="ft__top-btn" type="button" data-to-top><span>Back to top</span><i aria-hidden="true">${ARROW}</i></button>
  </div>
  <div class="ft__mark" aria-hidden="true" data-ft-mark>${WORDMARK}</div>
  <div class="wrap ft__base meta">
    <span>© 2026 ${COMPANY.name}</span>
    <span>India boundary: Survey of India outline via <a href="https://github.com/datameet/maps" target="_blank" rel="noopener">DataMeet</a>, CC BY 4.0</span>
    <span>Prototype · figures subject to confirmation</span>
  </div>
</footer>`;
}

const chrome = () => `
<div class="cur" data-curtain aria-hidden="true">
  <div class="cur__route"><span class="cur__line"></span><span class="cur__plane">${PLANE_SIDE}</span></div>
  <template data-plane-top>${PLANE}</template>
  <p class="cur__to"><span class="meta" data-cur-label>Now boarding</span><span class="cur__name" data-cur-name></span></p>
</div>
<div class="cursor" data-cursor-el aria-hidden="true"><span data-cursor-label></span></div>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;

const loader = () => `
<div class="ld" data-loader aria-hidden="true">
  <div class="ld__core" data-ld-core>
    <svg class="ld__rings" viewBox="0 0 240 240">
      <circle class="ld__wave" cx="120" cy="120" r="78"/><circle class="ld__wave" cx="120" cy="120" r="78"/><circle class="ld__wave" cx="120" cy="120" r="78"/>
      <circle class="ld__track" cx="120" cy="120" r="78"/>
      <circle class="ld__charge" cx="120" cy="120" r="78" pathLength="1" data-ld-charge/>
    </svg>
    <svg class="ld__emblem" viewBox="0 0 ${TOP.w} ${TOP.h}" aria-hidden="true"><path d="${OUTER}" fill="currentColor"/></svg>
  </div>
  <p class="ld__word" data-ld-word>${WORDMARK}</p>
</div>`;

function doc({ page, title, desc, body, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#EEF1F3">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="media/brand/favicon.svg" type="image/svg+xml">
<script>try{if(sessionStorage.getItem('aer-tr'))document.documentElement.classList.add('is-entering')}catch(e){}</script>
<style>html{background:#EEF1F3}.is-entering .cur{clip-path:inset(0)!important;visibility:visible!important}</style>
<script type="module" src="/src/main.js"></script>
</head>
<body data-page="${page}" class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${page === 'home' ? loader() : ''}${chrome()}
${header(page)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}

/* ================================================================ shared pieces */
const media = (m, cls = '', alt = '', eager = false) => m.video
  ? `<video class="${cls}" src="${m.video}" poster="${m.img}" muted playsinline loop preload="metadata" data-autoplay></video>`
  : `<img class="${cls}" src="${m.img}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}${m.pos ? ` style="object-position:${m.pos}"` : ''}>`;
const srcLink = (s) => s ? `<a class="src meta" href="${s.url}" target="_blank" rel="noopener">Source · ${s.label} ${EXT}</a>` : '';
const crumbs = (c) => `<p class="crumbs meta"><a href="index.html">aerpace</a><span aria-hidden="true">/</span><span>${c.group}</span><span aria-hidden="true">/</span><span aria-current="page">${c.title}</span></p>`;

const field = (id, label, input, wide = false) => `<div class="field${wide ? ' field--wide' : ''}"><label for="${id}" class="meta">${label}</label>${input}</div>`;
const form = (k) => {
  const common = field(`${k}-name`, 'Name', `<input id="${k}-name" name="name" autocomplete="name" required>`) +
    field(`${k}-email`, 'Email', `<input id="${k}-email" name="email" type="email" autocomplete="email" required>`);
  let extra = '';
  if (k === 'contact') extra = field('contact-org', 'Organisation', '<input id="contact-org" name="org" autocomplete="organization">') +
    `<fieldset class="field field--wide chips" data-chips><legend class="meta">Topic</legend>${['Partnership', 'Host an aerDock', 'Investors', 'Media', 'Careers', 'Something else'].map((t, i) => `<label class="chip"><input type="radio" name="topic" value="${t}"${i ? '' : ' required'}><span>${t}</span></label>`).join('')}</fieldset>` +
    field('contact-msg', 'Message', '<textarea id="contact-msg" name="message" rows="5" required></textarea>', true);
  if (k === 'investor') extra = field('investor-msg', 'Question', '<textarea id="investor-msg" name="message" rows="4" required></textarea>', true);
  if (k === 'careers') extra = `<fieldset class="field field--wide chips" data-chips><legend class="meta">Area</legend>${['Aerospace engineering', 'Hydrogen &amp; energy', 'Software &amp; aerOS', 'Manufacturing', 'Industrial design', 'Operations'].map((t, i) => `<label class="chip"><input type="radio" name="area" value="${t}"${i ? '' : ' required'}><span>${t}</span></label>`).join('')}</fieldset>` +
    field('careers-cv', 'CV (PDF)', '<input id="careers-cv" name="cv" type="file" accept=".pdf">', true) +
    field('careers-msg', 'A few lines about you', '<textarea id="careers-msg" name="message" rows="4"></textarea>', true);
  if (k === 'events') return `<form class="form form--inline" data-form="events" novalidate>${field('events-email', 'Email', '<input id="events-email" name="email" type="email" autocomplete="email" required>')}<button class="btn" type="submit" data-magnetic><span>Notify me</span><span class="btn__ico">${ARROW}</span></button><p class="form__note meta">Prototype form · nothing is sent</p></form>`;
  return `<form class="form" data-form="${k}" novalidate>${common}${extra}
    <div class="field field--wide field--check"><input id="${k}-consent" type="checkbox" required><label for="${k}-consent">aerpace may use these details to reply to me.</label></div>
    <div class="form__actions"><button class="btn" type="submit" data-magnetic><span>Send</span><span class="btn__ico">${ARROW}</span></button><p class="form__note meta">Prototype form · nothing is sent yet</p></div>
  </form>`;
};

const head2 = (tag, title, side = '') => `<header class="sh2 wrap"><div class="doc"><p class="tag">${tag}</p>${side ? `<div class="doc__meta">${side}</div>` : ''}</div><h2 class="t-l" data-reveal="lines">${em(title)}</h2></header>`;

function extra(c) {
  const x = c.extra; if (!x) return '';
  switch (x.type) {
    case 'timeline': return `<section class="x-tl" data-theme="paper2">${head2(c.title, x.title)}
      <ol class="wrap tl" data-timeline><span class="tl__rail" aria-hidden="true"><i></i></span>
      ${x.items.map((it) => `<li class="tl__item" data-reveal="rise"><span class="tl__when">${it.when}</span><div class="tl__body"><p class="t-body">${it.what}</p>${srcLink(it.src)}</div></li>`).join('')}</ol></section>`;
    case 'orbit': return `<section class="x-orbit" data-theme="mist">${head2('aerVerse', x.title, srcLink(x.src))}
      <div class="wrap orbit" data-orbit>
        <div class="orbit__stage">
          <svg class="orbit__svg" viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="220"/><circle cx="300" cy="300" r="132" class="dash"/>${ECOSYSTEM.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return `<line x1="300" y1="300" x2="${(300 + 220 * Math.cos(a)).toFixed(1)}" y2="${(300 + 220 * Math.sin(a)).toFixed(1)}" data-i="${i}"/>`; }).join('')}</svg>
          <div class="orbit__core"><span class="t-serif">aerVerse</span></div>
          ${ECOSYSTEM.map((e, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return `<button class="orbit__node" type="button" data-i="${i}" style="--x:${(50 + 36.6 * Math.cos(a)).toFixed(2)}%;--y:${(50 + 36.6 * Math.sin(a)).toFixed(2)}%"><span class="orbit__dot"></span><span class="orbit__name">${e.name}</span></button>`; }).join('')}
        </div>
        <div class="orbit__panel" aria-live="polite">
          ${ECOSYSTEM.map((e, i) => `<article class="orbit__item${i ? '' : ' is-on'}" data-i="${i}"><figure class="frame"><img src="${e.img}" alt="" loading="lazy"></figure><p class="tag">${e.tag}</p><h3 class="t-m">${e.name}</h3><p class="t-body">${e.line}</p><a class="link" href="${e.slug}.html">Open ${e.name} ${ARROW}</a></article>`).join('')}
        </div>
      </div></section>`;
    case 'tabs': return `<section class="x-tabs" data-theme="light">${head2(c.title, x.title)}
      <div class="wrap tabs" data-tabs>
        <div class="tabs__list" role="tablist" aria-label="${esc(plain(x.title))}">${x.items.map((t, i) => `<button class="tabs__tab" role="tab" type="button" id="tab-${c.slug}-${i}" aria-controls="panel-${c.slug}-${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}"><span class="tabs__name">${t.name}</span><i class="tabs__bar"></i></button>`).join('')}</div>
        <div class="tabs__panels">${x.items.map((t, i) => `<div class="tabs__panel${i ? '' : ' is-on'}" role="tabpanel" id="panel-${c.slug}-${i}" aria-labelledby="tab-${c.slug}-${i}"${i ? ' hidden' : ''}><figure class="frame"><img src="${t.img}" alt="" loading="lazy"></figure><div class="tabs__copy"><h3 class="t-m">${t.name}</h3><p class="t-body">${t.body}</p>${x.cta ? btn(x.cta[0], x.cta[1], 'line') : ''}</div></div>`).join('')}</div>
      </div></section>`;
    case 'cards': return `<section class="x-cards" data-theme="light"><div class="wrap cards">${x.items.map((it, i) => `<article class="card card--${i % 3}" data-reveal="rise"><figure class="frame card__media"><img src="${it.img}" alt="" loading="lazy"></figure><div class="card__meta"><span class="tag">${it.tag}</span><span class="meta">${it.when}</span></div><h3 class="t-m">${it.title}</h3><p class="t-body">${it.body}</p>${srcLink(it.src)}</article>`).join('')}</div></section>`;
    case 'graph': return `<section class="x-graph" data-theme="night">${head2('aerOS', x.title)}<div class="wrap graph"><canvas class="graph__canvas" data-graph aria-label="Diagram: aerOS at the centre, connected to aerWing, aerDock, aerCar, aerVolt and aerShield, with signals moving between them." role="img"></canvas></div></section>`;
    case 'impact': return `<section class="x-impact" data-theme="mist">${head2(c.title, x.title)}<ul class="wrap impact" data-impact>${x.items.map((t) => `<li><span>${t}</span></li>`).join('')}</ul></section>`;
    case 'news': return `<section class="x-news" data-theme="light"><div class="wrap">
      <div class="filters" role="toolbar" aria-label="Filter news" data-filters>${[['all', 'All'], ['news', 'News'], ['press', 'Press releases'], ['coverage', 'Coverage'], ['insights', 'Insights'], ['video', 'Film']].map(([k, l], i) => `<button type="button" class="chip-btn${i ? '' : ' is-on'}" data-filter="${k}" aria-pressed="${i ? 'false' : 'true'}">${l}</button>`).join('')}</div>
      <ul class="newslist" data-newslist>${NEWS.map((n) => `<li class="nrow" data-cat="${n.cat}"><a href="${n.url}" target="_blank" rel="noopener" data-cursor="Read" data-img="${n.img}"><span class="meta nrow__date">${n.label}</span><span class="nrow__title">${n.title}</span><span class="meta nrow__src">${n.catLabel} · ${n.source}</span><span class="nrow__go">${EXT}</span></a></li>`).join('')}</ul>
      <p class="empty meta" data-empty hidden>Nothing published in this category yet.</p>
      <div class="nrow__float" data-float aria-hidden="true"><img alt=""></div></div></section>`;
    case 'empty': return `<section class="x-empty" data-theme="light"><div class="wrap empty-state"><div class="empty-state__cal" aria-hidden="true">${Array.from({ length: 35 }, (_, i) => `<i${i === 17 ? ' class="is-on"' : ''}></i>`).join('')}</div><div><h2 class="t-l">${em(x.title)}</h2><p class="t-body">${x.body}</p>${form(x.form)}</div></div></section>`;
    case 'investors': return `<section class="x-inv" data-theme="light"><div class="wrap inv">
      <dl class="inv__facts"><div><dt class="meta">Company</dt><dd>${COMPANY.name}</dd></div><div><dt class="meta">Exchange</dt><dd>${COMPANY.exchange}</dd></div><div><dt class="meta">Scrip code</dt><dd class="tabular">${COMPANY.scrip}</dd></div><div><dt class="meta">Central hub</dt><dd>${COMPANY.hub}</dd></div></dl>
      <a class="inv__link" href="https://www.bseindia.com/" target="_blank" rel="noopener"><span class="meta">Filings</span><span class="inv__t">Announcements, results and shareholding on BSE</span><span class="meta">Search ${COMPANY.scrip} ${EXT}</span></a>
      <div class="inv__form"><h2 class="t-m">Ask investor <em>relations</em></h2>${form('investor')}</div></div></section>`;
    case 'careers': return `<section class="x-careers" data-theme="light"><div class="wrap careers"><div><p class="tag">Where we hire</p><ul class="areas">${x.areas.map((a) => `<li data-reveal="rise"><span>${a}</span>${ARROW}</li>`).join('')}</ul><p class="t-body careers__note">Open roles are posted here when they are available. Until then, the general application reaches the hiring team directly.</p></div><div><h2 class="t-m">General <em>application</em></h2>${form('careers')}</div></div></section>`;
    case 'downloads': return `<section class="x-dl" data-theme="light"><div class="wrap"><ul class="dl" data-downloads>${x.items.map(([d, f], i) => `<li class="dl__row"><span class="dl__ico" aria-hidden="true">${f}</span><span class="dl__name">${d}</span><span class="meta dl__f">${f} · on request</span><button class="btn btn--line btn--sm" type="button" data-request="${esc(d)}"><span>Request</span></button>
      <form class="dl__form" data-form="request" hidden novalidate><label class="meta" for="dl-${i}">Email for “${esc(d)}”</label><input id="dl-${i}" type="email" name="email" required autocomplete="email"><button class="btn btn--sm" type="submit"><span>Send request</span></button></form></li>`).join('')}</ul><p class="form__note meta">Prototype · requests are not sent</p></div></section>`;
    case 'contact': return `<section class="x-contact" data-theme="light"><div class="wrap contact"><aside class="contact__side"><div><p class="meta">Central hub</p><p class="t-m">${COMPANY.hub}, <em>Maharashtra</em></p><p class="meta">${COMPANY.hubCoords}</p></div><div class="contact__clock"><p class="meta">Local time</p><p class="t-m tabular" data-clock-s>--:--:--</p></div><ul class="contact__links"><li><a class="link" href="investors.html">Investor relations ${ARROW}</a></li><li><a class="link" href="careers.html">Careers ${ARROW}</a></li><li><a class="link" href="resources.html">Press kit ${ARROW}</a></li></ul></aside><div>${form('contact')}</div></div></section>`;
    default: return '';
  }
}

function nextBlock(c) {
  const n = CHAPTERS.find((x) => x.slug === c.next);
  const img = n?.hero?.img || 'media/img/studio-side.webp';
  return `<section class="next" data-theme="light">
  <a class="next__link wrap" href="${n.slug}.html" data-cursor="Fly there">
    <span class="doc"><span class="tag">Next</span><span class="meta">${n.group}</span></span>
    <span class="next__title t-xxl">${n.title}</span>
    <span class="next__route" aria-hidden="true"><i></i>${PLANE_SIDE}</span>
  </a>
  <div class="next__prev" aria-hidden="true"><img src="${img}" alt="" loading="lazy"></div>
</section>`;
}

const gallery = (list) => list ? `<section class="strip" data-theme="light"><div class="wrap strip__head doc"><p class="tag">Gallery</p><p class="meta strip__hint">Drag ${ARROW}</p></div><div class="strip__track" data-drag data-cursor="Drag"><div class="strip__inner">${list.map((g, i) => `<figure class="strip__item${i % 3 === 1 ? ' is-tall' : ''}" data-lightbox><img src="${g}" alt="" loading="lazy" draggable="false"></figure>`).join('')}</div></div></section>` : '';

function chapter(c) {
  const v = c.variant;
  let hero = '';
  if (v === 'eco') hero = `
<section class="eh" data-theme="light">
  <div class="wrap eh__grid">
    <div class="eh__text">
      ${crumbs(c)}
      <p class="tag"><i></i>${c.tag}</p>
      <h1 class="t-xl eh__title" data-split="hero">${em(c.display)}</h1>
      <p class="t-lede" data-in>${c.lede}</p>
      <dl class="eh__facts" data-in>${(c.facts || []).map(([k, val]) => `<div><dt class="meta">${k}</dt><dd>${val}</dd></div>`).join('')}</dl>
    </div>
    <figure class="eh__media frame frame--r" data-eh-media>${media(c.hero, '', '', true)}<figcaption class="meta">${c.title}</figcaption></figure>
  </div>
  <p class="eh__name" aria-hidden="true" data-eh-name>${c.title}</p>
</section>`;
  if (v === 'story') hero = `
<section class="sh" data-theme="night" data-sh>
  <div class="sh__media" data-sh-media>${media(c.hero, '', '', true)}</div>
  <div class="wrap sh__content">
    ${crumbs(c)}
    <p class="tag"><i></i>${c.tag}</p>
    <h1 class="t-xxl sh__title" data-split="hero">${em(c.display)}</h1>
    <div class="sh__foot"><p class="t-lede" data-in>${c.lede}</p><p class="cue meta" data-in><i></i>Scroll</p></div>
  </div>
</section>`;
  if (v === 'doc') hero = `
<section class="dh" data-theme="light">
  <div class="wrap">
    ${crumbs(c)}
    <div class="doc dh__doc" data-in><p class="tag"><i></i>${c.tag}</p><div class="doc__meta meta"><span>${COMPANY.name}</span><span>Reviewed Oct 2026</span></div></div>
    <h1 class="t-xxl dh__title" data-split="hero">${em(c.display)}</h1>
    <div class="dh__foot" data-in><p class="t-lede">${c.lede}</p></div>
  </div>
</section>`;

  const rows = (c.rows || []);
  let rowsHtml = '';
  if (rows.length && v === 'eco') rowsHtml = `
<section class="rs" data-theme="light" data-rs>
  <div class="wrap rs__grid">
    <div class="rs__media"><div class="rs__stick">${rows.map((r, i) => `<figure class="rs__fig frame frame--r${i ? '' : ' is-on'}" data-i="${i}">${media(r, '', plain(r.title))}</figure>`).join('')}</div></div>
    <div class="rs__list">${rows.map((r, i) => `<article class="rs__item" data-i="${i}"><figure class="rs__inline frame frame--r">${media(r, '', plain(r.title))}</figure><p class="tag">${r.tag}</p><h2 class="t-l" data-reveal="lines">${em(r.title)}</h2><p class="t-body">${r.body}</p></article>`).join('')}</div>
  </div>
</section>`;
  if (rows.length && v === 'story') rowsHtml = `
<section class="ed" data-theme="light">
  ${rows.map((r, i) => `<article class="ed__row wrap ed__row--${i % 3}">
    <figure class="ed__fig frame" data-reveal="clip">${media(r, '', plain(r.title))}</figure>
    <div class="ed__text"><p class="tag">${r.tag}</p><h2 class="t-l" data-reveal="lines">${em(r.title)}</h2><p class="t-body" data-reveal="rise">${r.body}</p></div>
  </article>`).join('')}
</section>`;

  const statement = c.statement ? `<section class="stmt" data-theme="${v === 'story' ? 'light' : 'paper2'}"><div class="wrap stmt__grid"><p class="tag">In one line</p><p class="t-serif stmt__q" data-reveal="words">${c.statement}</p><p class="t-body stmt__b">${c.statementBody}</p></div></section>` : '';
  const xFirst = ['tabs', 'orbit', 'graph'].includes(c.extra?.type);
  const body = `${hero}
${statement}
${xFirst ? extra(c) : ''}
${rowsHtml}
${!xFirst ? extra(c) : ''}
${gallery(c.gallery)}
${nextBlock(c)}`;
  return doc({ page: 'chapter', title: `${c.title} · aerpace`, desc: c.lede, body, bodyClass: `ch ch--${v} ch--${c.slug}` });
}

/* ================================================================ home / aerwing / aerdock parts */
const W = TOP.w, H = TOP.h;
const P = (fx, fy) => [Math.round(fx * W), Math.round(fy * H)];

const cargoSvg = () => `<svg class="cargo" viewBox="0 0 ${W} ${H}" aria-hidden="true">${TOP.paths.map((p) => `<path class="${p[0] === 'o' ? 'po' : 'pi'}" d="${p[1]}"/>`).join('')}
  <rect class="cargo__pod" x="${W * .39}" y="${H * .3}" width="${W * .22}" height="${H * .58}" rx="${W * .07}" pathLength="1"/>
  ${[0, 1, 2].map((r) => [0, 1].map((k) => `<rect class="cargo__crate" x="${W * .418 + k * W * .085}" y="${H * .38 + r * H * .15}" width="${W * .075}" height="${H * .12}" rx="4"/>`).join('')).join('')}
  <text x="${W / 2}" y="${H * .985}" text-anchor="middle">CARGO MODULE · CONCEPT</text></svg>`;

const cfgMedia = (c, auto = false) => c.media.type === 'video'
  ? `<video src="${c.media.src}" poster="${c.media.poster}" muted playsinline loop preload="metadata"${auto ? ' data-autoplay' : ''} aria-label="${c.name}: the car docks into aerWing"></video>`
  : c.media.type === 'img' ? `<img src="${c.media.src}" alt="${c.name} configuration" loading="lazy">` : `<div class="cargo-wrap">${cargoSvg()}</div>`;

const PARTS = {
  TT_TICKS: () => Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180; const big = i % 12 === 0; const r0 = big ? 430 : 452; return `<path${big ? ' class="is-big"' : ''} d="M${(500 + Math.cos(a) * r0).toFixed(1)} ${(500 + Math.sin(a) * r0).toFixed(1)}L${(500 + Math.cos(a) * 470).toFixed(1)} ${(500 + Math.sin(a) * 470).toFixed(1)}"/>`; }).join(''),
  TT_VIEWS: () => TURNTABLE.map((v, i) => `<img class="tt__img tt__img--${v.view}" src="media/cut/${v.file}" alt="aerWing, ${v.label.toLowerCase()} view" data-i="${i}"${i ? ' loading="lazy"' : ''} draggable="false">`).join(''),
  TT_SPECS: () => TURNTABLE.map((v, i) => { const s = SPECS.find((x) => x.key === v.spec); return `<li class="tt__spec${i ? '' : ' is-on'}" data-i="${i}"><span class="meta">${s.label}</span><span class="tt__v"><b>${s.value}</b>${s.unit ? `<small>${s.unit}</small>` : ''}</span><span class="tt__note">${s.note}</span><span class="tt__st meta${s.status === 'public' ? ' is-pub' : ''}">${s.status === 'public' ? 'Public' : 'To confirm'}</span></li>`; }).join(''),
  TT_TABS: () => TURNTABLE.map((v, i) => `<button type="button" class="tt__tab${i ? '' : ' is-on'}" data-tt-tab="${i}" aria-pressed="${i ? 'false' : 'true'}">${v.label}</button>`).join(''),
  PW_LIST: () => POWER.map((p, i) => `<li><button type="button" class="pw__item${i ? '' : ' is-on'}" data-pw-i="${i}" aria-pressed="${i ? 'false' : 'true'}"><span class="pw__name">${p.name}</span><span class="pw__line">${p.line}</span></button></li>`).join(''),
  PW_NODES: () => POWER.map((p, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; const x = 300 + Math.cos(a) * 230; const y = 300 + Math.sin(a) * 230; const lx = 300 + Math.cos(a) * 278; const ly = 300 + Math.sin(a) * 278 + 5; const anchor = Math.abs(Math.cos(a)) < .2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end'; return `<g class="pw-node${i ? '' : ' is-on'}" data-i="${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"/><text x="${(anchor === 'start' ? lx - 30 : anchor === 'end' ? lx + 30 : lx).toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}">${p.short}</text></g>`; }).join(''),
  CF_TABS: () => CONFIGS.map((c, i) => `<button type="button" class="cf__name${i ? '' : ' is-on'}" role="tab" id="cft-${c.key}" aria-controls="cfp-${c.key}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}" data-cf-i="${i}"><span class="cf__n">${c.name}</span><span class="cf__u">${c.use}</span></button>`).join(''),
  CF_PANELS: () => CONFIGS.map((c, i) => `<div class="cf__panel${i ? '' : ' is-on'}" role="tabpanel" id="cfp-${c.key}" aria-labelledby="cft-${c.key}" data-cf-p="${i}"${i ? ' hidden' : ''}><figure class="cf__media">${cfgMedia(c)}</figure><div class="cf__cap"><p class="t-m">${c.verb}</p><p class="t-body">${c.copy}</p><p class="meta cf__scene"><i></i>${c.scene}</p></div></div>`).join(''),
  SAFE_LAYERS: () => {
    const pats = [
      // backup batteries: rows of cells
      () => { let s = ''; for (let y = 150; y < 470; y += 80) for (let x = 120; x < 1100; x += 56) s += `<rect x="${x}" y="${y}" width="38" height="58" rx="6"/>`; return s; },
      // cold gas thrusters: nozzles around the edge
      () => [[120, 150], [1080, 150], [60, 300], [1140, 300], [330, 470], [870, 470], [600, 80], [600, 520]].map(([x, y]) => { const a = Math.atan2(y - 300, x - 600); return `<circle cx="${x}" cy="${y}" r="16"/><path d="M${x + Math.cos(a) * 22} ${y + Math.sin(a) * 22}L${x + Math.cos(a) * 70} ${y + Math.sin(a) * 70}"/>`; }).join(''),
      // collision avoidance: range rings from the nose
      () => [90, 180, 270, 360, 450, 540, 630].map((r) => `<circle cx="600" cy="540" r="${r}"/>`).join(''),
      // fire safety: hatch
      () => { let s = ''; for (let x = -600; x < 1400; x += 30) s += `<path d="M${x} 600L${x + 560} 0"/>`; return s; },
      // ballistic parachute: canopy seen from above
      () => `<circle cx="600" cy="280" r="250"/><circle cx="600" cy="280" r="160"/><circle cx="600" cy="280" r="40"/>${Array.from({ length: 16 }, (_, k) => { const a = k * Math.PI / 8; return `<path d="M${600 + Math.cos(a) * 40} ${280 + Math.sin(a) * 40}L${600 + Math.cos(a) * 250} ${280 + Math.sin(a) * 250}"/>`; }).join('')}`,
    ];
    return SAFETY.map((s, i) => `<div class="sl__plate" data-i="${i}" style="--i:${i}"><svg viewBox="0 0 ${W} ${H}"><defs><clipPath id="slc-${i}"><path d="${OUTER}"/></clipPath></defs><path class="sl__fill" d="${OUTER}"/><g class="sl__pat" clip-path="url(#slc-${i})">${pats[i]()}</g><path class="sl__shape" d="${OUTER}" fill="none"/></svg></div>`).join('');
  },
  SAFE_LIST: () => SAFETY.map((s, i) => `<li class="sl__item" data-i="${i}"><p class="sl__name">${s.name}</p><p class="t-body">${s.line}</p></li>`).join(''),
  DOCK_A: () => `<path d="M830 334.5L1055 334.5Q1098 336.5 1100 374.5L1100 340.5L1225 340.5L1225 760.5L830 760.5Q740 760.5 740 672.5L740 424.5Q740 334.5 830 334.5Z M900 438.5L1045 438.5L1090 482.5L1090 612.5L1045 657.5L900 657.5Q875 657.5 875 632.5L875 464.5Q875 438.5 900 438.5Z" fill-rule="evenodd"/>`,
  DOCK_FUNCS: () => {
    const ic = {
      auto: '<path d="M8 30h32M14 30l6-12h8l6 12M18 36a3 3 0 1 0 0-.1M30 36a3 3 0 1 0 0-.1"/><path d="M24 8v6M19 11h10"/>',
      charge: '<rect x="12" y="10" width="24" height="30" rx="3"/><path d="M26 16l-6 9h8l-6 9"/>',
      h2: '<circle cx="17" cy="24" r="8"/><circle cx="31" cy="24" r="8"/><path d="M14 24h6M17 21v6M28 24h6"/>',
      fuel: '<path d="M12 40V12h16v28M28 18h6l4 6v12a2 2 0 0 1-4 0V28h-6"/><path d="M16 18h8"/>',
      logi: '<rect x="8" y="16" width="16" height="14"/><rect x="24" y="22" width="16" height="14"/><path d="M8 40h32"/>',
      maint: '<path d="M30 10a8 8 0 0 0-9 11L10 32l6 6 11-11a8 8 0 0 0 11-9l-5 5-5-1-1-5z"/>',
    };
    return [['auto', 'Autonomous transport', 'Ground vehicles move people and loads around the pad without a driver.'], ['charge', 'Charging', 'Power for aircraft and cars, from aerVolt solar.'], ['h2', 'Green hydrogen', 'Produced on site, from sunlight and water.'], ['fuel', 'Refuelling', 'Hydrogen into the aircraft, between flights.'], ['logi', 'Logistics', 'Cargo in, cargo out, sorted at the dock.'], ['maint', 'Maintenance', 'Checks and repairs where the aircraft already is.']]
      .map(([k, t, d]) => `<li class="fn" data-reveal="rise"><svg viewBox="0 0 48 48" aria-hidden="true">${ic[k]}</svg><span class="fn__name">${t}</span><span class="fn__d">${d}</span></li>`).join('');
  },
  PHASES: () => PHASES.map((p, i) => `<li><button class="ph${i ? '' : ' is-on'}" type="button" data-phase="${i}" aria-pressed="${i ? 'false' : 'true'}"><span class="ph__k meta">Phase ${['one', 'two', 'three', 'four'][i]}</span><span class="ph__name">${p.name}</span><span class="ph__line">${p.line}</span><i class="ph__bar"><b></b></i></button></li>`).join(''),
  ICAO_LIST: () => Object.entries(ICAO).map(([c, k]) => `<li><b>${k}</b> ${c}</li>`).join(''),
  NEWS_CARDS: () => NEWS.map((n, i) => `<a class="nc nc--${i}" href="${n.url}" target="_blank" rel="noopener" data-cursor="Read"><figure class="nc__media frame"><img src="${n.img}" alt="" loading="lazy"></figure><span class="nc__meta"><span class="tag">${n.catLabel}</span><span class="meta">${n.label} · ${n.source}</span></span><span class="nc__title">${n.title}</span><span class="nc__body t-body">${n.body}</span><span class="nc__go meta">Read on ${n.source} ${EXT}</span></a>`).join(''),
  // aerWing page
  AW_VIEWS: () => [['side', 'Side', 'v-side.webp'], ['three', '3/4', 'v-three.webp'], ['front', 'Front', 'v-front.webp'], ['top', 'Plan', 'v-top.webp'], ['hover', 'Above', 'v-hover.webp']]
    .map(([k, l, f], i) => `<img class="iv__img iv__img--${k}${i ? '' : ' is-on'}" src="media/cut/${f}" alt="aerWing, ${l.toLowerCase()} view" data-view="${i}"${i ? ' loading="lazy"' : ' fetchpriority="high"'} draggable="false">`).join(''),
  AW_TABS: () => ['Side', '3/4', 'Front', 'Plan', 'Above'].map((l, i) => `<button type="button" class="iv__tab${i ? '' : ' is-on'}" data-view-btn="${i}" aria-pressed="${i ? 'false' : 'true'}"><span>${l}</span><i></i></button>`).join(''),
  AW_SPECS: () => SPECS.map((s) => `<li class="aws__item"><span class="meta">${s.label}</span><span class="aws__v">${s.unit ? `<b data-count="${s.value}">${s.value}</b><small>${s.unit}</small>` : `<b data-scramble="${s.value}">${s.value}</b>`}</span><span class="meta aws__s">${s.status === 'public' ? 'Public' : 'To confirm'}</span></li>`).join(''),
  AW_STACK: () => CONFIGS.map((c, i) => `<article class="stk__card" data-stk style="--i:${i}"><div class="stk__inner"><figure class="stk__media frame">${cfgMedia(c, true)}</figure><div class="stk__copy"><p class="tag">${c.use}</p><h3 class="t-xl">${c.name}</h3><p class="t-m stk__verb">${c.verb}</p><p class="t-body">${c.copy}</p><p class="meta stk__scene"><i></i>Scenario · ${c.scene}</p></div></div></article>`).join(''),
  HOTSPOTS: () => [
    ['Canopy', 'A single sweep of glass over the cabin.', 41, 30], ['Cabin', 'Seats for passengers, with a clear view out.', 45, 39],
    ['Controls', 'Flight controls and displays at the front of the cabin.', 33, 46], ['Storage', 'Space for luggage built into the hull.', 54, 56],
    ['Safety', 'Backup batteries, parachute recovery, cold gas thrusters, collision avoidance and fire safety.', 47, 51],
    ['Energy', 'Hydrogen energy, stored in the body of the aircraft.', 62, 47], ['Propulsion', 'Ducted electric fans in the tail and in the wings.', 71, 34],
    ['Sensors', 'Sensors around the airframe read the airspace.', 27, 54],
  ].map(([t, b, x, y], i) => `<button class="hs${i ? '' : ' is-on'}" type="button" style="--x:${x}%;--y:${y}%" data-hs="${i}" data-title="${esc(t)}" data-body="${esc(b)}" aria-label="${esc(t)}"><span class="hs__dot">${PLUS}</span></button>`).join(''),
  TECH_PANELS: () => {
    const vis = {
      vtol: `<svg viewBox="0 0 400 300" class="tv tv--vtol"><ellipse cx="200" cy="262" rx="150" ry="18" class="pad"/><ellipse cx="200" cy="262" rx="95" ry="11" class="pad pad--in"/><g class="bob"><image href="media/cut/v-side.webp" x="60" y="104" width="280" height="91"/>${[150, 215, 262].map((x) => `<path class="arrow" d="M${x} 236V214M${x - 8} 222L${x} 212L${x + 8} 222"/>`).join('')}</g></svg>`,
      h2: `<svg viewBox="0 0 400 300" class="tv tv--h2"><path id="h2p" class="track" d="M40 220C110 220 110 80 200 80S290 220 360 220"/>${[0, 1, 2, 3, 4].map((i) => `<circle r="4" class="pkt"><animateMotion dur="3.2s" begin="${i * 0.64}s" repeatCount="indefinite"><mpath href="#h2p"/></animateMotion></circle>`).join('')}<g class="node" transform="translate(40 220)"><circle r="26"/><text dy="4" text-anchor="middle">SUN</text></g><g class="node node--on" transform="translate(200 80)"><circle r="30"/><text dy="4" text-anchor="middle">H₂</text></g><g class="node" transform="translate(360 220)"><circle r="26"/><text dy="4" text-anchor="middle">WING</text></g><text x="40" y="270" text-anchor="middle" class="cap">aerVolt</text><text x="200" y="38" text-anchor="middle" class="cap">aerDock</text><text x="360" y="270" text-anchor="middle" class="cap">aerWing</text></svg>`,
      prop: `<svg viewBox="0 0 400 300" class="tv tv--prop"><circle cx="200" cy="150" r="118" class="duct"/><circle cx="200" cy="150" r="102" class="duct duct--in"/><g class="blades">${[0, 72, 144, 216, 288].map((a) => `<path transform="rotate(${a} 200 150)" d="M200 150C214 120 214 80 200 52C190 80 188 120 200 150Z"/>`).join('')}</g><circle cx="200" cy="150" r="14" class="hub"/></svg>`,
      smart: `<svg viewBox="0 0 400 300" class="tv tv--smart"><circle cx="200" cy="150" r="120" class="rr"/><circle cx="200" cy="150" r="80" class="rr"/><circle cx="200" cy="150" r="40" class="rr"/><g class="sweep"><path d="M200 150L200 30A120 120 0 0 1 304 90Z"/></g>${[[140, 92], [282, 182], [226, 236], [120, 196]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" class="blip" style="animation-delay:${i * 0.7}s"/>`).join('')}<image href="media/cut/v-top.webp" x="166" y="134" width="68" height="32"/></svg>`,
      aero: `<svg viewBox="0 0 400 300" class="tv tv--aero"><g class="aero-craft">${TOP.paths.filter((p) => p[0] === 'o').map((p) => `<path d="${p[1]}" transform="translate(70 95) scale(${260 / W})"/>`).join('')}</g>${[40, 90, 140, 200, 260, 310, 360].map((x) => { const amp = Math.round((200 - Math.abs(x - 200)) * 0.18) * (x < 200 ? -1 : 1); return `<path class="air" d="M${x} 320C${x} 240 ${x + amp} 200 ${x + amp} 150S${x} 60 ${x} -20"/>`; }).join('')}</svg>`,
    };
    const items = [['vtol', 'Vertical *take-off*', 'No runway. aerWing lifts straight up from the pad and lands the same way, so a dock fits where an airport never could.'],
      ['h2', 'Hydrogen *energy*', 'aerVolt solar powers the dock, the dock produces green hydrogen, and the hydrogen powers the aircraft.'],
      ['prop', 'Electric *propulsion*', 'Ducted electric fans set into the wings and the tail. The ducts keep the blades enclosed.'],
      ['smart', 'Smart *systems*', 'Sensors read the airspace around the aircraft, and aerOS keeps it in step with the docks and the network.'],
      ['aero', 'One *wing*', 'The body is the wing: one continuous surface from the nose to the wingtips.']];
    return items.map(([k, t, b]) => `<article class="hp"><div class="hp__vis">${vis[k]}</div><div class="hp__copy"><h3 class="t-l">${em(t)}</h3><p class="t-body">${b}</p></div></article>`).join('');
  },
  SAFETY_ROWS: () => SAFETY.map((s, i) => `<li class="sr-row" data-reveal="rise"><span class="sr-row__k meta">Layer ${['one', 'two', 'three', 'four', 'five'][i]}</span><span class="sr-row__name">${s.name}</span><span class="sr-row__line t-body">${s.line}</span></li>`).join(''),
  AW_GALLERY: () => ['studio-hover', 'g-dusk', 'sky-pass', 'nose', 'studio-pod', 'g-coast', 'wing-edge', 'dock-glass', 'side-macro', 'g-shore', 'studio-rear', 'wing-top-macro']
    .map((g, i) => `<figure class="strip__item${i % 3 === 1 ? ' is-tall' : ''}" data-lightbox><img src="media/img/${g}.webp" alt="" loading="lazy" draggable="false"></figure>`).join(''),
  AD_GALLERY: () => ['dock-mountain', 'g-dock-sea', 'dock-horizon', 'dock-side', 'dock-remote-1', 'dock-bridge', 'dock-pad', 'dock-remote-2', 'studio-dock']
    .map((g, i) => `<figure class="strip__item${i % 3 === 1 ? ' is-tall' : ''}" data-lightbox><img src="media/img/${g}.webp" alt="" loading="lazy" draggable="false"></figure>`).join(''),
  AD_SERVICES: () => [['svc-fuel', 'Hydrogen', 'Green hydrogen, made and dispensed on site.'], ['svc-solar', 'Solar', 'aerVolt panels over the dock roof.'], ['svc-med', 'Medical', 'A bay for aerCare flights and handovers.'], ['svc-oxygen', 'Oxygen', 'Medical oxygen supply for care missions.']]
    .map(([f, t, d], i) => `<li class="svc${i ? '' : ' is-on'}" tabindex="0"><img src="media/img/${f}.webp" alt="" loading="lazy"><span class="svc__lab"><span class="svc__t">${t}</span><span class="svc__d">${d}</span></span></li>`).join(''),
  JOURNEY_CAPS: () => [['Drive in', 'aerCar brings you to the dock.'], ['The dock', 'Solar roof above, landing pad at its heart.'], ['On the pad', 'aerWing waits, fans set into the wing.'], ['Overhead', 'Aircraft come and go above the glass.'], ['Onward', 'The car carries on through the dock.']]
    .map(([t, d], i) => `<li data-i="${i}"${i ? '' : ' class="is-on"'}><span class="t-l">${t}</span><span class="t-body">${d}</span></li>`).join(''),
  PLANE: () => PLANE_SIDE,
  SIDE_LINES: () => outlineSvg('side-lines', SIDE),
};

const fill = (html) => html
  .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (PARTS[k] ? PARTS[k]() : m))
  .replace(/\{\{ARROW\}\}/g, ARROW).replace(/\{\{EXT\}\}/g, EXT).replace(/\{\{PLUS\}\}/g, PLUS)
  .replace(/\{\{BTN:([^|}]+)\|([^|}]+)\|?([^}]*)\}\}/g, (_, l, h, k) => btn(l, h, k || ''));

for (const f of fs.readdirSync(path.join(root, 'templates'))) {
  if (!f.endsWith('.html')) continue;
  const raw = read(`templates/${f}`);
  const meta = JSON.parse(raw.match(/<!--META ([\s\S]*?)-->/)[1]);
  const body = fill(raw.replace(/<!--META [\s\S]*?-->/, ''));
  fs.writeFileSync(path.join(root, f), doc({ ...meta, body }));
}
for (const c of CHAPTERS) fs.writeFileSync(path.join(root, `${c.slug}.html`), chapter(c));

// favicon: ink tile with the plan-view silhouette
fs.writeFileSync(path.join(root, 'public/media/brand/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#EEF1F3"/><g transform="translate(6 20) scale(${52 / W})"><path d="${OUTER}" fill="#0E1216"/></g><circle cx="52" cy="12" r="4" fill="#0A6C86"/></svg>`);
console.log('pages generated:', fs.readdirSync(root).filter((f) => f.endsWith('.html')).length, 'titles:', titleOf('index'));
