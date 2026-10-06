# aerpace website — Scorecard

Audit date: 2026-10-06 · Build audited: the production build (`vite build`, served by `vite preview`) after the "Quiet Sky" redesign.

## Needs action from someone else

- **Client: the production domain.** Canonical tags, the sitemap and `og:url` cannot be written without it.
- **Client: alt text and usage rights for the gallery photography**, including photographer credits for the Racers archive.
- **Client: confirm the three "To confirm" specs** (VTOL wording, 500 km range, 1.5 t maximum weight) before launch.
- **Dev/ops: a form backend.** Every form validates but sends nothing ("Prototype form · nothing is sent" is shown to visitors).

---

## Summary

| Dimension | Score | Band | Coverage |
|---|---|---|---|
| Accessibility | **72 / 100** | Solid, with specific gaps | 6 of 6 templates automated · keyboard walked on home + mega menu · no screen-reader pass |
| SEO | **84 / 100** | Solid, with specific gaps | 6 of 6 templates automated · all 20 pages grepped for head tags |
| Performance | **90 / 100** | Deliberate work | Lab only (no field data: the site is not public) · 3 templates throttled on mobile, home on desktop |
| Maintainability | **77 / 100** | Solid, with specific gaps | All source files read (`src/`, `scripts/`, `templates/`) |

There is deliberately no overall score. These four are owned and funded by different people, and an average would hide which one needs the money.

**The top three actions take under an hour together:** put the project under version control, make the gallery keyboard focus visible, and lift the muted text colour on dark sections to pass contrast. That removes the only two Critical findings and the most widespread contrast failure.

---

## Scope

- **URLs:** `index.html` (home), `aerwing.html`, `aerdock.html`, `aervolt.html` (eco chapter template), `about.html` (story chapter template), `contact.html` (doc chapter template). These six cover all six page templates. The other 14 pages are built from the same three chapter templates by `scripts/gen-pages.mjs`.
- **Viewports:** 390 × 844 mobile (DPR 2, touch) and 1440 × 900 desktop.
- **Conditions for performance:** cache disabled, 1.6 Mbps down / 150 ms RTT, CPU 4× slowdown (mobile). Desktop unthrottled.
- **Tools:** Lighthouse via Chrome DevTools MCP (accessibility, SEO, best practices; mobile), Playwright Chromium for timings, the keyboard walk and network capture, Chrome tracing for Layout/Paint counts, and manual code reading.
- **Not covered:** screen readers (NVDA, VoiceOver), Safari and Firefox, real devices, field Core Web Vitals (CrUX), the 14 pages not listed above beyond the shared head-tag grep, the page-transition curtain, and security.

---

## Top ten — ranked by impact over cost

| Rank | Finding | Severity | Cost | Dimension |
|---|---|---|---|---|
| 1 | The project is not under version control | Critical | Minutes | Maintainability |
| 2 | Gallery strip takes keyboard focus but shows no focus indicator | Critical | Minutes | Accessibility |
| 3 | Muted text on dark sections is 3.98:1 (footer labels, inactive Clean power items) | Major | Minutes | Accessibility |
| 4 | Topic chips on forms use a cyan focus ring at 1.3:1 on the light background | Major | Minutes | Accessibility |
| 5 | Hidden mega-menu images (~1.5 MB) download on every desktop page load | Major | Minutes | Performance |
| 6 | No `robots.txt` or `sitemap.xml` | Major | Minutes | SEO |
| 7 | No `og:image` / Twitter card, and no canonical tags | Major | Minutes (after domain) | SEO |
| 8 | Form fields show focus only as a 1 px bottom-border colour change | Major | Hours | Accessibility |
| 9 | Dead code left by the redesign: `flightline.js`, its CSS, `ENGINEERING` data | Major | Minutes | Maintainability |
| 10 | No Organization structured data for a BSE-listed company | Major | Hours | SEO |

Ranks 1–7 and 9 are roughly a morning's work. Rank 7 waits on the client's domain; the image part of it does not.

Next after the ten: gallery alt text (needs client copy), tokenising 145 hard-coded colours (days), re-encoding the two heaviest images (hours).

---

## Accessibility — 72 / 100

**Coverage:** Lighthouse on 6 of 6 templates (mobile). Keyboard tab order walked for 40 stops on the home page at 1440 px. Mega menu opened with Enter and closed with Escape. No screen-reader pass.

