# ZJGK 2.0 · Study Atlas v0.3

A product-level UI redesign for the 2027 Jiangsu Vocational College Entrance Examination preparation platform.

## Product direction
This is not a reskin of the legacy quiz website. The primary information architecture is:
**Subject → Chapter → Knowledge point → Related questions → Original paper / source record.**

The prototype focuses on source traceability and research-backed knowledge navigation. It does not include legacy homework, class management or mock-exam dashboards.

## UI direction
- Desktop: persistent subject/navigation rail, central knowledge workspace and contextual source panel.
- Mobile: independently composed single-column study flow with a compact header and four-item bottom navigation.
- Liquid Glass is reserved for application chrome, navigation and transient sheets. Question text, reading content and metadata remain high-contrast solid surfaces.
- No decorative drag-lens playground or unrelated optical controls in the learning workflow.

## Lens integration
- Upstream Lens Design System 1.1.0-showcase.1, pinned to commit `7a424c93b9be13cf835b91ea67495fec2ec0584e`.
- MIT license retained at `vendor/lens/LICENSE`; see `NOTICE.md`.
- One viewport-sized WebGL2 stage. Renderer defaults to event-driven frames rather than continuous background animation.
- Local renderer patch: configurable DPR cap via `data-glass-dpr`, no preserved drawing buffer, and background animation disabled when motion is off.
- Mobile DPR cap: 1.0; desktop cap: 1.25.
- Glass surfaces are limited to the app header, dock and transient sheets. Main content uses solid readable surfaces.
- CSS fallback when WebGL2 is unavailable.
- Optional synthesized interaction sounds; no autoplay or background music.

## Run locally
Serve the repository root over HTTP and open `index.html`. No package install, build step, database, account or external runtime CDN is required.

## Render Static Site
- Build command: `echo "Static preview: no build required"`
- Publish directory: `.`
- Branch: `v0.3-product-redesign`

## Data boundary
All visible question/source entries are clearly marked demonstration data. No real question bank, research atom mapping, answer upload backend, OCR, AI, production API or user data is connected.

## Versioning
- v0.1: initial visual/interaction prototype; branch `v0.1-baseline`.
- v0.2: Lens interaction experiment; retained on the main branch commit before this redesign.
- v0.3: independent product information architecture and desktop/mobile redesign.
