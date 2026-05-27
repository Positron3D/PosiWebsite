# -*- coding: utf-8 -*-
"""Static site generator for Positron 3D.
Run from anywhere: python _build/build.py  (writes pages to repo root)."""
import os, sys
io = sys.stdout
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAV_ITEMS = [
    ("Home", "index.html"),
    ("Our Printers ▾", "printers.html"),  # dropdown handled specially
    ("Documentation", "documentation.html"),
    ("Merch", "https://nomadsgalaxy-shop.fourthwall.com"),
    ("Credits", "credits.html"),
    ("Contact", "contact.html"),
]

BSKY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5.7 3.3C8.2 5.2 10.9 9 12 11c1.1-2 3.8-5.8 6.3-7.7 1.8-1.4 4.7-2.4 4.7.9 0 .7-.4 5.5-.6 6.3-.7 2.6-3.4 3.3-5.7 2.9 4.1.7 5.1 3 2.9 5.3-4.3 4.4-6.1-1.1-6.6-2.5-.1-.3-.2-.4-.2-.3-.1-.1-.1 0-.2.3-.5 1.4-2.3 6.9-6.6 2.5-2.2-2.3-1.2-4.6 2.9-5.3-2.3.4-5-.3-5.7-2.9C2.7 9.8 2.3 5 2.3 4.2c0-3.3 2.9-2.3 4.7-.9z"/></svg>'
GH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7 0-.7 0-.7 1.2 0 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.3v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>'
DISCORD = '<svg viewBox="0 -28.5 256 256" width="18" height="18" preserveAspectRatio="xMidYMid"><path fill="currentColor" fill-rule="nonzero" d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/></svg>'

def header(active):
    links = []
    for label, href in NAV_ITEMS:
        if label.startswith("Our Printers"):
            cur = ' aria-current="page"' if active in ("printers","positron","proton","prusawire") else ""
            links.append(
                '<li class="nav__item dropdown">'
                f'<a href="printers.html" aria-haspopup="true"{cur}>Our Printers ▾</a>'
                '<ul class="dropdown__menu">'
                '<li><a href="positron.html">Positron</a></li>'
                '<li><a href="proton.html">Proton</a></li>'
                '<li><a href="prusawire.html">Prusawire</a></li>'
                '</ul></li>')
            continue
        ext = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
        key = href.replace(".html","")
        cur = ' aria-current="page"' if key == active else ""
        links.append(f'<li><a href="{href}"{ext}{cur}>{label}</a></li>')
    links_html = "\n          ".join(links)
    return f'''  <header class="site-header">
    <div class="container">
      <nav class="nav" aria-label="Main navigation">
        <a class="nav__brand" href="index.html"><img src="assets/img/logo.svg" alt="Positron 3D"></a>
        <ul class="nav__links">
          {links_html}
        </ul>
        <div class="nav__social">
          <a href="https://bsky.app/profile/positron3d.com" target="_blank" rel="noopener" aria-label="Bluesky">{BSKY}</a>
          <a href="https://github.com/Positron3D" target="_blank" rel="noopener" aria-label="GitHub">{GH}</a>
        </div>
        <div class="nav__cta"><a class="btn btn--sm" href="contact.html">About / Contact</a></div>
        <button class="nav__toggle" aria-label="Toggle menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </nav>
    </div>
  </header>'''

FOOTER = f'''  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand" style="max-width:280px">
          <img src="assets/img/logo.svg" alt="Positron 3D">
          <p>Compact, portable, capable. The ultimate open-source portable 3D printer.</p>
          <p>📍 Philadelphia, PA</p>
        </div>
        <div class="footer-col">
          <h4>Printers</h4>
          <ul>
            <li><a href="positron.html">Positron</a></li>
            <li><a href="proton.html">Proton</a></li>
            <li><a href="prusawire.html">Prusawire</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="documentation.html">Documentation</a></li>
            <li><a href="credits.html">Credits</a></li>
            <li><a href="https://nomadsgalaxy-shop.fourthwall.com" target="_blank" rel="noopener">Merch</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <div class="footer-social">
            <a href="https://discord.gg/positron" target="_blank" rel="noopener" aria-label="Discord">{DISCORD}</a>
            <a href="https://bsky.app/profile/positron3d.com" target="_blank" rel="noopener" aria-label="Bluesky">{BSKY}</a>
            <a href="https://github.com/Positron3D" target="_blank" rel="noopener" aria-label="GitHub">{GH}</a>
          </div>
          <p style="margin-top:16px"><a class="btn btn--sm" href="https://www.paypal.com/donate/?hosted_button_id=P3WHJNXLBCJDA" target="_blank" rel="noopener">♥ Donate</a></p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Positron 3D, LLC</span>
        <span>Open source · Built by the community</span>
      </div>
    </div>
  </footer>

  <script src="assets/js/main.js"></script>
</body>
</html>'''

