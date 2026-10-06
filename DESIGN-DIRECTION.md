# aerpace — Design Direction v3 "Quiet Sky"

Audit date: 2026-10-06. Rendered on Vite dev at 1440×900 and 390×844 (Playwright), every claim below comes from a screenshot or a measurement, not from reading CSS.

Acceptance criteria from the client brief (verbal, 2026-10-06):
- No section numbering anywhere (no 01/02, no A–E marks, no "Phase one", no "Fig. B", no frame counters, no loader percent).
- The product is electric. Nothing on the site may read as smoke, exhaust or combustion.
- Loader and scroll must feel smooth.
- Desktop, tablet and mobile all designed; mobile content centred.
- The visitor must feel the product. Creative, but one coherent language, no mix of styles.
- Copy reviewed too.

---

## 1 Design audit

### Loader
- Takes about 5 s before any content on a first visit: a 2.6 s minimum, then roughly 2.4 s of fill, fade and lift-off (`src/js/core/loader.js`). A premium brand earns at most around 1.2 s.
- A large `74%` / `100%` counter fills the bottom-right corner. It is a number, it is the loudest thing on screen, and at 100% it turns grey, so the finish looks like a failure.
- The checklist ("AIRFRAME ……… OK") reads as a debug log, not as a brand moment.
- On exit, a dark sliver of the lifting aircraft stays clipped at the top centre of the hero (screenshot at 5.0 s).

### Hero
- The WebGL fluid (`src/js/core/fluid.js`) renders as **grey marbled smoke** over the whole viewport. On mobile it turns into dark ink swirls. For an electric aircraft this is the single most damaging visual on the site: it says exhaust.
- The descender of "change." is clipped by `.hl { overflow: hidden }`; the "g" is cut off at 1440 px.
- On mobile the aircraft sits on top of the lede: "aerWing rises straight up fro…" is cut by the render and "Why the sky" falls off the right edge.
- "ALT 0000 M" HUD is a number with no meaning at rest.
- The headline, "Travel is about to change.", could belong to any mobility startup. It says nothing about lift, silence or clean power.

### Rhythm and length
- The homepage is **27,060 px tall on desktop (30 screens) and 25,043 px on mobile (30 screens)**. Twelve sections compete; nothing is allowed to be the peak.
- Dead zones: about 600 px of empty paper after the dock functions and before the network map; an empty band between the news and the vision film; the blueprint section shows a grid with only a heading for a full screen.
- The same top-view render (`v-top.webp`) appears four times: loader, blueprint, technology board and safety stack. By the third it no longer registers.

### Numbering and document noise (direct conflict with the brief)
- Letter marks A–E on the blueprint, "REF A–F" in the spec sheet, "PHASE ONE…FOUR" in the network, "Fig. A / Fig. B", "049 / 159" on aerDock, codes "DRV / TXI / CRE / CGO" in configurations, and the loader percent.
- Bracket tags `[ ■ TAG ]` plus a hairline rule with "+" crosshairs top every section. Repeated twelve times, they stop meaning "document" and start looking like a template.

### Broken renders
- Blueprint spec card was caught showing **"HR"** for "H₂" and **"499 km"** for 500. Both were probably mid-animation frames (the scramble and the count-up run 1.1–1.8 s), but a random-letter scramble on "H₂" reads as a typo to anyone who scrolls past mid-effect.
- Mobile blueprint: two spec cards are drawn on top of each other ("VTOL" over "HC", "500 km" over "1.5 t").
- The flight-line aircraft icon (`src/js/core/flightline.js`) sits on the page edge over content at a dozen scroll positions. At thumbnail size it reads as a black bug, not a plane.
- Horizontal overflow on mobile: `.mf__pin` to 438 px, `.eng__thumb` to 400 px, an SVG to 499 px, on a 390 px viewport.

### Colour
- Warm cream paper `#F3F1EC` against cold blue-grey renders: every product image looks pasted on the page rather than lit by it.
- The only accent, orange `#FF5A1F`, reads as heat and flame next to the smoke hero. Combined, the palette says combustion.
- Contrast: the `--ink-3` meta text `#8C9198` on paper measures 2.8:1 and is used for running labels at 11 px. That fails WCAG 2.2 AA (4.5:1).

### Type
- Every heading follows the same formula: UPPERCASE Geist plus one italic serif word. Twelve times in a row it becomes a tic.
- All-caps display headings at 12 rem shout. The renders are quiet, so the type should be too.

