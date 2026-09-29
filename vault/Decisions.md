---
type: log
title: Decisions
updated: 2026-09-29
tags: [positron, decisions]
---

# Decisions

Newest first. One entry per styling or process call, with the reason.

## 2026-09-29: PR-only workflow with maintainer approval

- `main` is protected. Changes arrive by PR and need an approving code-owner review from **@nomadsgalaxy** or **@erikbuild** (`.github/CODEOWNERS`).
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
