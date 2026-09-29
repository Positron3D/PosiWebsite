#!/usr/bin/env python3
"""Local preview for the Positron 3D site.

Serves the repo root on http://127.0.0.1:<port>/ and, unless --serve-only is
given, saves headless-Chrome screenshots of every page at desktop, phone and
wide widths into _preview/ (gitignored) so a change can be checked before a PR.

  python _build/preview.py                 # screenshots of every page
  python _build/preview.py index.html      # just these pages
  python _build/preview.py --serve-only    # serve and browse manually

Screenshots pin the full-height hero to a normal screen height so the whole
page fits one tall image; the live site is unchanged.
"""
import argparse
import functools
import http.server
import os
import shutil
import subprocess
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_preview")
SIZES = {"desktop": (1366, 5200), "phone": (412, 11000), "wide": (1920, 5200)}  # label: (width, height)
SHOT_CSS = b"<style>.hero{min-height:792px!important}</style></head>"
SHOT_BASE = b"<head>\n  <base href=\"/\">"  # relative asset URLs resolve from the site root
CHROMES = ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser", "chrome",
           "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
           r"C:\Program Files\Google\Chrome\Application\chrome.exe",
           r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"]


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static handler; /__shot/<page> serves <page> with the hero height pinned."""

    def log_message(self, *args):
        pass

    def do_GET(self):
        if not self.path.startswith("/__shot/"):
            return super().do_GET()
        path = os.path.join(ROOT, self.path[len("/__shot/"):].split("?")[0])
        if not os.path.isfile(path):
            return self.send_error(404)
        with open(path, "rb") as f:
            body = f.read().replace(b"<head>", SHOT_BASE, 1).replace(b"</head>", SHOT_CSS, 1)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def find_chrome():
    for c in [os.environ.get("CHROME")] + CHROMES:
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("pages", nargs="*", help="pages to capture (default: every root *.html)")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--serve-only", action="store_true")
    args = ap.parse_args()

    handler = functools.partial(Handler, directory=ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    base = f"http://127.0.0.1:{args.port}"
    if args.serve_only:
        print(f"Serving {ROOT} at {base}/ (Ctrl+C to stop)")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        return 0

    chrome = find_chrome()
    if not chrome:
        print("Chrome/Chromium not found. Set CHROME=/path/to/chrome, or use --serve-only.", file=sys.stderr)
        return 2
    threading.Thread(target=server.serve_forever, daemon=True).start()
    pages = args.pages or sorted(p for p in os.listdir(ROOT) if p.endswith(".html"))
    os.makedirs(OUT, exist_ok=True)
    for page in pages:
        for label, (width, height) in SIZES.items():
            png = os.path.join(OUT, f"{page[:-5]}-{label}.png")
            subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                            f"--window-size={width},{height}", f"--screenshot={png}",
                            "--virtual-time-budget=3000", f"{base}/__shot/{page}"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
            print(("ok  " if os.path.isfile(png) else "FAIL") + f" {os.path.relpath(png, ROOT)}")
    server.shutdown()
    print(f"\nOpen the PNGs in _preview/ and check every changed page at all three widths.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
