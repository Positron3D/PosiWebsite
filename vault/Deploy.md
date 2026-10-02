---
type: reference
title: Deploy
updated: 2026-09-29
tags: [positron, deploy, cloudflare]
---

# Deploy

- **positron3d.com is served by the Cloudflare Worker `posiwebsite`** (Workers Builds, static-assets only, config in `wrangler.jsonc`). Every change to `main` triggers a build, which takes about a minute. There's no build step: the repo root is uploaded as-is, minus the paths in `.assetsignore`.
- **The deploy builds the site:** `wrangler.jsonc` `build.command` runs `pip install -r _build/requirements.txt && python _build/build.py --lenient` before uploading assets (Workers Builds has Python 3.13). A post uploaded straight to `main` therefore still publishes. `--lenient` logs and skips a broken post instead of failing the whole deploy. Confirmed with `wrangler deploy --dry-run` on 2026-10-02.
- **GitHub Pages was removed on 2026-10-02.** Cloudflare serves the domain, so the Pages workflow was redundant, and it had started failing while the repo was briefly private.
- `.assetsignore` keeps internal files off the live site: `.git`, `.github`, `wrangler.jsonc`, the docs, `_build/`, `_preview/` and `vault/`.

## Checking the live site

- Cloudflare shows a **"Just a moment…" bot check** to `curl` and other scripted clients, so a command-line fetch of an HTML page returns the challenge page, not the site. It is **not** evidence that a deploy failed.
- Instead:
  - open the site in a real browser;
  - fetch a static asset (images and CSS return normally, e.g. `curl -I https://positron3d.com/assets/img/partner-prusa.png`);
  - or check the `posiwebsite` build list in the Cloudflare dashboard.
