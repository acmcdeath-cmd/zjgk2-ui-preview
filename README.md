# ZJGK 2.0 · Experience Preview v0.2

An Apple-inspired interactive UI prototype for the 2027 Jiangsu Vocational College Entrance Examination preparation platform.

## What is included
- Real Lens Design System 1.1.0-showcase.1 runtime, pinned to upstream commit `7a424c93b9be13cf835b91ea67495fec2ec0584e`.
- WebGL2 glass material compositor with CSS fallback.
- Spring / jelly pointer interactions and floating Dock.
- 13 synthesized interaction cues plus speed-sensitive glass-on-paper friction audio.
- Glass / Lite theme switch; Desktop / Mobile layout switch.
- Material and scene controls, draggable lens, progress optics, magnetic drop selection and magnifier XY control.
- Demo home, subjects, knowledge map, question list, objective and written-response pages.
- All question data is mock content. No database, login, OCR, AI or production API.

## Run
Open through any static HTTP server. No build command or external runtime CDN is required.
Render Static Site settings:
- Build command: `echo "Static preview: no build required"`
- Publish directory: `.`
- Branch: `main`

## Audio
The Lens sound engine synthesizes short cues and friction noise with Web Audio API. It does not autoplay. Browsers may require the first user gesture before audio starts. Sound can be muted and volume adjusted in the UI.

## GPU / accessibility
Glass uses one WebGL2 stage and the upstream GPU context budget / viewport suspension logic. If WebGL2 is unavailable, the system falls back to CSS glass. Lite does not create a WebGL renderer. The UI respects `prefers-reduced-motion`.

## Upstream Lens source
- Project: https://github.com/ruiqichenbiec/design-systems
- Directory: `lens/lab/design-system/`
- Version: `1.1.0-showcase.1`
- Pinned source commit: `7a424c93b9be13cf835b91ea67495fec2ec0584e`
- License: MIT; original LICENSE is retained at `vendor/lens/LICENSE`.

The upstream system is integrated locally; no CDN or external JavaScript dependency is loaded at runtime.

## Safety boundary
This is an isolated preview repository, separate from `acmcdeath-cmd/zjgkxc`. It contains no production data or secrets and is not the production product.