**Working:**
- One `<h1>` on every one of the 20 pages.
- A skip link is the first tab stop. Tab order follows the visual order through nav, hero, turntable tabs, Clean power items, configurations, network phases, news, CTA and footer.
- Every focused control on the home page showed a visible outline, except the two cases below.
- The mega menu sets `aria-expanded`, closes on Escape and returns focus to its button.
- Configurations is a real `tablist` with `aria-selected`, roving `tabindex` and arrow-key support.
- With `prefers-reduced-motion` the loader is skipped and the scroll scenes do not run. The page loaded with zero errors.
- Body and label contrast on the light grounds passes after the redesign: `--ink-3` is 5.0:1 on `--paper`, up from 2.8:1 before.

**Findings** (score: 100 − 10 Critical − 4 × 4 Major − 2 × 1 Minor = 72):

1. **Critical — Gallery strip has no visible keyboard focus.**
   Where: `.strip__track` on aerWing, aerDock and every chapter page with a gallery. `src/js/core/ui.js:23` sets `tabindex="0"` and `src/styles/chrome.css:229` sets `outline: none`. Lighthouse also flags the `aria-label` on a `div` with no role.
   Impact: a keyboard user tabs into the gallery and the focus disappears. They cannot tell where they are, or that arrow keys now move the strip.
   Fix: remove `outline: none`, add `role="region"` (minutes).
2. **Major — Muted text on dark grounds measures 3.98:1.**
   Where: `--fg-3` in `[data-theme="night"]` (`rgba(238,241,243,.44)` on `#0A0D10`). This covers the footer column labels on every page (11 nodes) and the inactive Clean power items on home.
   Impact: low-vision users lose the footer group headings and three of the four Clean power steps.
   Fix: raise to `.6`, which measures 6.5:1 (minutes).
3. **Major — Chip focus ring is 1.3:1.**
   Where: `src/styles/chrome.css:204` uses `var(--signal)` (`#7CE3FF`) on the light form background, on Contact and Careers. This regression came from the palette swap in the redesign.
   Impact: keyboard users cannot see which topic chip has focus.
   Fix: use `var(--signal-ink)` (minutes).
4. **Major — Form fields rely on a 1 px border colour change for focus.**
   Where: `src/styles/chrome.css:187-190` and the newsletter input at `:108`, which also has `outline: none`.
   Impact: the focused field is hard to find, especially on the dark footer.
   Fix: a 2 px underline or an outline on `:focus-visible` (hours, because it touches every form).
5. **Major — Gallery and lightbox images have empty `alt`.**
   Where: the `gallery()` and `AW_GALLERY`/`AD_GALLERY` output in `scripts/gen-pages.mjs`.
   Impact: a screen-reader user who opens the lightbox ("Image viewer") hears nothing about the image.
   Fix: needs alt copy from the client (hours once the copy exists).
6. **Major — aerWing view tabs fail contrast in their inactive state.**
   Where: `.iv__tab span` (Lighthouse, 2 nodes).
   Fix: minutes.
7. **Minor — Scroll-scrubbed statement words start at 6–12 % opacity.**
   Where: `.stmt` and the vision quote. Lighthouse counted 19 nodes, measured before scrolling.
   Impact: readers who stop mid-scroll see faint words. Reduced-motion users get full text.
8. **Minor — The global focus ring computed at 1.6 px in Chromium** against the declared 2 px. Not investigated.

**What only the manual pass found:** finding 1 (Lighthouse caught the ARIA attribute but not the missing focus) and findings 3 and 4.

---

## SEO — 84 / 100

**Coverage:** Lighthouse SEO on 6 of 6 templates. Head tags grepped across all 20 built pages.

**Working:**
- Unique `<title>` and meta description per page.
- `lang="en"`, one `<h1>` per page, and crawlable `<a href>` navigation between all 20 pages.
- Every news item links to its third-party source.
- The home title and description now describe the product ("hydrogen-electric VTOL", "ducted electric fans").

**Findings** (100 − 4 × 4 Major = 84):

1. **Major — No `robots.txt` and no `sitemap.xml`.** `public/` holds only `media/`. The preview server answers `/robots.txt` with the HTML page, which Lighthouse reports as 344 syntax errors. Fix: add both to `public/` (minutes; the sitemap needs the domain).
2. **Major — No `og:image` and no Twitter card on any page.** `og:title` and `og:description` exist. Impact: links shared on LinkedIn or WhatsApp show no image, which is the main way investor and press links travel. Fix: minutes.
3. **Major — No canonical tags.** With 20 static pages and `.html` URLs, duplicates such as `/` and `/index.html` are likely. Fix: minutes, once the domain is known.
4. **Major — No structured data.** A BSE-listed company (scrip 534733) with a Pune hub has no Organization JSON-LD to tie the name, listing and logo together. Fix: hours.

Not counted: Lighthouse's `llms.txt` warning. It came from the same HTML fallback as finding 1, and no file was ever intended.

---

## Performance — 90 / 100

