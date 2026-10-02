# ABOUTME: Renders one Blog/*.md post to HTML with the full Positron markdown feature set.
# ABOUTME: Shared by _build/build.py (site build) and the blog editor page (Pyodide live preview).
import datetime
import re

import markdown
import pymdownx.emoji

# Every extension a post may use. Keep the editor and the build on this one list.
EXTENSIONS = [
    "meta",                  # front matter: "title: ..." lines at the top
    "extra",                 # tables, footnotes, attr_list {.right}, def lists, abbr, md_in_html, fenced code
    "admonition",            # !!! note / tip / warning callouts
    "toc",                   # [TOC] and heading anchors
    "sane_lists",
    "smarty",                # curly quotes and dashes
    "pymdownx.tilde",        # ~~strikethrough~~
    "pymdownx.mark",         # ==highlight==
    "pymdownx.caret",        # ^^insert^^, super^script^
    "pymdownx.tasklist",     # - [x] task lists
    "pymdownx.details",      # ??? collapsible sections
    "pymdownx.tabbed",       # === "Tab" tabbed content
    "pymdownx.keys",         # ++ctrl+alt+del++
    "pymdownx.magiclink",    # bare URLs become links
    "pymdownx.emoji",        # :tada:
    "pymdownx.superfences",  # ``` code fences that also work inside tabs, callouts and lists
]
EXTENSION_CONFIGS = {
    "toc": {"permalink": "#", "permalink_title": "Link to this section"},
    "pymdownx.tasklist": {"custom_checkbox": True},
    "pymdownx.tabbed": {"alternate_style": True},
    "pymdownx.emoji": {"emoji_generator": pymdownx.emoji.to_alt},  # plain Unicode, no image CDN
}
REQUIRED = ("title", "date", "author")
WORDS_PER_MINUTE = 220


class PostError(ValueError):
    pass


def render(text, src_prefix="Blog/"):
    """Return (meta, html) for one post. meta values are plain strings; tags is a list.

    Relative image/link targets are rewritten with src_prefix so `photo.jpg` written next to the
    .md file (as GitHub previews it) resolves from the site root.
    """
    md = markdown.Markdown(extensions=EXTENSIONS, extension_configs=EXTENSION_CONFIGS)
    html = md.convert(text)
    meta = {k: " ".join(v).strip() for k, v in md.Meta.items()}
    missing = [k for k in REQUIRED if not meta.get(k)]
    if missing:
        raise PostError("missing front matter: " + ", ".join(missing))
    try:
        meta["date_obj"] = datetime.date.fromisoformat(meta["date"])
    except ValueError:
        raise PostError("date must be YYYY-MM-DD, got %r" % meta["date"])
    meta["tags"] = [t.strip() for t in meta.get("tags", "").split(",") if t.strip()]
    meta["draft"] = meta.get("draft", "").lower() in ("true", "yes", "1")
    words = len(re.sub(r"<[^>]+>", " ", html).split())
    meta["minutes"] = max(1, round(words / WORDS_PER_MINUTE))
    if meta.get("cover"):
        meta["cover"] = _prefix(meta["cover"], src_prefix)
    html = re.sub(r'(<(?:img|source|video)\b[^>]*\bsrc=")([^"]+)"',
                  lambda m: m.group(1) + _prefix(m.group(2), src_prefix) + '"', html)
    return meta, html


def _prefix(url, src_prefix):
    if re.match(r"^([a-z][a-z0-9+.-]*:|/|#|data:|blob:)", url, re.I) or url.startswith(src_prefix):
        return url
    return src_prefix + url


if __name__ == "__main__":
    sample = """title: Test
date: 2026-10-01
author: TheNomad
tags: a, b
cover: cover.jpg

![x](photo.jpg){.right width=300}
Text ~~old~~ ==new==.

!!! tip
    Callout.
"""
    meta, html = render(sample)
    assert meta["title"] == "Test" and meta["tags"] == ["a", "b"] and meta["cover"] == "Blog/cover.jpg"
    assert 'src="Blog/photo.jpg"' in html and 'class="right"' in html, html
    _, tabs = render("title: t\ndate: 2026-10-01\nauthor: a\n\n=== \"A\"\n    ```c\n    #define X\n    ```\n")
    assert "<h1" not in tabs and "#define X" in tabs, tabs
    assert "<del>old</del>" in html and "<mark>new</mark>" in html and 'class="admonition tip"' in html
    try:
        render("title: x\n\nbody")
        raise AssertionError("missing date/author should fail")
    except PostError:
        pass
    print("blogmd self-check ok")