def page(active, title, desc, body, hero_img=None):
    head = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/png" href="assets/img/logo-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

'''
    return head + header(active) + "\n\n" + body + "\n\n" + FOOTER + "\n"

def page_hero(title, sub, img):
    return f'''  <section class="page-hero">
    <div class="page-hero__bg" style="background-image:url('assets/img/{img}')"></div>
    <div class="container">
      <h1>{title}</h1>
      <p class="lead center">{sub}</p>
    </div>
  </section>'''

def write(name, html):
    with open(os.path.join(ROOT, name), "w", encoding="utf-8") as f:
        f.write(html)
    io.write("wrote %s (%d bytes)\n" % (name, len(html)))

# ---------------------------------------------------------------- HOME
home_body = '''  <section class="hero">
    <div class="hero__bg" style="background-image:url('assets/img/hero.jpg')"></div>
    <div class="hero__inner">
      <p class="eyebrow">Open-source 3D printing</p>
      <h1>Compact. <span class="highlight">Portable.</span> Capable.</h1>
      <p class="lead">Positron is the ultimate portable 3D printer — lightweight, reliable, and fully open source, with an assembly approachable for makers of every skill level.</p>
      <div class="hero__cta">
        <a class="btn" href="printers.html">Explore Our Printers</a>
        <a class="btn btn--ghost" href="positron.html">Build Your Own</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="grid grid--3">
        <article class="card">
          <div class="card__media"><img src="assets/img/card-printers.jpg" alt="Positron printer" loading="lazy"></div>
          <div class="card__body"><h3>Our Printers</h3><p>Build your own Positron, Proton, and more chaotic projects.</p><a class="btn btn--sm" href="printers.html">More Details</a></div>
        </article>
        <article class="card">
          <div class="card__media"><img src="assets/img/community-1.jpg" alt="Building a Positron kit" loading="lazy"></div>
          <div class="card__body"><h3>Documentation</h3><p>Got the kit? Time to build! Guides, the Wiki, and source files.</p><a class="btn btn--sm" href="documentation.html">More Details</a></div>
        </article>
        <article class="card">
          <div class="card__media"><img src="assets/img/card-discord.jpg" alt="Positron community" loading="lazy"></div>
          <div class="card__body"><h3>Discord Community</h3><p>Join our Discord for additional resources, support, and community mods.</p><a class="btn btn--sm" href="https://discord.gg/positron" target="_blank" rel="noopener">More Details</a></div>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="split split--rev">
        <div class="split__text">
          <p class="eyebrow">About Us</p>
          <h2>Positron 3D</h2>
          <p>We are a group of creators with a passion for breaking the mold. The Positron printer was meant to be an ultra-portable solution, so that makers can take their craft mobile.</p>
          <a class="btn" href="contact.html">Learn more</a>
        </div>
        <div class="split__media"><img src="assets/img/about.jpg" alt="Positron printer detail"></div>
      </div>
    </div>
  </section>

  <section class="banner">
    <div class="banner__bg" style="background-image:url('assets/img/banner.jpg')"></div>
    <div class="container"><h2>Compact, <span class="highlight">Portable</span>, Capable.</h2></div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="center">Official Project Partners</h2>
      <p class="lead center" style="margin-bottom:46px">The makers and manufacturers who help bring Positron to life.</p>
      <div class="logos">
        <a class="logo-card" href="https://sendcutsend.com" target="_blank" rel="noopener"><div class="logo-card__chip"><img src="assets/img/partner-sendcutsend.png" alt="SendCutSend"></div><h3>SendCutSend</h3><span class="btn btn--sm btn--ghost">More Details</span></a>
        <a class="logo-card" href="https://ldomotion.com" target="_blank" rel="noopener"><div class="logo-card__chip"><img src="assets/img/partner-ldo.webp" alt="LDO Motors"></div><h3>LDO Motors</h3><span class="btn btn--sm btn--ghost">More Details</span></a>
        <a class="logo-card" href="https://www.printedsolid.com" target="_blank" rel="noopener"><div class="logo-card__chip"><img src="assets/img/partner-printedsolid.png" alt="PrintedSolid"></div><h3>PrintedSolid</h3><span class="btn btn--sm btn--ghost">More Details</span></a>
        <a class="logo-card" href="https://www.prusa3d.com" target="_blank" rel="noopener"><div class="logo-card__chip"><img src="assets/img/partner-prusa.png" alt="Prusa Research"></div><h3>Prusa Research</h3><span class="btn btn--sm btn--ghost">More Details</span></a>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="split">
        <div class="split__text">
          <p class="eyebrow">Positron v3.2 Features</p>
          <h2>Award-nominated by design</h2>
          <p>The Positron Printer has been nominated for the 3D Printing Industry Awards — Best Desktop FFF 3D Printer of the Year. Here's why:</p>
          <div class="grid" style="gap:22px;margin-top:24px">
            <div class="feature"><div class="feature__icon">⚙️</div><div><h4>Fast &amp; Reliable</h4><p>Using high-quality hardware and a lightweight toolhead, the Positron pushes plastic at up to 30 mm³/s with its high-flow hotend.</p></div></div>
            <div class="feature"><div class="feature__icon">📦</div><div><h4>Compact</h4><p>The Positron sports the largest printer-size-to-print-volume ratio of any printer on the market — perfect for tight spaces, or packing in as many as possible.</p></div></div>
            <div class="feature"><div class="feature__icon">🔧</div><div><h4>Easily Repairable</h4><p>Most components are accessible within just a few screws, so almost any part can be replaced or repaired as needed.</p></div></div>
          </div>
        </div>
        <div class="split__media center"><img src="assets/img/award.webp" alt="3D Printing Industry Awards 2024 — Nominated, Desktop FFF" style="max-width:340px;margin:0 auto"></div>
      </div>
    </div>
  </section>'''
write("index.html", page("index", "Positron 3D — Compact, Portable, Capable",
      "Positron is the ultimate portable 3D printer designed to be lightweight, reliable, and capable. Fully open source and an approachable assembly.", home_body))

# ---------------------------------------------------------------- PRINTERS
printers_body = page_hero("Our Printers", "At Positron3D, we make printers fun. Here are a few of our chaotic projects.", "feature-bg.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="grid grid--3">
        <article class="card">
          <div class="card__media"><img src="assets/img/printer-positron.jpg" alt="Positron v3.2" loading="lazy"></div>
          <div class="card__body"><h3>Positron v3.2</h3><p>Fits in a filament box — the first of our chaotic projects.</p><a class="btn btn--sm" href="positron.html">Details</a></div>
        </article>
        <article class="card">
          <div class="card__media"><img src="assets/img/printer-proton.jpg" alt="Proton" loading="lazy"></div>
          <div class="card__body"><h3>Proton</h3><p>Aka the Anti-Proton — this is the Positron's big brother.</p><a class="btn btn--sm" href="proton.html">Details</a></div>
        </article>
        <article class="card">
          <div class="card__media"><img src="assets/img/printer-prusawire.jpg" alt="Prusawire" loading="lazy"></div>
          <div class="card__body"><h3>Prusawire</h3><p>Our 2025 April Fools joke, made right by Ella Fox.</p><a class="btn btn--sm" href="prusawire.html">Details</a></div>
        </article>
      </div>
    </div>
  </section>'''