**Coverage:** lab only. Mobile throttled on home, aerWing and About; desktop on home. No field data, because the site is not public yet. The band is indicative until CrUX data exists.

**Measured (mobile, Slow-4G class network, 4× CPU, cache off):**

| Page | FCP | LCP | CLS | Transferred in first 6 s |
|---|---|---|---|---|
| Home | 1.81 s | 2.08 s (hero aircraft) | 0.03 | 464 KB |
| aerWing | 1.72 s | 2.08 s (view inspector image) | 0.00 | 537 KB |
| About | 1.29 s | 1.29 s (lede) | 0.00 | 486 KB |

Desktop home: LCP 2.18 s, CLS 0.001, but **2.1 MB** transferred and the `load` event at 12.1 s (see finding 1).

**Working:**
- LCP under 2.5 s on every page measured, even under throttling.
- CLS stays at or below 0.03.
- Each page loads one CSS file and two JS chunks (main 78.8 KB gzip plus a small page chunk).
- After the motion pass, the idle hero runs at 2 Layout and 5 Paint events per 2 s, down from 242 and 486. Scrolling the home page averaged 8.5 ms per frame with 0 long tasks (headless Chromium).

**Findings** (100 − 2 × 4 Major − 2 × 1 Minor = 90):

1. **Major — The mega-menu preview images download on every desktop page.** `volt-plants.webp` (604 KB), `dock-core-day.webp` (423 KB), `racers-07.webp` (165 KB) and others, about 1.5 MB in all. They sit in the fixed header, so `loading="lazy"` does not hold them back. Impact: on a metered or slow connection, most of the first download is images nobody has asked to see. Fix: set `src` on first menu open (minutes).
2. **Major — Oversized single images.** `volt-plants.webp` is 604 KB and `dock-core-day.webp` 423 KB. Fix: re-encode at display size (hours across the media set).
3. **Minor — Below-the-fold cut-outs load eagerly.** The first turntable view and the safety top view (`v-top.webp`, 65 KB) have no `loading="lazy"`. Fix: minutes.
4. **Minor — Three list widgets animate `max-height` on state change:** the safety list, Clean power and network phases. It runs once per change, not per frame.

---

## Maintainability — 77 / 100

**Coverage:** all of `src/`, `scripts/gen-pages.mjs` and `templates/` read. This dimension has no automated floor.

**Working:**
- One generator builds all 20 pages from two data files (`src/data/site.js`, `src/data/chapters.js`). Content edits happen in one place.
- Colour, type, radius and easing tokens sit at the top of `src/styles/base.css` and are used 385 times across the four stylesheets.
- The page code is split per template and lazy-loaded (`src/main.js`).
- Every scroll scene checks `reduced` before creating triggers, a pattern a new developer can copy.

**Findings** (100 − 10 Critical − 3 × 4 Major − 1 Minor = 77):

1. **Critical — No version control.** The folder is not a git repository. Today's redesign touched about 15 files and has no diff, no history and no way to roll back. Impact: one bad edit, or a regenerated root `.html` file, cannot be undone. Fix: `git init` and a first commit (minutes).
2. **Major — 145 hard-coded colours outside the token block:** 22 hex values and 99 `rgba()` literals in CSS, plus 24 in `manifesto.js` and `chapter.js`. The palette change in this redesign needed a regex replace across 7 files. Impact: the next palette or contrast fix costs the same again, and contrast regressions such as accessibility finding 3 slip in. Fix: days.
3. **Major — Dead code from the old design:** `src/js/core/flightline.js` (124 lines, imported nowhere), its CSS in `chrome.css`, and the `ENGINEERING` export in `site.js`. Fix: minutes.
4. **Major — No lint, type check or tests.** All verification in this redesign was manual in a browser. Fix: hours for a lint step and a Playwright smoke test that loads each template.
5. **Minor — The 20 generated `*.html` files sit at the project root next to the sources.** The README says never to edit them, but nothing enforces it.

---

## Appendix

**Evidence pack:** `scorecard-evidence/lighthouse-*-m.html` holds the six Lighthouse reports (mobile, navigation mode, 2026-10-06). Timing, keyboard and network captures were run as Playwright scripts against `http://localhost:4173` and their output is quoted in the tables above.

**Method notes:**
- Scores follow the deduction scheme Blocker −25, Critical −10, Major −4, Minor −1. No score was adjusted after the arithmetic.
- Contrast ratios were computed with the WCAG relative-luminance formula against the actual token values.
- Lighthouse's "Agentic Browsing" category (33–67) was recorded but not scored. It is not one of the four dimensions.

**Re-audit:** re-run the same six URLs under the same throttling after the top ten are done. Fixes 2, 3 and 4 should take accessibility to the high 80s. Add field data once the site is public.
