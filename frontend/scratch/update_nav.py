"""
Update navigation across all HTML pages to include all new department control rooms.
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

# The new unified nav (same for all pages, with active class removed here — will be set per file)
NEW_NAV = """    <div class="topbar-nav">
      <a href="index.html">Submit</a>
      <a href="track.html">Track</a>
      <a href="admin.html">Admin</a>
      <a href="police.html">Police</a>
      <a href="medical-admin.html">Medical</a>
      <a href="fire-admin.html">Fire</a>
      <a href="women-safety-admin.html">Women Safety</a>
      <a href="accident-admin.html">Accident</a>
    </div>"""

# Files we want to update the nav in (all main pages, not the squad/unit sub-pages)
MAIN_PAGES = [
    "index.html",
    "track.html",
    "admin.html",
    "police.html",
    "medical-admin.html",
    "fire-admin.html",
    "women-safety-admin.html",
    "accident-admin.html",
]

# Active link per file
ACTIVE_MAP = {
    "index.html":              "index.html",
    "track.html":              "track.html",
    "admin.html":              "admin.html",
    "police.html":             "police.html",
    "medical-admin.html":      "medical-admin.html",
    "fire-admin.html":         "fire-admin.html",
    "women-safety-admin.html": "women-safety-admin.html",
    "accident-admin.html":     "accident-admin.html",
}

# Find old topbar-nav block and replace it
NAV_PATTERN = re.compile(r'<div class="topbar-nav">.*?</div>', re.DOTALL)

for fname in MAIN_PAGES:
    path = os.path.join(FRONTEND, fname)
    if not os.path.exists(path):
        print(f"  SKIP (not found): {fname}")
        continue

    with open(path, encoding="utf-8") as f:
        content = f.read()

    # Build nav with correct active link
    active_href = ACTIVE_MAP[fname]
    nav = NEW_NAV.replace(
        f'href="{active_href}"',
        f'href="{active_href}" class="active"'
    )

    new_content = NAV_PATTERN.sub(nav, content, count=1)
    if new_content == content:
        print(f"  NO CHANGE: {fname}")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  OK: {fname}")

print("Nav update done.")
