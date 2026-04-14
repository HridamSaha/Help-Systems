"""
Inject Auth Script & Logout Button into all protected pages.
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

# Define the files and their required roles
FILES_ROLES = {
    "admin.html": "admin",
    "police.html": "police",
    "squad-alpha.html": "police",
    "squad-bravo.html": "police",
    "squad-charlie.html": "police",
    "squad-delta.html": "police",
    "medical-admin.html": "medical",
    "med-dept-1.html": "medical",
    "med-dept-2.html": "medical",
    "med-dept-3.html": "medical",
    "med-dept-4.html": "medical",
    "fire-admin.html": "fire",
    "fire-unit-1.html": "fire",
    "fire-unit-2.html": "fire",
    "fire-unit-3.html": "fire",
    "fire-unit-4.html": "fire",
    "women-safety-admin.html": "womensafety",
    "safety-unit-1.html": "womensafety",
    "safety-unit-2.html": "womensafety",
    "safety-unit-3.html": "womensafety",
    "safety-unit-4.html": "womensafety",
    "accident-admin.html": "accident",
    "rescue-unit-1.html": "accident",
    "rescue-unit-2.html": "accident",
    "rescue-unit-3.html": "accident",
    "rescue-unit-4.html": "accident"
}

# The regex to find the <head> tag
HEAD_PATTERN = re.compile(r'(<head>)', re.IGNORECASE)

# The regex to find the end of the topbar-nav
# We'll inject the logout button right before the closing </div> of <div class="topbar-nav">
URL_NAV_END_PATTERN = re.compile(r'(</div>\s*</nav>)', re.IGNORECASE)

for fname, role in FILES_ROLES.items():
    path = os.path.join(FRONTEND, fname)
    if not os.path.exists(path):
        print(f"Skipping missing file: {fname}")
        continue

    with open(path, encoding="utf-8") as f:
        content = f.read()

    # 1. Inject auth script if not already there
    AUTH_SCRIPT = f"""  <script>
    if (localStorage.getItem('auth_{role}') !== 'true') {{
      window.location.href = 'login.html?role={role}&redirect=' + encodeURIComponent(window.location.href);
    }}
  </script>"""

    if f"auth_{role}" not in content[:1000]: # Check if script is injected
        content = HEAD_PATTERN.sub(rf'\1\n{AUTH_SCRIPT}', content, count=1)
    
    # 2. Inject Logout button in navbar if not already there
    LOGOUT_BTN = f"""      <button onclick="localStorage.removeItem('auth_{role}'); window.location.href='index.html'" style="background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3);padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;margin-left:8px;transition:0.2s;">Log Out</button>\n    """
    
    if "Log Out" not in content:
        content = URL_NAV_END_PATTERN.sub(rf'{LOGOUT_BTN}\1', content, count=1)

    # 3. Save
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Protected {fname} with role '{role}'")

print("Finished injecting auth logic.")
