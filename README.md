# ZJGK 2.0 UI Preview v0.1

A standalone, static, no-backend prototype for reviewing the first ZJGK 2.0 visual direction.

## Preview
- Glass / Lite theme switch.
- Desktop / phone-frame layout switch.
- Home, subject library, knowledge map, question list, objective question and written-response mock pages.
- Demo answer feedback and local-only multi-image selection.
- All content is illustrative mock data.

## Run locally
Open `index.html` in a modern browser. No build step, package install, API key, database or login is required.

## Safety boundaries
- No production API calls.
- No database or account system.
- Selected answer state is local to the page.
- Selected answer photos are previewed locally and are not uploaded.
- This repository is separate from the legacy `acmcdeath-cmd/zjgkxc` project.
- This preview is marked `noindex,nofollow` and is not the production product.

## Deployment
Render Static Site:
- Build command: `echo "Static preview: no build required"`
- Publish path: `.`
- Branch: `main`

The preview does not use Render environment variables or any production secrets.