### Motion and smoothness
- During wheel scroll at 1440 px: average frame time 23.4 ms (about 43 fps), 34 frames over 33 ms, 8 long tasks. Headless numbers run high in absolute terms, but the cause is real: a WebGL fluid sim, a city canvas, the flight line and four videos all tick on the same GSAP ticker.
- "Everything fades or rises on scroll" via `data-reveal`: the most generic motion pattern there is.
- Three CTAs in the final section. One primary and one ghost is the maximum.

### Mobile
- Mobile is a compressed desktop: left-aligned, with sticky stages squeezed to 390 px. The brief asks for centred content.
- The technology section shows the plan view six times in a row on mobile.

### What is already strong (keep it)
- The client renders and films: cinematic, monochrome, cold daylight. They are the brand.
- The "road vs air" idea in Why the sky: a real argument, uniquely told.
- The exploded safety layers: the best moment on the site.
- The aerDock "a" opening into the arrival film.
- The inner aerWing view inspector and the aerDock torch hero.

---

## 2 Creative direction

**Organising idea: an electric aircraft is defined by what it leaves out.** No runway. No noise. No smoke. No traffic. The site speaks the same way: quiet, cold daylight, a lot of air, and one luminous accent, the glow of a ducted fan under charge. Every major section opens with a subtraction ("No runway.", "Nothing behind it but water."), and the visual signature is the **landing-pad ring**, the concentric circles already present in the client's own arrival and lift-off renders. Rings are the loader (a charge ring closing), the hero (clean pressure rings pulsing from the pad under a hovering aircraft, in place of smoke), the section transitions, and the final call to action (the pad you land on). References from outside the category: the restraint of Braun product sheets (Dieter Rams), the cold atmospheric grade of Denis Villeneuve's *Blade Runner 2049* daylight scenes, and the ring-based wayfinding of airport apron markings. The feeling ten seconds after landing should be: *calm, clean, it actually lifts*.

---

## 3 Design system snapshot

### Type
| Role | Font | Why |
|---|---|---|
| Display + text | Geist Variable, sentence case, weight 500, tracking −0.04em at display sizes | Already self-hosted; sentence case lowers the volume to match the renders |
| One accent moment | Instrument Serif italic, only in the vision quote | Scarcity makes it count. Remove the italic-word formula everywhere else |
| Labels | Geist Mono, 12 px minimum, no brackets | Precision without the document cosplay |

Scale (desktop / mobile): display 9.5 / 3.2 rem · h2 4.5 / 2.3 rem · h3 2 / 1.5 rem · lede 1.35 / 1.12 rem · body 1.05 / 1 rem · label 0.75 rem.

### Colour
| Token | Hex | Rationale |
|---|---|---|
| `--cloud` | `#EEF1F3` | Cool daylight ground that matches the render grade (replaces warm paper) |
| `--cloud-2` | `#E3E8EB` | Alternate light band |
| `--ink` | `#0E1216` | Text on light |
| `--ink-2` | `#3E4750` | Secondary text, 8.3:1 on cloud |
| `--ink-3` | `#5E6872` | Labels, 5.0:1 on cloud (fixes the 2.8:1 failure) |
| `--night` | `#0A0D10` | Dark stage for dock, safety, footer |
| `--charge` | `#7CE3FF` | Luminous accent: fan glow, rings, focus on dark. Light only, never body text on light |
| `--charge-ink` | `#0A6C86` | Accent when it must be text or a stroke on light, 5.3:1 on cloud |

Ratio: 60 cloud / 30 night / 10 charge. Orange is retired; it reads as flame.

### Motion vocabulary
- One ease for entrances, `cubic-bezier(.16, 1, .3, 1)`; one for scrubbed stages, linear on progress.
- Durations: hover 150 ms, UI 240 ms, entrances 700 ms, never more than 900 ms.
- Ring pulse: scale 0.6→1.6, opacity 0.5→0, 2.4 s, only while the hero is in view.
- Animate only transform, opacity and clip-path. No layout properties.
- One ticker owner: every rAF loop registers through `whileVisible` and stops off-screen.
- `prefers-reduced-motion`: no loader, no pulses, no scrub; 150 ms opacity only.

### Surfaces
- No paper grain overlay (it reads as dust on the renders).
- Glass only for the nav pill: `backdrop-filter: blur(16px) saturate(140%)` over `rgba(238,241,243,.72)`.
- Radius scale: 2 px for frames, 20 px for cards, 999 px for pills.

---

## 4 Section layout plan (homepage, target about 12 screens)

