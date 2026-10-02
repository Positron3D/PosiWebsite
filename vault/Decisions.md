---
type: log
title: Decisions
updated: 2026-09-29
tags: [positron, decisions]
---

# Decisions

Newest first. One entry per styling or process call, with the reason.

## 2026-10-01: Blog built from a `Blog/` folder

- Posts are Markdown files in `Blog/`, rendered at build time by `assets/py/blogmd.py` (Python-Markdown and pymdown-extensions, the site's first Python dependencies). The drafting app runs the same file in the browser through Pyodide.
- A PR workflow rebuilds the pages, because `main` is protected and most authors will upload through GitHub's web UI.
- **Why:** the team asked for a blog with full formatting (text wrap around images and more) that people can write without touching the site code. One renderer means the editor preview can't drift from the published page.

## 2026-09-29: Roles, the brand owner and approvers

- **@nomadsgalaxy (TheNomad) is the brand owner.** **@erikbuild** (Erik Reynolds) and **@smiksky** (Scott Mikutsky) are approvers, and any of the three can approve website PRs.
- Brand rules live in the private `Positron3D/Positron-Brand` repo (brand manual, design system, tokens, logos). Brand-defining changes there need the brand owner.

## 2026-09-29: PR-only workflow with maintainer approval

- `main` is protected. Changes arrive by PR and need an approving code-owner review from **@nomadsgalaxy**, **@erikbuild** or **@smiksky** (`.github/CODEOWNERS`). @nomadsgalaxy (TheNomad) is also the brand owner.
- Every PR must be checked locally first with `_build/preview.py` screenshots at desktop, phone and wide widths.
- **Why:** visual regressions and `build.py`/HTML drift were reaching the live site directly from `main`.

## 2026-09-29: Agent guide and in-repo vault

- `AGENTS.md` (imported by `CLAUDE.md`) is the shared rulebook for every agent and contributor. This vault is the shared context.
- **Why:** so anyone using agents on the repo follows the same rules.

## 2026-09-29: Prusa chip is the white logo on Prusa Orange

- Official white Prusa Research logo on `#fd5000`.
- **Why:** black on orange was requested first, but the Prusa Brand Manual 1.0 only shows the **white** logo on full Prusa Orange. White was chosen to match the manual. See [[Brand/Prusa]].

## 2026-09-29: Chips take each logo's background colour

- LDO `#35669a`, SendCutSend `#cc2127`, EIBOS `#fff`. LDO was trimmed to its wordmark and SendCutSend cropped to its raygun, each with reduced chip padding.
- **Why:** logos with their own solid backgrounds looked like small boxes floating inside the dark chip. See [[Partner Logo Chips]].

## 2026-09-29: Numakers logo recoloured for the dark chip

- The supplied wordmark had black text on a transparent background, which was invisible on `#1e232b`. The text was recoloured white and the yellow hexagon kept.

## 2026-09-29: `build.py` re-synced with `index.html`

- The partners section in `build.py` was brought back in line with `index.html` after the May drift. See [[Build System]].
