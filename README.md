# aerpace · website prototype v2 ("Open Air")

A 20-page clickable prototype for aerpace: a scroll-driven homepage, two deep product pages (aerWing, aerDock) and 17 chapter pages in three templates, all generated from data files.

## Run it

```bash
npm install
npm run dev      # generates the HTML pages, then starts Vite on http://localhost:5173
npm run build    # generates pages + production build into dist/
npm run preview  # serves dist/
```

`dist/` is plain static files with relative paths. Upload it to any host (Vercel, Netlify, S3, cPanel) or a sub-folder.

## What happens on each page

| Page | Sections and interactions |
|---|---|
| `index.html` | **Loader:** the plan view draws itself, the fans spin up, the checklist clears and the aircraft lifts away.<br>**Hero:** a real-time WebGL fluid simulation. aerWing's fans push air down into the ground, and the pointer stirs it.<br>**Why the sky:** a procedural city map. The road route is found on the street graph (a river with two bridges forces the detour), then the air route draws as one arc. The readouts are measured from the drawing itself.<br>**The aircraft:** a blueprint. The outline draws, the fans spin, the render fills in, and callouts A–E pin to the airframe.<br>**Configurations:** an index list with a preview that follows the cursor; rows expand.<br>**Technology:** a sticky drawing board that changes for each of the six chapters.<br>**Safety:** five layers of the aircraft separate in 3D as you scroll.<br>**aerDock:** the "a" of the dock opens into the film.<br>**India network:** ICAO-labelled hubs and phases that play automatically.<br>**Also:** a specification sheet (public vs to-confirm), an ecosystem marquee that reacts to scroll speed, news, the vision line (words come into focus) and the call to action.<br>**Flight line:** a dotted route runs down the page and a small aircraft flies along it as you scroll. It passes behind the immersive sections and lands on the pad in the call to action. |
| `aerwing.html` | View inspector: side, 3/4, front, plan and above. Drag, tabs, arrow keys or autoplay. Spec strip, stacked configuration cards, cabin hotspots, a horizontal technology track on a sticky stage, safety layers and a drag gallery with lightbox. |
| `aerdock.html` | Torch hero: the pointer lights the dock in daylight and the "a" traces itself. A 160-frame scroll journey, six functions, a services accordion, films that play on hover, sites gallery and a host CTA. |
| Chapter pages | **eco** (aerVerse, aerCar, aerVolt, aerShield, aerOS): split hero with key facts, rows with a sticky image that changes with the text.<br>**story** (About, R&D, Projects, Racers, #MakeTime, Sustainability): full-bleed hero that settles into a frame as you scroll, editorial rows in three rhythms.<br>**doc** (Newsroom, Events, Investors, Careers, Resources, Contact): document header, no image hero.<br>Extras: timeline, orbit, tabs, aerOS live graph, news filters with an image that follows the cursor, forms with validation. |

Site-wide:

- **Navigation:** a glass pill with a sliding highlight, mega cards with image preview, and the live time in Pune. Below 960px it becomes a full-screen menu.
- **Page transitions:** a short "flight" to the next page that shows the destination's name.
- **Footer:** newsletter form, live clock and a wordmark that rises into place.
- **Scrolling and motion:** Lenis smooth scroll and GSAP ScrollTrigger. Long sections are CSS `position: sticky` stages scrubbed by scroll, not pinned, so the page height never jumps.
- **Reduced motion:** every effect has a `prefers-reduced-motion` fallback.

## Where things live

```
templates/            index, aerwing, aerdock page bodies ({{PLACEHOLDERS}} are filled from data)
scripts/gen-pages.mjs builds every root *.html page: header, mega menus, footer, loader, curtain, 17 chapter pages
src/data/site.js      specs, configurations, safety, phases, ICAO codes, routes, news   ← edit content here
src/data/chapters.js  the 17 chapter pages (variant, copy, facts, sources)          ← and here
src/styles/           base (tokens + type), chrome (nav, footer, loader, transitions), home, pages
src/js/core/          scroll, reveals, chrome, loader, flight line, WebGL fluid, forms/gallery
src/js/home/          hero, manifesto (city), blueprint, sections (configs, tech, safety, dock, network, marquee)
src/js/pages/         page entry modules
public/media/         graded imagery, cutouts, vector outlines, films, image sequence, India map data, logo
tools/                Python pipeline that made public/media from the client's renders (v2.py = this version)
```

Never edit the root `*.html` files by hand; they are regenerated on every `dev` / `build`.

## Design system

| | |
|---|---|
| Colour | Paper `#F3F1EC`, paper-2 `#EAE7E0`, mist `#DFE4E6`, sky `#A9C1D1`, dawn `#F1C7AF`, ink `#14181D`, night `#12171D`, one signal orange `#FF5A1F` (`#C2410C` for text on light). |
| Type | Geist (display and text), Instrument Serif italic for accent words (`*word*` in the data files), Geist Mono for `[ tags ]` and meta. |
| Writing | Short headlines with one serif accent. Bracket tags and document-style headers in place of numbered eyebrows. Every fact with a date has a source. |

Tokens are at the top of `src/styles/base.css`.

## The imagery

Every image and film comes from aerpace's own renders and videos, re-art-directed for this version:

- a daylight / blue-hour grade;
- new AI background-removal cutouts (side, 3/4, front, plan, above);
- vector outlines traced from the plan and side views (used by the loader, the blueprint, the safety layers, the transitions and the favicon);
- film LUTs and a 160-frame image sequence.

No third-party (Joby, Rider or other) assets are used. `tools/v2.py` reproduces everything. It needs Python 3, Pillow, OpenCV, numpy, rembg and ffmpeg.

## Real vs simulated

- Forms validate and show a success state, but nothing is sent. Wire them to a backend or a form service.
- Resource requests are simulated.
- The network map and the routes on it are a concept, and are labelled as one.
- The city map in "Why the sky" is procedural. Its numbers describe the drawing, not a real city.
- The hero aircraft is the client render with a live fluid simulation around it, not a 3D model. A GLB/CAD file can replace it later.

## Facts to confirm before launch

These specs are marked "To confirm" on the site. They come from the research brief:

- VTOL wording
- 500 km range
- 1.5 t maximum weight

Coverage from August 2025 mentions a large-payload drone of 1.8 tonnes, so the weight figure needs checking.

Hydrogen power, 200 km/h and the BSE listing (scrip 534733) are public. News items link to their third-party sources.

## Credits and licences

- Fonts: Geist and Geist Mono (SIL OFL), Instrument Serif (SIL OFL), self-hosted via Fontsource.
- GSAP (standard no-charge licence), Lenis (MIT), Vite (MIT).
- India boundary: Survey of India outline via the DataMeet India community, CC BY 4.0.
- All renders, films and photographs: aerpace. Confirm usage rights and photographer credits for the Racers archive.

## Browser notes

- Films are H.264 MP4, which Chrome, Edge, Safari and Firefox play. Some open-source Chromium builds lack H.264; those show the posters instead.
- The fluid hero needs WebGL2 with float render targets (all current desktop and mobile browsers). Without it, a soft painted sky shows instead.
