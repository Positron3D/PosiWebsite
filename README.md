# Positron 3D — Website

A clean, fast, fully static rebuild of [positron3d.com](https://www.positron3d.com/), ready for **GitHub Pages**. Content was reconstructed from the live Odoo site and the Wayback Machine captures (Feb 2025 + Nov 2025), keeping the best of both — the current printer line-up, partners, and copy — without Odoo's broken runtime.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, quick links, about, partners, v3.2 features |
| `printers.html` | Our Printers overview (Positron / Proton / Prusawire) |
| `positron.html` | Positron v3.2 — features, kit & parts retailers, v3 forks |
| `proton.html` | Proton — specs & development status |
| `prusawire.html` | Prusawire — docs, GitHub, assembly manual |
| `documentation.html` | Wiki, GitHub, LDO build guide |
| `credits.html` | Team, LDO, retailers, reviewers, beta testers, Voron, founders |
| `contact.html` | About, goal, business-inquiry contact form |
| `404.html` | Custom not-found page |

## Structure

```
.
├── *.html                # pages (generated — do not hand-edit)
├── assets/
│   ├── css/style.css     # all styles (single dark theme, accent #de9400)
│   ├── js/main.js        # mobile nav toggle
│   └── img/              # self-hosted images & logos
├── _build/build.py       # site generator (source of truth for header/footer)
├── .nojekyll             # serve assets as-is on GitHub Pages
└── README.md
```

## Editing

Header, footer, nav, and per-page content live in **`_build/build.py`**. Edit there, then regenerate:

```bash
python _build/build.py
```

This rewrites every `*.html` at the repo root so the shared chrome stays consistent.

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that publishes the site on every push to `main`.

1. Push to `github.com/Positron3D/PosiWebsite` (branch `main`).
2. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions** (one-time).
3. The workflow uploads the repo root as-is and deploys it — no build step. Watch progress under the **Actions** tab; the live URL appears on the workflow's `deploy` job.

*(Alternative without Actions: Settings → Pages → Source → “Deploy from a branch” → `main` / `/ (root)`. The included `.nojekyll` keeps Pages from running Jekyll either way.)*

### Custom domain (optional)

To serve at `www.positron3d.com`, add a `CNAME` file at the repo root containing `www.positron3d.com`, then point the domain's DNS at GitHub Pages. **Note:** that domain currently resolves to the old Odoo site — repointing DNS is a deliberate cut-over, so it's left out until you're ready.

## Contact form

`contact.html` posts to a Formspree placeholder (`https://formspree.io/f/your-form-id`). Replace that `action` with a real [Formspree](https://formspree.io/) form ID (or another static-form backend) to receive submissions — GitHub Pages can't process forms server-side.

## Local preview

```bash
python -m http.server 8765
# open http://127.0.0.1:8765/
```

## Credits

Built from Positron 3D's own content and imagery. © Positron 3D, LLC. Open source, built by the community.
