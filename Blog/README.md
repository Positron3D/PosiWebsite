# Writing for the Positron blog

Every `.md` file in this folder becomes a post on [positron3d.com/blog](https://positron3d.com/blog.html).

## The easy way: the blog editor

Open **[positron3d.com/blog-editor.html](https://positron3d.com/blog-editor.html)**. It's a visual editor: you write directly on the post as it will look on the site.

- **Type `/`** on an empty line for the block menu: headings, lists, callouts, collapsibles, tabs, tables, code, images, videos and more. Keep typing to filter, then press Enter.
- **Markdown shortcuts work as you type:** `## ` heading, `### ` subheading, `- ` list, `1. ` numbered list, `[] ` tasks, `> ` quote. `---` or ` ``` ` followed by Enter gives a divider or a code block.
- **Images:** drag them in, paste them, or use the image button. Choose the placement (wrap left or right, centred, full width) and size first. Click an image to change its placement, size or description.
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

Press **Save .md**, then upload the `.md` and its images here (next step). Drafts autosave in your browser.

## Publish a post

1. On GitHub, open this `Blog/` folder and choose **Add file → Upload files**.
2. Drag in your `.md` file **and its images**. They all go straight into `Blog/`.
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
- Image paths are relative to this folder, so `photo.jpg` means `Blog/photo.jpg`. GitHub's own preview shows them too.

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

Files starting with `_` (like the template) and this README are never published.

**Images and photos follow the Positron brand manual.** Use real photos and renders, never AI-generated images, and credit community photos (`via @handle`).
