# Positron 3D — Design Doc

The single reference for how the Positron 3D site looks, feels, and is built. If a new page or component doesn't follow this doc, the doc wins. All tokens live in `assets/css/style.css` `:root`; change them there, not inline.

> **Identity note:** This is **Positron**, not Prusa. We do **not** borrow Prusa's pumpkin-orange (`#fa6831`), their hazard-stripe motifs, or their layout patterns. Positron's color is its own **amber/gold `#de9400`** (taken directly from the official logo), paired with a deep near-black. The personality is *chaotic-maker confident*: playful copy ("Me Me Big Boi", "#DontPrintOnPlanes"), serious engineering, portable-first.

---

## 1. Brand

| | |
|---|---|
| **Name** | Positron 3D |
| **Logo** | `assets/img/logo.svg` (amber, with wordmark) · `assets/img/logo-icon.png` (mark only, favicon) |
| **Tagline** | Compact. Portable. Capable. |
| **Voice** | Confident, witty, community-first. Short sentences. Real engineering specs stated plainly. |
| **Tone with partners** | Grateful and concrete — name people and what they did (see Credits). |

Do **not** recolor or add effects to the logo. It is single-color amber; place it on dark backgrounds only.

---

## 2. Color tokens

```
--bg:        #0c0e11   /* page background, near-black */
--bg-alt:    #111418   /* alternating section background */
--surface:   #171b21   /* cards, nav, inputs */
--surface-2: #1e232b   /* hover/raised surfaces, chips behind icons */
--border:    #2a313b   /* hairlines, card borders */
--text:      #e9ecf1   /* primary text */
--muted:     #9aa3ad   /* secondary/body text */
--accent:    #ff9d12   /* interactive amber (buttons, links, highlights) */
--accent-2:  #de9400   /* brand amber (logo), hover-darken */
--accent-ink:#1a1205   /* text on top of amber fills */
```

**Rules**
- Accent is for *interaction and emphasis only* — buttons, links, the eyebrow label, one highlighted word in a headline. Never large amber fills of body text.
- Text on amber is always `--accent-ink` (near-black), never white — contrast + brand consistency.
- Dark third-party logos get a light chip (`#f4f4f5`, `.logo-card__chip`) so every partner reads equally. Never put a dark logo straight on `--bg`.
- One accent per headline max (e.g. "Compact. **Portable.** Capable.").

---

## 3. Typography

- **Family:** `Inter` (Google Fonts), system-sans fallback. One family across the whole site.
- **Headings:** weight 800, `letter-spacing: -.02em`, `line-height: 1.15`.
- **Scale (fluid):** `h1` clamp 2.2–4rem · `h2` clamp 1.7–2.6rem · `h3` 1.3rem · body 1rem / 1.65 · `.lead` 1.15rem.
- **Eyebrow** (`.eyebrow`): uppercase, `letter-spacing: .22em`, amber, 700 — the small label above a section heading. Use it to introduce sections; don't skip straight to a bare `h2` on a hero-style block.
- Body copy is `--muted`; headings are `--text`. Don't set body text to full white.

---

## 4. Spacing & layout

- **Container:** max-width `1180px`, 22px side padding, centered.
- **Section rhythm:** `.section` = 84px vertical (60px on mobile). `.section--tight` = 56px. Alternate plain / `.section--alt` backgrounds down a page so sections read as distinct bands.
- **Grid gap:** 26px default. Cards/logos use the `.grid--2 / --3 / --4` helpers; they collapse to 2-up at ≤900px and 1-up at ≤560px.
- Don't hand-roll column widths inline — use the grid helpers so responsive collapse stays consistent.

---

## 5. Alignment — the rule that bit us

**Centered text must live in a centered box.** `text-align: center` only centers *inline* content; a block with a `max-width` still hugs the left unless it has `margin-inline: auto`.

- `.lead` now ships with `margin-left/right: auto` because it's only ever used in centered contexts (heroes, section intros). For a deliberately left-aligned lead, add `.lead--flush`.
- Any new max-width block that should be centered (`.prose`, custom callouts) needs `margin-inline: auto` — `.center` alone is **not** enough.
- Centered content blocks (value props, stats) use `.feature--center`: icon stacked on top, text centered. Left-aligned icon+text (`.feature`) is for split/list contexts only.

**Quick test:** on a wide viewport, a centered subtitle should have *equal* gaps left and right. If it's pushed left, the box is missing auto margins.

---

## 6. Components

- **Buttons** (`.btn`): pill (`border-radius: 999px`), amber fill, `--accent-ink` text, lift + glow on hover. `.btn--ghost` = transparent + border for secondary actions (max one primary + one ghost per group). `.btn--sm` inside cards.
- **Nav** (`.nav`): floating rounded-pill bar, translucent dark + blur, sticky. Logo left · links center · social + "About/Contact" CTA right. Active page = filled pill via `aria-current="page"`. Collapses to a hamburger sheet ≤900px; the "Our Printers" dropdown expands inline on mobile.
- **Cards** (`.card`): surface bg, 16px radius, 16:11 media on top, body with a `.btn--sm` pinned to the bottom. Hover = lift + amber border. Use for any "thing + blurb + link".
- **Hero** (`.hero`) / **page hero** (`.page-hero`): full-bleed photo, dark gradient scrim, centered eyebrow → h1 → lead → CTAs. Every subpage opens with a `.page-hero`.
- **Logo grid** (`.logo-card`): partners/retailers — light chip + name + ghost "More Details".
- **Forms:** dark inputs, amber focus border, required marked with amber `*`. Static host → posts to Formspree; never collect payment/credentials.

**Radii:** 999px (pills) · 16px (cards/sections) · 12px (inputs, chips). **Shadow:** one token `--shadow` for all raised elements.

---

## 7. Imagery

- Real Positron hardware photography, dark and moody, sits behind gradient scrims so text stays legible.
- Self-host everything in `assets/img/` — no hotlinking to the old Odoo/CDN URLs.
- Backgrounds use a top-to-bottom dark gradient (`rgba(8,9,11,…)`) so any photo supports white text.
- Decorative icons: emoji or simple inline SVG in amber circles. Keep them literal and friendly, not corporate.

---

## 8. Accessibility & responsive

- Maintain AA contrast: `--text`/`--muted` on `--bg`, `--accent-ink` on amber. Don't put amber text on dark for anything small.
- Touch targets ≥ 40px (nav social/CTA already sized for this).
- Every image has meaningful `alt`; nav landmarks and `aria-current` are set in the generator.
- Breakpoints: **900px** (grids → 2-up, nav → hamburger) and **560px** (grids → 1-up, tighter sections). Test both plus a wide desktop on any new page.

---

## 9. Build discipline

- **`_build/build.py` is the source of truth.** Header, footer, nav, and page content live there; root `*.html` are generated — never hand-edit them.
- Regenerate: `python _build/build.py` (`PYTHONIOENCODING=utf-8` on Windows).
- New shared styling goes in `style.css` as a reusable class, not inline. Inline `style=""` is reserved for one-off background-image URLs and tiny spacing nudges.
- Verify in-browser at 1366px, 412px, and one wide width before shipping.

---

*Reconcile with the team's Synaptic UX/UI conventions when that service is reachable; this doc reflects the implemented system as of the static rebuild.*
