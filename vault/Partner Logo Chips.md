---
type: guideline
title: Partner Logo Chips
updated: 2026-09-29
tags: [positron, design, partners]
---

# Partner Logo Chips

**Rule: every logo should look like it fills its chip, so the grid reads as a set of equal tiles.** The canonical wording is the comment above `.logo-card__chip` in `assets/css/style.css`; [`AGENTS.md` §4.1](../AGENTS.md) has the same rule.

- The chip background is `var(--chip-bg, var(--surface-2))`. Set `style="--chip-bg:#hex"` per card.
- The chip is 96px tall with 16px padding, and the image is capped at 64px tall.

## Cases

1. **Logo ships on a solid colour:** set the chip to that colour, sampled from the logo's edge pixels (`magick logo.png -format '%[pixel:p{1,1}]' info:`). Examples: LDO, SendCutSend, EIBOS.
2. **Partner has a brand manual:** use its approved pairing and official files. Prusa: white logo on `#fd5000`; the manual allows black or white logos only, and shows white on full orange. See [[Brand/Prusa]].
3. **Transparent logo:** make sure it reads on `#1e232b`. Recolour black text to white while keeping brand colours, e.g. `magick in.png -channel RGB -fx "saturation<0.35 ? 1 : u" +channel out.webp` (used for Numakers).

## Prep recipes (ImageMagick)

- Trim empty padding: `magick in.png -trim +repage out.png`. For lossy images with near-uniform backgrounds, add `-fuzz 8%`.
- Resize for 2–3× density: `-resize 640x` for wide wordmarks, `-resize x192` for tall or square marks.
- Crop to the mark when the logo is a badge (SendCutSend): find the white-pixel bounds, crop with a margin, and `-flatten` onto the chip colour.
- If a trimmed logo still looks small, reduce **that** chip's padding inline (`padding:16px 8px`).

## Don'ts

- A dark logo on the dark chip.
- Effects, outlines or recolouring against a brand manual.
- A logo floating as a smaller box inside a differently coloured chip.
