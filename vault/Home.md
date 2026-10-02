---
type: moc
title: Positron 3D Website
updated: 2026-09-29
tags: [positron, website, moc]
---

# Positron 3D Website: knowledge base

Project knowledge for the **positron3d.com** site (this repo). Rules for making changes live in [`AGENTS.md`](../AGENTS.md) and the visual system in [`POSITRON_DESIGN.md`](../POSITRON_DESIGN.md). This vault holds the context behind them. Keep it current in the same PR as the change.

## Notes

- [[Workflow]]: branch → build → local preview → PR → approval by @nomadsgalaxy, @erikbuild or @smiksky → auto-deploy.
- [[Deploy]]: Cloudflare Worker `posiwebsite`, GitHub Pages, and checking the live site.
- [[Build System]]: `_build/build.py` is the source of truth, plus the parity check.
- [[Partners]]: every partner card with its link, affiliate code, chip colour and logo source.
- [[Blog]]: `Blog/*.md` posts, the shared renderer, the editor and the publish workflow.
- [[Partner Logo Chips]]: the chip styling rule and how to prepare a logo.
- [[Brand/Prusa|Prusa brand rules]]: the Prusa Research logo and colours, from the Prusa Brand Manual 1.0.
- [[Decisions]]: dated log of styling and process decisions, newest first.

## Open items

- The Numakers affiliate link is still to come (currently plain `https://numakers.com`).
- Siraya and Numakers use the dark default chip. They could get brand-colour chips if their brand guidelines allow.
