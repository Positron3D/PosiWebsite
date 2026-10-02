---
type: reference
title: Build System
updated: 2026-09-29
tags: [positron, build]
---

# Build System

- `_build/build.py` generates every root `*.html` page from shared `header()`, `footer()` and `page()` helpers plus per-page body strings. The gallery comes from `_build/gallery.toml` (see `README.md`).
- **It is the source of truth.** Edit `build.py`, rebuild, and commit both.
- **Parity check:** `python _build/build.py && git status` must show only the changes you intended.

## Blog

`build.py` also renders `Blog/*.md`, which needs `pip install -r _build/requirements.txt`. Use `--drafts` to include draft posts locally. See [[Blog]].

## Why the parity check exists

On 2026-05-27 the "update our sponsors" commit changed only `index.html`: it swapped PrintedSolid for Siraya and EIBOS and moved the partners section above the cards. `build.py` still had the old list, so the next rebuild would have silently reverted the sponsors. The two were re-synced on 2026-09-29, and a clean rebuild now reproduces `index.html` exactly.

## Preview

`_build/preview.py` serves the repo root on `127.0.0.1:8765`. It uses headless Chrome to screenshot pages at desktop, phone and wide widths. For screenshots only, the hero height is pinned via a `/__shot/` route, which injects a `<base href="/">` and one CSS rule; the pages themselves are unchanged. See [[Workflow]].
