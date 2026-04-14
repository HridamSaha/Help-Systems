"""
Final targeted fix: 
1. Fix 'AMB1' fallback in confirmAssign for all 3 new admin pages
2. Move storeSquad BEFORE the fetch call so assignment is always saved
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

FIXES = [
    {"file": "fire-admin.html",         "first_key": "FIRE_1"},
    {"file": "women-safety-admin.html", "first_key": "WS_1"},
    {"file": "accident-admin.html",     "first_key": "ACC_1"},
]

for fix in FIXES:
    path = os.path.join(FRONTEND, fix["file"])
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # Fix 1: Replace AMB1 fallback in confirmAssign
    content = content.replace(
        f"const chosenSquadKey = pendingAssignSquadKey || 'AMB1'; // pre-captured — immune to DOM re-render",
        f"const chosenSquadKey = pendingAssignSquadKey || '{fix['first_key']}'; // pre-captured — immune to DOM re-render"
    )

    # Fix 2: Move storeSquad BEFORE fetch so assignment survives API errors
    # The current order is: fetch → storeSquad
    # Target order: storeSquad → fetch
    old_try = """      try {
        await fetch(`http://localhost:8080/api/help/assign/${id}`, { method: 'PUT' });
        storeSquad(id, chosenSquadKey);
        startTimes[id] = Date.now();
        showToast(`${grp.icon} Case ${id} assigned to ${grp.squad}`, grp.icon);
        loadRequests();
      } catch {
        showToast('❌ Failed to assign squad', '❌');
      }"""

    new_try = """      // Store assignment locally FIRST (so unit pages work even if API is slow/fails)
      storeSquad(id, chosenSquadKey);
      startTimes[id] = Date.now();
      try {
        await fetch(`http://localhost:8080/api/help/assign/${id}`, { method: 'PUT' });
        showToast(`${grp.icon} Case ${id} assigned to ${grp.squad}`, grp.icon);
        loadRequests();
      } catch {
        showToast(`${grp.icon} ${grp.squad} assigned locally (server offline)`, grp.icon);
        loadRequests();
      }"""

    content = content.replace(old_try, new_try)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed {fix['file']}")

# Also fix medical-admin.html for consistency - it might have the same issue
path = os.path.join(FRONTEND, "medical-admin.html")
with open(path, encoding="utf-8") as f:
    content = f.read()

old_try_med = """      try {
        await fetch(`http://localhost:8080/api/help/assign/${id}`, { method: 'PUT' });
        storeSquad(id, chosenSquadKey);
        startTimes[id] = Date.now();
        showToast(`${grp.icon} Case ${id} assigned to ${grp.squad}`, grp.icon);
        loadRequests();
      } catch {
        showToast('❌ Failed to assign squad', '❌');
      }"""

new_try_med = """      storeSquad(id, chosenSquadKey);
      startTimes[id] = Date.now();
      try {
        await fetch(`http://localhost:8080/api/help/assign/${id}`, { method: 'PUT' });
        showToast(`${grp.icon} Case ${id} assigned to ${grp.squad}`, grp.icon);
        loadRequests();
      } catch {
        showToast(`${grp.icon} ${grp.squad} assigned locally (server offline)`, grp.icon);
        loadRequests();
      }"""

new_content = content.replace(old_try_med, new_try_med)
if new_content != content:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Fixed medical-admin.html")
else:
    print("medical-admin.html - no change needed")

print("Done.")
