# Writing for the Positron blog

Every post here becomes a page on [positron3d.com/blog](https://positron3d.com/blog.html) and an item in the RSS feed, [positron3d.com/feed.xml](https://positron3d.com/feed.xml). A post is either:

- **`YYYY-MM-DD-short-title.md`**, a text-only post, or
- **a folder `YYYY-MM-DD-short-title/`** holding the post's `.md` plus all of its images, including the cover thumbnail. Every post with images lives in its own folder.

## The easy way: the blog editor

The team has a visual editor at an **unlisted link**; ask a team member for it. It isn't linked from the site, so please don't post the link publicly. In the editor you write directly on the post as it will look on the site.

- **Type `/`** on an empty line for the block menu: headings, lists, callouts, collapsibles, tabs, tables, code, images, videos and more. Keep typing to filter, then press Enter.
- **Markdown shortcuts work as you type:** `## ` heading, `### ` subheading, `- ` list, `1. ` numbered list, `[] ` tasks, `> ` quote. `---` or ` ``` ` followed by Enter gives a divider or a code block.
- **Images:** drag them in, paste them, or use the image button. Choose the placement (wrap left or right, centred, full width) and size first. Click an image to change its placement, size or description.
- **Select any text** and a floating toolbar appears with bold, italic, strikethrough, highlight, code, link, headings and quote.
- **Links:** select text and press Ctrl/⌘+K. Click a link to edit, open or remove it.
- **The Markdown tab** shows the raw text if you prefer it.

| Shortcut | Does |
|---|---|
| Ctrl/⌘ + B, I, E | Bold, italic, inline code |
| Ctrl/⌘ + Shift + X, H | Strikethrough, highlight |
| Ctrl/⌘ + K | Link |
| Ctrl/⌘ + Alt + 2, 3, 0 | Heading, subheading, plain text |
| Ctrl/⌘ + Shift + 8, 7, 9 | Bulleted list, numbered list, quote |
| Ctrl/⌘ + Z, Shift + Z | Undo, redo |

Press **Save**. A text-only post downloads as a `.md`. A post with images downloads as **one `.zip`** holding the post and every image it uses, cover included. Upload that one file here (next step). To edit a post later, open its `.zip` or `.md` in the editor with **Open**. Drafts autosave in your browser.

## Publish a post

1. On GitHub, open this `Blog/` folder and choose **Add file → Upload files**.
2. Drag in your `.zip` (or `.md`). Don't unzip it: the site does that, putting the post and its images into their own folder, `Blog/YYYY-MM-DD-short-title/`.
3. Choose **Create a new branch** and **Propose changes**, then open the pull request.
4. A bot rebuilds the site pages on your branch within a minute or two. Once a reviewer approves and merges, the post goes live.

## File names and the header

Name the file `YYYY-MM-DD-short-title.md`, using only lowercase letters, numbers and dashes. The page becomes `blog-short-title.html`.

Start the file with these lines, then one blank line, then your post:

```
title: Your post title
date: 2026-10-01
author: Your name
summary: One sentence shown on the blog page and in link previews.
cover: my-cover-photo.jpg
tags: positron, build log
draft: true
```

- `title`, `date` and `author` are required.
- `draft: true` keeps the post off the site until you change it to `false`, or delete the line.
- Image paths are relative to the post's file, so `photo.jpg` means the image sitting next to it in the post's folder. GitHub's own preview shows them too.
- Zips may only contain one `.md` and images (`.jpg`, `.png`, `.webp`, `.gif`, `.avif`; no SVG), at the top level, up to 25 MB per file.

## Formatting

[`_TEMPLATE.md`](_TEMPLATE.md) shows every feature with its syntax. The ones people ask for most:

| You want | Write |
|---|---|
| Image on the right, text wrapping around it | `![Alt text](photo.jpg){.right width=320}` |
| Image on the left | `![Alt text](photo.jpg){.left width=320}` |
| Centred, wide or full-width image | `{.center}`, `{.wide}`, `{.full}` |
| Image with a caption | `<figure class="center" markdown>` … `<figcaption>…</figcaption></figure>` |
| Callout box | `!!! tip "Title"` then the text indented four spaces |
| Collapsible section | `??? info "Title"` |
| Tabs | `=== "Tab name"` |
| Strikethrough, highlight | `~~old~~`, `==new==` |
| Table of contents | `[TOC]` on its own line |
| Code with syntax highlighting | a fence with the language after it: ` ```ini ` (Klipper configs), ` ```gcode `, ` ```python `, ` ```bash `, ` ```c `, ` ```yaml ` |

Files starting with `_` (like the template) and this README are never published.

**Images and photos follow the Positron brand manual.** Use real photos and renders, never AI-generated images, and credit community photos (`via @handle`).
