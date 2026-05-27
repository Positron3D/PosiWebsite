# Positron 3D — Website

Static site for [Positron 3D](https://positron3d.com), hosted on GitHub Pages.

## Quick start

Pages are plain HTML. Edit them directly, or regenerate everything from the build script:

```
python _build/build.py
```

This rewrites all `.html` files from the templates in `_build/build.py`.

---

## Gallery

The gallery page is driven by a single config file. No code changes needed to add, remove, or reorder photos.

### Adding photos

1. Drop images into **`assets/img/gallery/`**
2. Edit **`_build/gallery.toml`** — add an entry for each photo:

```toml
[[photos]]
file = "gallery/my-photo.jpg"
caption = "A cool Positron build"
category = "positron"
```

3. Run `python _build/build.py` to regenerate the site.

### Gallery config reference

| Field      | Required | Description                                        |
|------------|----------|----------------------------------------------------|
| `file`     | yes      | Image path relative to `assets/img/`               |
| `caption`  | yes      | Shown in the lightbox and on hover                  |
| `category` | no       | Groups photos under a filter button (e.g. `proton`) |

- **Categories are automatic.** Filter buttons are generated from whatever `category` values appear in the TOML. No need to declare them anywhere else.
- **No categories? No filter bar.** If you omit `category` from every entry, the filter buttons won't render at all.
- **Order matters.** Photos appear in the gallery in the same order they're listed in the TOML.

---

## Project structure

```
index.html, gallery.html, ...   Generated pages (do not hand-edit if using build.py)
assets/
  css/style.css                 Site styles
  img/                          Shared images
  img/gallery/                  Gallery-specific images
  js/main.js                    Mobile nav toggle
_build/
  build.py                      Static site generator
  gallery.toml                  Gallery content config
```

## History

We broke our website a while ago, so we rebuilt it to run on GitHub Pages. We used some smart sands to help us pull raw HTML from our drag-and-drop editors like Odoo and the Internet Archive to properly fix things. We know how to edit HTML now, so we'll just do that moving forward.
