---
type: reference
title: Blog
updated: 2026-10-01
tags: [positron, blog]
---

# Blog

- **Source:** a text-only post is `Blog/YYYY-MM-DD-slug.md`. A post with images is a folder, `Blog/YYYY-MM-DD-slug/`, with one `.md` plus its images and cover. The front-matter header needs `title`, `date` and `author`; `summary`, `cover`, `tags` and `draft` are optional. Image paths are relative to the `.md`.
- **Zips:** the editor saves posts with images as one `.zip` (the post, every referenced image and the cover). On upload, `_build/blogzip.py`, run by the build and the PR workflow, unpacks it into the post's folder and deletes the zip. It guards against zip slip, oversized files and zip bombs, rejects SVG and non-image files, and requires exactly one `.md`. Re-uploading the same post replaces its files, which is how edits work. The editor can reopen `.zip` and `.md` files, including deflate-compressed zips.
- **Output:** `blog.html` (index, newest first) and `blog-<slug>.html` per post, at the site root. A flat layout avoids a `Blog/` vs `blog/` case clash on macOS and Windows. Pages of deleted posts are removed on the next build.
- **Renderer:** `assets/py/blogmd.py`, using Python-Markdown plus pymdown-extensions, pinned in `_build/requirements.txt`. It handles text wrap around images (`{.left}` / `{.right}`), captions, tables, footnotes, callouts, collapsibles, tabs, task lists, strikethrough, highlight, keys, emoji, a table of contents and raw HTML embeds.
- **Editor:** an **unlisted** page (`write-<token>.html`; the name is `EDITOR_PAGE` in `build.py`). It isn't linked from the site, and it carries `noindex, nofollow` and `no-referrer`. The repo is public, so this keeps it from visitors and search engines, not from someone reading the source; the tool needs no protection beyond that, because it's client-side only with no write access. The URL is shared privately (Positron-Brand `AI_TEAM_GUIDE.md`); never put it in this public repo's docs, issues or PRs. To rotate it, change `EDITOR_PAGE`. It's a WYSIWYG editor. Authors edit the rendered post directly, and a Markdown tab is available too. Rendering uses the same `blogmd.py` in the browser through Pyodide, loaded from jsDelivr. Visual edits convert back to Markdown with turndown 7.2.4, with custom rules for every blogmd feature. Block inserts go after the current paragraph. Clicking an image selects it, so its placement, size and description can be changed. The editor also follows common conventions: keyboard shortcuts, toolbar buttons that light up for the formatting under the cursor, Markdown autoformat as you type, a "/" block menu ranked by label, a floating selection toolbar (above the text, flipping below near the sticky bar and on touch screens, where the phone's own menu sits above; hidden inside code blocks), a link popover, drag-and-drop and pasted images, and Lucide 1.48.0 icons vendored in `build.py`. All of it goes through one `COMMANDS` registry in `blog-editor.js`. Drafts autosave in localStorage, and it saves `.md` files and links to GitHub's upload page for `Blog/`. It's marked `noindex`.
- **RSS:** `feed.xml` at the site root, RSS 2.0, built with the pages. It holds the newest 30 published posts (drafts never), with full content in `content:encoded`, links resolved against each post's URL, `dc:creator`, tags as categories and the cover as an enclosure. Blog pages link to it for auto-discovery, and the blog index shows an "RSS feed" link. Validated with feedparser on 2026-10-01.
- **Publishing:** upload to `Blog/` on GitHub, which opens a PR. The **Build site** workflow regenerates the pages on the PR branch, and merging deploys. Raw `.md` isn't served (`.assetsignore`).
- **Round-trip guarantee:** rendering `_TEMPLATE.md`, converting it back with turndown and rendering again gives identical HTML. Re-check this whenever a feature is added.
- **Tested 2026-10-01:**
  - the showcase post at 1366, 412 and 1920 px;
  - an editor end-to-end run in Playwright: engine load, the missing-author error, toolbar callouts, image wrap from a local file, saving `.md`, and restoring the draft after a reload.

See [[Decisions]] and [[Build System]].