| Section | Pattern | Content hierarchy | Motion | The memorable decision |
|---|---|---|---|---|
| **Loader** | Full-bleed takeover | Emblem centred, one charge ring | Ring stroke closes in 0.9 s, then expands and clips open onto the hero. Repeat visits skip it | It looks like an EV charging, not a progress bar. No number |
| **Hero "Lift"** | Cinematic centre stage | Headline, aircraft, pad rings, lede, one CTA + ghost | Aircraft hovers (±6 px bob); rings pulse from the pad; the ducted fans glow `--charge`; the pointer tilts the craft ±3° | Clean rings replace smoke: the air it moves is visible, and it is clean |
| **Why the sky** | Sticky map stage, single screen | "No traffic." + map | Road route draws grey and stop-start, then the air route draws as one charge-coloured arc | No readouts: the drawing alone makes the case |
| **The aircraft** | Turntable | Five render angles, four spec chips | Scroll scrubs side → 3/4 → front → above; chips settle beside the craft | One plan view, used once, on purpose |
| **Clean power** | Loop diagram | "Nothing behind it but water." Sun → hydrogen → electricity → fans | One luminous line travels the loop on scroll | The zero-emission truth told as a closed circle; this replaces the smoke |
| **Configurations** | Index list + full-bleed media | Four names, one line each | Hover or tap swaps a full-bleed film or still behind the list | The list is the navigation and the picture is the answer |
| **Safety** | Exploded stack (kept) | Five layers | Layers separate on scroll; the active layer glows charge | Kept, recoloured, with mobile height halved |
| **aerDock** | Mask reveal (kept) | "Where the network touches down." | The "a" opens into the arrival film | Gap below removed; functions move to the aerDock page |
| **Network** | Map + stepper | Four stage names, no numbers | Routes draw per stage | Labels lose "Phase one…four" |
| **News** | One lead + two compact | Three items | None beyond hover | Keeps proof, costs one screen |
| **Vision + CTA** | Full-bleed film | Serif quote, then one primary + one ghost | Quote comes into focus; the pad ring receives the click | Merges two sections; ends on a pad |

**Moved off the homepage:** spec sheet and six-system technology board (to aerWing), six dock functions (to aerDock), ecosystem marquee (to the footer as a link row), flight-line plane (removed).

**Mobile:** centred text throughout, one column, sticky stages become stacked panels with a single in-view reveal, the hero aircraft sits above the headline, touch targets 44 px minimum, no hover-only information.

**Tablet (768–1024):** the desktop composition at 2 columns where content is side by side; sticky stages stay, at 80% height.

---

## 5 Component specs

**Nav pill.** Anatomy: wordmark, 5 links, "Talk to us". Hover: text to ink, 150 ms. Active: 2 px charge underline. Focus: 2 px `--charge-ink` ring, 3 px offset. Dark sections: pill inverts to night glass. Mobile: wordmark + 44 px menu button; full-screen menu, centred links at 2 rem, Escape closes, focus trapped.

**Primary button.** 52 px pill, ink fill, cloud text, trailing ring icon. Hover: the ring icon fills charge, 150 ms. Active: scale 0.98. Focus: the ring as above. On dark: cloud fill, ink text. Mobile: full width up to 320 px, centred.

**Ghost button.** Same anatomy, 1 px `--ink-3` border, transparent fill.

**Spec chip.** Label (mono, 12 px) above value (Geist 500, 2 rem) with a unit in `--ink-2`. No letters, no index. Mobile: 2×2 grid, centred.

**Pad ring.** SVG, three concentric circles, stroke 1 px `--charge-ink` on light and `--charge` on dark. Used by the loader, hero, CTA and section dividers. One component, one set of timings.

**Media frame.** 2 px radius, `object-fit: cover`, `aspect-ratio` fixed so nothing shifts, lazy below the fold, poster first for films.

---

## 6 Enhancement roadmap

1. **Hero + loader** (blocks everything): delete the fluid sim, build the ring field and the charge loader. Fixes smoke, the 5 s wait and most of the jank.
2. **Tokens + type**: cool palette, sentence case, no bracket tags, contrast fix. One file, site-wide effect.
3. **Homepage cut** from 30 screens to about 12, with the moves listed above.
4. **Mobile pass**: centring, overlap and overflow fixes, stacked stages.
5. **Inner pages**: apply the tokens, then strip numbering ("049 / 159", "Fig.").
6. **Copy pass**: headlines rewritten around subtraction; keep facts and sources unchanged.
7. **Scorecard**: Lighthouse and a11y on the built `dist/`.

### Four tests (target, to be checked on the build)
- **3-second:** "an aircraft hovering over glowing rings, no smoke, very calm."
- **Awwwards:** the ring system plus the turntable is the signature; without both, it is not there.
- **Apple:** twelve sections cut to about nine on the homepage; each kept one has a single job.
- **Emotional:** calm and clean, then "it actually lifts".

Next skill: `/apex-design-concepts` (per-section concepts from this direction), then `/apex-motion-systems`, then build, then `/apex-scorecard`.
