# Positron 3D Website — Agent Guide

> **Read this before changing anything in this repo.** It applies to every contributor, human or AI agent (Claude Code, Codex, Cursor, Copilot…). `CLAUDE.md` imports this file; other tools read it directly.
>
> **Order of authority when rules conflict:**
> 0. The **Positron 3D Brand Manual and Design System** in the private `Positron3D/Positron-Brand` repo, for the Positron logo, colours, type, voice, naming and licensing. The brand owner is @nomadsgalaxy. How AI agents work on the team (roles, workflow, verification, AI use) is in the same repo's `AI_TEAM_GUIDE.md`.
> 1. A partner's own brand manual, for that partner's logo and colours (see [Partner cards](#4-partner-cards)).
> 2. [`POSITRON_DESIGN.md`](POSITRON_DESIGN.md), the site's visual system: tokens, type, layout, components.
> 3. This file, which covers process: how to edit, preview, open PRs and ship.
> 4. [`vault/`](vault/Home.md), the project knowledge base: context, history and decisions. Update it; don't contradict it silently.

---

## AGENT INSTRUCTIONS — How to use this doc

- **Before your first edit:** read §1–§3, skim `POSITRON_DESIGN.md`, and open `vault/Home.md` for current context (partners, open items, recent decisions).
- **Adding or changing a partner/sponsor?** Follow §4 exactly, then update `vault/Partners.md`.
- **Anything visual?** You must run the local preview (§3) and look at the screenshots before opening a PR. "It builds" is not verification.
- **Found a rule that's wrong or missing?** Fix this file (or `POSITRON_DESIGN.md`) in the same PR, and add a line to `vault/Decisions.md`. Don't invent a parallel convention.
- **Never** push to `main`, merge your own PR, or bypass review. See §2.

---

## 1. What this repo is

- The static site for **positron3d.com**: plain HTML/CSS/JS, no framework, no npm.
- **`_build/build.py` is the source of truth.** It holds the header, nav, footer and every page's content. The root `*.html` files are **generated** from it.
- **Hosting:** the Cloudflare Worker **`posiwebsite`** (Workers Builds, static assets from the repo root, `wrangler.jsonc`) serves the domain and **deploys automatically when `main` changes**. A GitHub Pages workflow (`.github/workflows/deploy.yml`) also runs, but Cloudflare serves the domain.
- **Not deployed:** docs, `_build/`, `_preview/` and `vault/` are listed in `.assetsignore`. Keep new internal files out of the served site the same way.

```
index.html, positron.html, …   GENERATED pages. Don't hand-edit; change build.py and rebuild
assets/css/style.css           All styles; tokens in :root
assets/img/                    Self-hosted images (partner logos: partner-<slug>.<ext>)
assets/js/main.js              Mobile nav
_build/build.py                Site generator (source of truth)
_build/requirements.txt        Python deps for the blog (Markdown, pymdown-extensions): pip install -r
Blog/*.md                      Blog posts (source). Built to blog.html + blog-<slug>.html; see Blog/README.md
assets/py/blogmd.py            The one Markdown renderer, shared by the build and the blog editor
blog-editor.html               Drafting app (generated; JS in assets/js/blog-editor.js)
_build/gallery.toml            Gallery content
_build/preview.py              Local preview + screenshots
vault/                         Obsidian vault: project knowledge base
POSITRON_DESIGN.md             Visual design system
```

---

## 2. Workflow (MANDATORY)

```
branch → edit build.py (+ css/img) → rebuild → local preview → PR → approval → merge → auto-deploy
```

1. **Branch from up-to-date `main`.** Never commit to `main` directly; the branch is protected.
2. **Edit `_build/build.py`** (and `assets/` as needed), then run `python _build/build.py` (`PYTHONIOENCODING=utf-8` on Windows). The blog needs its two Python packages first: `pip install -r _build/requirements.txt`, ideally in a `.venv`. Commit the regenerated HTML together with the `build.py` change.
   - **Parity check.** Run `python _build/build.py && git status`. If the rebuild changes anything you didn't intend, `build.py` and the HTML have drifted. Fix `build.py`; don't commit hand edits to the HTML. (In May 2026 a sponsor update edited only `index.html`, and the next rebuild would have silently reverted it.)
3. **Preview locally** (§3) and check every page you touched at all three widths.
4. **Open a PR** using the template. Describe what changed and why, and **attach the preview screenshots** for visual changes.
5. **Approval.** Only **@nomadsgalaxy**, **@erikbuild** or **@smiksky** can approve (`.github/CODEOWNERS` + branch protection). Other collaborators may review and comment, but their approval doesn't satisfy the rule. Authors can't approve their own PR.
6. **Merge** once approved. Merging to `main` deploys within about a minute. Afterwards, spot-check the live site in a real browser: Cloudflare's bot check ("Just a moment…") blocks `curl`, so command-line fetches of HTML pages don't show the real site. Static assets (images/CSS) fetch normally.

**Commit identity.** Commit under the GitHub account you'll open the PR with, using that account's name and a verified or noreply email. Don't use an employer or work identity for Positron commits. Set it per-repo: `git config user.name "…"` and `git config user.email "…"`. The maintainers commit as `The Nomad <nomad@positron3d.com>` (@nomadsgalaxy) and `Erik Reynolds <me@erik.build>` (@erikbuild).

---

## 3. Local preview (required before every PR)

```
python _build/preview.py                 # screenshots of every page → _preview/
python _build/preview.py index.html      # only the pages you changed
python _build/preview.py --serve-only    # serve on http://127.0.0.1:8765/ and click around
```

- The script captures every page at **desktop 1366px**, **phone 412px** and **wide 1920px** into `_preview/` (gitignored). It needs Chrome or Chromium; set `CHROME=/path/to/chrome` if it isn't found.
- For screenshots only, the full-height hero is pinned to a normal screen height so the whole page fits one image. Use `--serve-only` in a real browser to check the actual hero, hover states and the mobile menu.
- **Look at the images.** Check that:
  - centred things are actually centred (see `POSITRON_DESIGN.md` §5);
  - nothing overflows at 412px;
  - every partner chip reads clearly;
  - no image is missing or blurry;
  - the nav and footer are intact.

---

## 4. Partner cards

The "Official Project Partners" grid on the homepage (`build.py` → `index.html`). One card:

```html
<a class="logo-card" href="https://partner.example/?aff=…" target="_blank" rel="noopener"><div class="logo-card__chip" style="--chip-bg:#hex"><img src="assets/img/partner-<slug>.<ext>" alt="Partner Name"></div><h3>Partner Name - What They Make</h3></a>
```

### 4.1 Chip styling rule: every logo must look like it fills its chip

This rule is also written as a comment above `.logo-card__chip` in `assets/css/style.css`.

| Logo type | What to do | Examples |
|---|---|---|
| Logo with its own solid background | Set that exact colour on the chip: `style="--chip-bg:#hex"`, so chip and logo read as one tile. Sample the colour from the logo's edge pixels. | LDO `#35669a` · SendCutSend `#cc2127` · EIBOS `#fff` |
| Partner with a brand manual | Use the manual's **approved** logo/background pairing and **official** logo files, not a recolour. | Prusa: official **white** logo on Prusa Orange `#fd5000` |
| Transparent logo | Prepare it to read on the dark default chip (`--surface-2` `#1e232b`), e.g. recolour black text to white while keeping brand colours. | Numakers (white-text variant) · Siraya |

Then, for every logo:

- **Trim empty padding** from the image so the mark fills the chip (`magick in.png -trim +repage …`). If it still looks small, reduce **that chip's** padding inline (`padding:16px 8px`, or `padding:8px` for a square mark). Never enlarge past the chip.
- **Never** put a dark logo on the dark chip, add effects or outlines, or change a partner's brand colours.
- The chip is 96px tall and the image is capped at 64px (`max-height`). Save logos at about 2–3× that (e.g. 640px wide, or 192px tall) as `webp`/`png` with transparency where it applies.

### 4.2 Links

- Use the partner's **affiliate link** when there is one. The current links are in `vault/Partners.md`, which is the list to keep up to date.
- Card title format: `Partner Name - What They Make` (e.g. `Numakers - Filaments`).
- External links always use `target="_blank" rel="noopener"`.

### 4.3 Checklist for a new partner

1. Get the official logo, preferably from the partner's media kit or brand manual. Note its source in `vault/Partners.md`.
2. Prepare it per §4.1 and save it as `assets/img/partner-<slug>.<ext>`.
3. Add the card in `_build/build.py`, rebuild, and run the parity check.
4. Preview at all widths and confirm the chip reads clearly next to its neighbours.
5. Update `vault/Partners.md` (row, link, chip colour, logo source) and `vault/Decisions.md` if you made a styling call.
6. Open a PR with the screenshots.

---

## 5. Blog

- **Posts are `Blog/<date-slug>.md` (text only) or a folder `Blog/<date-slug>/`** holding one `.md` and its images; every post with assets gets its own folder. **Uploaded zips** (`Blog/*.zip`, the editor's save format for posts with images) are unpacked by `_build/blogzip.py` into that folder, checking for zip slip, file types (no SVG), sizes and exactly one `.md`. Run `python _build/blogzip.py` to self-check. `Blog/README.md` is the author guide, and `Blog/_TEMPLATE.md` exercises every supported feature. Files starting with `_` and the README are never published, and `draft: true` posts are skipped unless you build with `--drafts`.
- **One renderer:** `assets/py/blogmd.py` holds the extension list. The site build and the WYSIWYG editor (via Pyodide) both use it, so the editor shows exactly what publishes. The editor converts visual edits back to Markdown with turndown, plus one custom rule per blogmd feature in `assets/js/blog-editor.js`. **When you add a Markdown feature, add its turndown rule too,** and re-run the round-trip check (render → turndown → render must give identical HTML for `Blog/_TEMPLATE.md`). Add Markdown features there, keep the Pyodide package pins in `assets/js/blog-editor.js` equal to `_build/requirements.txt`, and add CSS for any new elements under the blog section of `style.css`. Run `python assets/py/blogmd.py` to self-check.
- **RSS:** the build writes `feed.xml` (RSS 2.0) from published posts only, newest 30, never drafts. Each item has its full content with absolute links (resolved like the browser does), summary, author, tags and the cover as an enclosure. Blog pages advertise it with `<link rel="alternate">`.
- **Publishing:** team members upload posts and images to `Blog/` through GitHub's web UI, which opens a PR. The **Build site** workflow (`.github/workflows/build-site.yml`) regenerates the pages on the PR branch, and merging publishes. Raw `.md` files aren't deployed (`.assetsignore`), so draft text never goes live.
- **Checking a post:** `python _build/build.py --drafts`, then `python _build/preview.py blog.html blog-<slug>.html`. Before committing, build without `--drafts` so draft pages are removed again.
- **Trust:** posts may contain raw HTML (embeds, figures). PR review is the gate, so read a post's HTML before approving it.

## 6. Design rules (summary; `POSITRON_DESIGN.md` is authoritative)

- **Positron is not Prusa.** The site's accent is its own amber (`--accent` `#ff9d12`, logo `#de9400`). Prusa Orange appears **only** inside the Prusa partner chip.
- All colours come from `:root` tokens. The one sanctioned inline colour is a partner chip's `--chip-bg`.
- New shared styling goes in `style.css` as a class. Inline `style=""` is only for background images, `--chip-bg` and a partner chip's padding.
- Self-host every image in `assets/img/`. No hotlinking.
- Every image has a meaningful `alt`.

---

## 7. Knowledge base: `vault/`

`vault/` is an Obsidian vault. Open the folder in Obsidian ("Open folder as vault"), or read the Markdown directly.

- `Home.md` is the map of content. Start there.
- **Keep it current as part of your PR:** partner changes go in `Partners.md`, styling or process calls in `Decisions.md` (newest first, dated), and deploy or build discoveries in the matching note.
- Write plain, declarative notes with `[[wikilinks]]`. No secrets, tokens, personal data or private file paths: this repo is **public**.

---

## 8. Never

- Push to `main`, force-push shared branches, or merge without an approval from @nomadsgalaxy, @erikbuild or @smiksky.
- Hand-edit a generated `*.html` without the same change in `build.py`.
- Open a PR for a visual change without running `_build/preview.py` and looking at the result.
- Commit `_preview/`, credentials, API tokens, or anything from a partner marked confidential.
- Recolour or distort a partner's logo against its brand manual.
- Use generative AI for graphic design: logos, partner logos, icons, banners, renders, or product and community photos. AI is fine for the site's code and copy drafts, but not for visuals (Positron Brand Manual §10, AI use).
