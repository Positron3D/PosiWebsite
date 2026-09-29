---
type: process
title: Workflow
updated: 2026-09-29
tags: [positron, process]
---

# Workflow

Full rules: [`AGENTS.md` §2–§3](../AGENTS.md).

1. Branch from up-to-date `main`. `main` is protected: no direct pushes.
2. Edit `_build/build.py` (plus `assets/`), run `python _build/build.py`, and commit the regenerated HTML with it. See [[Build System]].
3. **Preview locally:** `python _build/preview.py` writes screenshots of every page at 1366px / 412px / 1920px into `_preview/`. Look at them. Use `--serve-only` to click around in a real browser.
4. Open a PR using the template and attach screenshots.
5. **Approval:** a code-owner review from **@nomadsgalaxy** or **@erikbuild** is required (`.github/CODEOWNERS` + branch protection on `main`). Approvals from other collaborators don't count, and authors can't approve their own PRs.
6. Merging deploys automatically. See [[Deploy]].

## Commit identity

Commit as the GitHub account that opens the PR. Don't use employer or work emails.

| Maintainer | GitHub | Git identity |
|---|---|---|
| The Nomad | @nomadsgalaxy | `The Nomad <nomad@positron3d.com>` |
| Erik Reynolds | @erikbuild | `Erik Reynolds <me@erik.build>` |

Note: `@erikbuilds` (with an **s**) is a different, unrelated account.
