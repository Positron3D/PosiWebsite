---
type: reference
title: Blog
updated: 2026-10-01
tags: [positron, blog]
---

# Blog

- **Source:** `Blog/*.md`, one file per post (`YYYY-MM-DD-slug.md`) with a front-matter header (`title`, `date` and `author` required; `summary`, `cover`, `tags` and `draft` optional). Images sit next to the post in `Blog/`.
- **Output:** `blog.html` (index, newest first) and `blog-<slug>.html` per post, at the site root. A flat layout avoids a `Blog/` vs `blog/` case clash on macOS and Windows. Pages of deleted posts are removed on the next build.
- **Renderer:** `assets/py/blogmd.py`, using Python-Markdown plus pymdown-extensions, pinned in `_build/requirements.txt`. It handles text wrap around images (`{.left}` / `{.right}`), captions, tables, footnotes, callouts, collapsibles, tabs, task lists, strikethrough, highlight, keys, emoji, a table of contents and raw HTML embeds.
- **Editor:** `blog-editor.html`. It runs the same `blogmd.py` in the browser through Pyodide (loaded from jsDelivr), so the preview matches the site. Drafts autosave in localStorage, and it saves `.md` files and links to GitHub's upload page for `Blog/`. It's marked `noindex`.
- **Publishing:** upload to `Blog/` on GitHub, which opens a PR. The **Build site** workflow regenerates the pages on the PR branch, and merging deploys. Raw `.md` isn't served (`.assetsignore`).
- **Tested 2026-10-01:**
  - the showcase post at 1366, 412 and 1920 px;
  - an editor end-to-end run in Playwright: engine load, the missing-author error, toolbar callouts, image wrap from a local file, saving `.md`, and restoring the draft after a reload.

See [[Decisions]] and [[Build System]].
