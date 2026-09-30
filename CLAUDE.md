# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- `AGENTS.md` (imported above) is the rulebook for this repo. Follow its workflow exactly: branch, `build.py`, rebuild, `_build/preview.py`, then PR. Never push to `main`.
- Look at the `_preview/*.png` screenshots yourself (Read the image) before saying a visual change is done. Attach or describe them in the PR.
- Ask before any outward-facing step: opening or merging a PR, changing repo settings, or deploying. You cannot approve PRs; only @nomadsgalaxy, @erikbuild or @smiksky can.
- Before committing, check `git config user.name` and `user.email` match the account that will open the PR (see AGENTS.md §2, "Commit identity").
- Read `vault/Home.md` at the start of a task for current context, and update the relevant vault note in the same PR when partners, decisions or deploy facts change.