write("printers.html", page("printers", "Our Printers | Positron 3D",
      "At Positron3D, we make printers fun. Explore the Positron, Proton, and Prusawire.", printers_body))

# ---------------------------------------------------------------- POSITRON
positron_body = page_hero("Positron v3.2", "Available as a full D.I.Y. kit, with pre-assembled units potentially coming in the future. Below you'll find where to get kits, parts, and legacy items for the V3.2 and V3.", "card-printers.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="grid grid--3">
        <div class="feature feature--center"><div class="feature__icon">✈️</div><div><h4>Portable</h4><p>Passed through over 50 airports, the Positron adheres to FAA regulations and counts as a personal item on most airlines. #DontPrintOnPlanes</p></div></div>
        <div class="feature feature--center"><div class="feature__icon">💎</div><div><h4>High Quality</h4><p>Positron kits are made of high-quality machined parts, ensuring they survive the travel.</p></div></div>
        <div class="feature feature--center"><div class="feature__icon">🔓</div><div><h4>Open Source</h4><p>Completely open source — customize the printer however you see fit to better suit your needs. Make it your own.</p></div></div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <h2 class="center">Positron v3.2 Kits</h2>
      <p class="lead center" style="margin-bottom:46px">Get the latest Positron revision in an all-in-one D.I.Y. kit with the highest-quality parts. <span style="color:var(--muted)">* uses an affiliate link to help support the Positron Project.</span></p>
      <div class="grid grid--3">
        <div class="region-block"><h3>USA / Canada</h3>
          <div class="retailer"><a href="https://collabs.shop/tzhpj4" target="_blank" rel="noopener">West 3D *</a></div>
          <div class="retailer"><a href="https://www.fabreeko.com/products/positron-v3-2-3d-printer-kit-by-ldo" target="_blank" rel="noopener">Fabreeko</a> <span class="loc">FL</span></div>
          <div class="retailer"><a href="https://kb-3d.com/store/positron/1154-ldo-positron-v32-3d-printer-build-kit-1714355343710.html?affp=22155" target="_blank" rel="noopener">KB3D *</a> <span class="loc">OH</span></div>
          <div class="retailer"><a href="https://www.matterhackers.com/store/l/ldo-positron-3d-printer-kit/sk/MVXG5G0R" target="_blank" rel="noopener">MatterHackers</a> <span class="loc">PA / CA</span></div>
        </div>
        <div class="region-block"><h3>UK</h3>
          <div class="retailer"><a href="https://www.desktopmachineshop.com/shop/ldo-positron-v3-2-90" target="_blank" rel="noopener">DMS</a></div>
          <div class="retailer"><a href="https://www.onetwo3d.co.uk/product/ldo-positron-3-2-diy-kit/" target="_blank" rel="noopener">OneTwo3D</a></div>
        </div>
        <div class="region-block"><h3>EU</h3>
          <div class="retailer"><a href="https://levendigs.com/products/pre-order-ldo-positron-v3-2-kit-ldo-motors" target="_blank" rel="noopener">Levendigs</a> <span class="loc">Netherlands</span></div>
          <div class="retailer"><a href="https://www.3djake.uk/ldo-motors/positron-v32-kit" target="_blank" rel="noopener">3DJake</a> <span class="loc">Austria</span></div>
          <div class="retailer"><a href="https://en.ravmeimad.shop/product-page/ldo-positron-v3-2-diy-kit" target="_blank" rel="noopener">Ravmeimad</a> <span class="loc">Israel</span></div>
        </div>
        <div class="region-block"><h3>AU</h3>
          <div class="retailer"><a href="https://store.dremc.com.au/products/ldo-positron-v3-2-diy-kit" target="_blank" rel="noopener">DREMC</a></div>
        </div>
      </div>
      <p class="center" style="margin-top:30px">Don't see a retailer in your area? <a href="https://www.ldomotion.com/p/contact" target="_blank" rel="noopener">Check LDO's retailer site →</a></p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="center">Positron v3.2 Parts</h2>
      <p class="lead center" style="margin-bottom:46px">Get Positron v3.2 parts for self-sourcing, spares, or 3D-printed parts.</p>
      <div class="grid grid--2">
        <div class="region-block"><h3>USA — 3D Printed Parts</h3>
          <p style="margin-bottom:14px">These parts are produced by Positron 3D.</p>
          <div class="retailer"><a href="https://collabs.shop/lk3cdn" target="_blank" rel="noopener">West 3D *</a></div>
          <div class="retailer"><a href="https://www.fabreeko.com/products/printed-parts-for-positron-v3-2-3d-printer-ldo-kit" target="_blank" rel="noopener">Fabreeko</a></div>
          <div class="retailer"><a href="https://kb-3d.com/store/positron/1147-8341-printed-parts-kit-for-positron-v32-multiple-colors-1714569690334.html?affp=22155" target="_blank" rel="noopener">KB3D *</a></div>
        </div>
        <div class="region-block"><h3>Spare Parts</h3>
          <p style="margin-bottom:14px">Other sites have spare parts, but these have direct links that make things easier.</p>
          <div class="retailer"><a href="https://kb-3d.com/store/affiliatepage/2143-kb3d-x-nomad.html?affp=22155" target="_blank" rel="noopener">KB3D *</a> <span class="loc">Ohio</span></div>
          <div class="retailer"><a href="https://www.fabreeko.com/collections/positron-3d" target="_blank" rel="noopener">Fabreeko</a> <span class="loc">Florida</span></div>
          <div class="retailer"><a href="https://levendigs.com/nl/collections/positron-kits-and-parts" target="_blank" rel="noopener">Levendigs</a> <span class="loc">Netherlands</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <h2 class="center">Positron v3 Forks</h2>
      <p class="lead center" style="margin-bottom:46px">Positron 3D no longer supports the v3 — here are some forks you can find.</p>
      <div class="grid grid--3">
        <article class="card"><div class="card__body"><h3>Positron LT</h3><p>The first Positron fork to make the original V3 more accessible. Many LT team members are now part of the Positron team.</p><a class="btn btn--sm" href="https://github.com/Audiotronix/Positron_LT" target="_blank" rel="noopener">Details</a></div></article>
        <article class="card"><div class="card__body"><h3>JourneyMaker</h3><p>One of the first Positron V3 forks with machined parts available.</p><a class="btn btn--sm" href="https://github.com/mcfazio2001/JourneyMaker-Positron" target="_blank" rel="noopener">Details</a></div></article>
        <article class="card"><div class="card__body"><h3>Lemontron</h3><p>Building off the LT and JourneyMaker, the Lemontron turns the V3 into an easy-to-print unibody design.</p><a class="btn btn--sm" href="https://lemontron.com" target="_blank" rel="noopener">Details</a></div></article>
      </div>
    </div>
  </section>'''
write("positron.html", page("positron", "Positron v3.2 | Positron 3D",
      "The Positron v3.2 portable 3D printer — D.I.Y. kits, parts, and forks. Find where to buy worldwide.", positron_body))

# ---------------------------------------------------------------- PROTON
proton_body = page_hero("Proton", "Me Me Big Boi.", "printer-proton.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="split">
        <div class="split__text">
          <p class="eyebrow">The Proton</p>
          <h2>It's a larger Positron</h2>
          <p>TL;DR — the Proton (aka Anti-Proton) is the Positron's big brother, scaled up for bigger prints while keeping the same chaotic spirit.</p>
          <ul class="specs">
            <li><b>Build Volume</b> 300 × 260 × 260 mm</li>
            <li><b>Status</b> Beta coming sometime in 2026</li>
          </ul>
          <p style="margin-top:20px">Join our <a href="https://discord.gg/positron" target="_blank" rel="noopener">Discord community</a> to follow along with development.</p>
          <a class="btn" href="https://discord.gg/positron" target="_blank" rel="noopener">Follow Development</a>
        </div>
        <div class="split__media"><img src="assets/img/proton-1.jpg" alt="Proton printer"></div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="grid grid--2">
        <img src="assets/img/proton-2.jpg" alt="Proton printer detail" style="border-radius:16px">
        <img src="assets/img/printer-proton.jpg" alt="Proton printer" style="border-radius:16px">
      </div>
    </div>
  </section>'''
write("proton.html", page("proton", "Proton | Positron 3D",
      "The Proton — the Positron's big brother. 300×260×260mm build volume, beta coming in 2026.", proton_body))

# ---------------------------------------------------------------- PRUSAWIRE
prusawire_body = page_hero("Prusawire", "Our 2025 April Fools joke, made right by Ella Fox.", "printer-prusawire.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="grid grid--3">
        <article class="card"><div class="card__body"><h3>Prusawire Documentation</h3><p>In-depth documentation on the Prusawire.</p><a class="btn btn--sm" href="https://prusawire.positron3d.com" target="_blank" rel="noopener">More Details</a></div></article>
        <article class="card"><div class="card__body"><h3>Prusawire GitHub</h3><p>The home of our source files. Find mods, printable parts, and more.</p><a class="btn btn--sm" href="https://github.com/Positron3D/Prusawire" target="_blank" rel="noopener">More Details</a></div></article>
        <article class="card"><div class="card__body"><h3>Assembly Manual</h3><p>Coming soon — check back for the full build guide.</p><span class="btn btn--sm btn--ghost">Coming Soon</span></div></article>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="grid grid--2">
        <img src="assets/img/prusawire-1.jpg" alt="Prusawire update" style="border-radius:16px">
        <img src="assets/img/prusawire-2.jpg" alt="Prusawire rendering" style="border-radius:16px">
      </div>
    </div>
  </section>'''
write("prusawire.html", page("prusawire", "Prusawire | Positron 3D",
      "The Prusawire — our 2025 April Fools joke, made right by Ella Fox. Docs, GitHub, and assembly manual.", prusawire_body))

# ---------------------------------------------------------------- DOCUMENTATION
docs_body = page_hero("Documentation", "Got the kit? Time to build. Everything you need to assemble, troubleshoot, and mod your Positron.", "feature-bg.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="grid grid--3">
        <article class="card"><div class="card__body"><h3>Positron Wiki</h3><p>A curated resource of information for the Positron printer — instructions, guides, and troubleshooting steps.</p><a class="btn btn--sm" href="https://wiki.positron3d.com" target="_blank" rel="noopener">More Details</a></div></article>
        <article class="card"><div class="card__body"><h3>Positron GitHub</h3><p>The home of our source files. Find mods, printable parts, and more.</p><a class="btn btn--sm" href="https://github.com/Positron3D/Positron" target="_blank" rel="noopener">More Details</a></div></article>
        <article class="card"><div class="card__body"><h3>LDO Guide</h3><p>The best resource for building your Positron V3.2 kit. Follow this guide, then check the Wiki for additional info.</p><a class="btn btn--sm" href="https://www.ldomotion.com/p/assembly/Positron-V32" target="_blank" rel="noopener">More Details</a></div></article>
      </div>
    </div>
  </section>'''
write("documentation.html", page("documentation", "Documentation | Positron 3D",
      "Positron documentation — the Wiki, GitHub source files, and the LDO assembly guide.", docs_body))

# ---------------------------------------------------------------- CREDITS
team = [
    ("The Nomad", "CEO / Professional Cat Wrangler"),
    ("Joescalon", "Pi Manager & Wiki Guru + Printer Go Brrrinator"),
    ("Smiksky", "Software Steward & GitHub Grappler"),
    ("Physx", "Cybersecurity & Community Relations"),
    ("ZakAss", "Master of Metal & RedNeck Engineering Consultant"),
    ("Galactic Dust Bunny", 'CAD Guru & Lead of "Stopping Nomad from Doing it Wrong"'),
    ("Mitch 3D", "Designer of Backpacks & Crazy Delta Machines"),
    ("Zolon", "Longevity & Portability Tester & Herder of Puppies"),
    ("Birb", "Designer and Professional Procrastinator"),
]
team_cards = "\n        ".join(
    f'<div class="team-card"><div class="name">{n}</div><div class="role">{r}</div></div>' for n, r in team)

ldo = [
    ("Jason", "His passion for the Positron Project and his willingness to support the open-source community have helped us thrive."),
    ("Dave", "Dave has straight up told us when designs were dumb, and significantly helped us re-design a vast majority of the Positron to make it what it is today."),
    ("Cameron", "Cameron helped guide us while our team was small, providing sound advice on how to approach various aspects of this project."),
    ("Rebecca", "Rebecca and her team are behind the LDO Guide that we all follow; their hard work makes the Positron assembly extremely approachable for all skill levels."),
    ("The Rest of the LDO Team", "There are many faces behind LDO we don't get to interact with, but LDO as a whole are dedicated to the larger 3D printing community. Their undying passion for open-source projects helped Positron through some tough times. Without LDO, Positron might not have come to fruition."),
]
ldo_cards = "\n        ".join(
    f'<div class="thanks-block"><h3>{n}</h3><p>{d}</p></div>' for n, d in ldo)

thanks = [
    ("Thank you to our Retailers", "A big shout-out to all our retailers who spotted this quirky machine and took a leap of faith with it. Collaborating with them to offer top-notch support to every member of our community has been incredibly rewarding — and now we're proud to call many of them our friends."),
    ("Thank you to our Reviewers", "We've dispatched numerous units to content creators and reviewers, trusting them to give us honest feedback on our machine. These insights have prompted countless tweaks to parts, enhanced user experiences, and refined software. We stand by our policy of not asking for anything in return when we send out a printer, ensuring the feedback is as genuine and unbiased as possible."),
    ("Thank you to our Beta Testers", "Positron went through many iterations until we settled on the current design, starting with the original v3 Alpha. We've implemented many changes based on their feedback — without them, we wouldn't have the foundation we needed to build something great."),
    ("Thank you to the Voron Team", "Steve, Nero, and other members of the Voron team were very willing to provide critical feedback, helping us re-design aspects of the machine to improve the user experience. The Voron team set an example for what an open-source 3D printer project should be, and we heavily copied their homework — but made sure to re-write the answers in our own words. Jokes aside, they're amazing and passionate, and this wouldn't have been possible without their guidance and inspiration."),
    ("Thank you to the Original Duo — Kralyn & Danning", "The original designers and team members who started this journey. While they've had to step away due to professional obligations, none of this could have happened without them. They put their trust in Nomad, who took the torch and ran with it to keep this crazy dream alive. They still keep in touch and are incredibly proud of how far the project has come."),
]
thanks_blocks = "\n        ".join(
    f'<div class="thanks-block"><h3>{t}</h3><p>{d}</p></div>' for t, d in thanks)

credits_body = page_hero("Credits", "None of this would have been possible without the people behind the Positron Project.", "banner.jpg") + f'''

  <section class="section">
    <div class="container">
      <h2 class="center">The Positron Team</h2>
      <p class="lead center" style="margin-bottom:46px">Thank you to the crew that keeps this crazy dream alive.</p>
      <div class="team-grid">
        {team_cards}
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <h2 class="center">Thank you to the LDO Team</h2>
      <div class="prose" style="margin:36px auto 0">
        {ldo_cards}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="prose" style="margin:0 auto">
        {thanks_blocks}
      </div>
    </div>
  </section>'''
write("credits.html", page("credits", "Credits | Positron 3D",
      "Thank you to the Positron team, the LDO team, our retailers, reviewers, beta testers, the Voron team, and the original duo.", credits_body))

# ---------------------------------------------------------------- CONTACT
contact_body = page_hero("About &amp; Contact", "Get in touch with the team behind the Positron Project.", "card-discord.jpg") + '''

  <section class="section">
    <div class="container">
      <div class="grid grid--2">
        <div><p class="eyebrow">About Us</p><h2>Who we are</h2><p>Started by the original designers of the Positron 3D printer, Positron 3D is the management company tasked with helping manufacturers produce high-quality parts and kits, and with ensuring the open-source nature of the Positron Project.</p></div>
        <div><p class="eyebrow">Our Goal</p><h2>What we do</h2><p>Our goal is to maintain the Positron project, ensure it remains open source, and build relationships with manufacturers to bring high-quality kits to everyone who wishes to get one.</p></div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <h2 class="center">Contact Us</h2>
      <div class="prose center" style="margin:0 auto 30px">
        <div class="note">The Contact Us form is <b>not</b> to be used for asking for printers or sponsorships. Please use this for <b>business inquiries only.</b></div>
      </div>
      <form class="prose" style="margin:0 auto" action="https://formspree.io/f/your-form-id" method="POST">
        <div class="form-grid">
          <div class="field"><label for="name">Your Name <span class="req">*</span></label><input id="name" name="name" required></div>
          <div class="field"><label for="phone">Phone Number</label><input id="phone" name="phone" type="tel"></div>
          <div class="field"><label for="email">Your Email <span class="req">*</span></label><input id="email" name="email" type="email" required></div>
          <div class="field"><label for="company">Your Company</label><input id="company" name="company"></div>
          <div class="field field--full"><label for="subject">Subject <span class="req">*</span></label><input id="subject" name="subject" required></div>
          <div class="field field--full"><label for="question">Your Question <span class="req">*</span></label><textarea id="question" name="question" required></textarea></div>
          <div class="field field--full"><button class="btn" type="submit">Submit</button></div>
        </div>
      </form>
      <p class="center" style="margin-top:24px;color:var(--muted)">Our team will message you back as soon as possible.</p>
    </div>
  </section>'''
write("contact.html", page("contact", "About & Contact | Positron 3D",
      "About Positron 3D and how to reach us. For business inquiries only — not for printer or sponsorship requests.", contact_body))

io.write("Done.\n")
