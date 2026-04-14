"""
Generator script for Fire, Women Safety, and Accident stakeholder pages.
Creates: 3 admin dashboards + 4 unit pages each = 15 new files
Based on: medical-admin.html and med-dept-1.html as templates
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

# ──────────────────────────────────────────────────────────
# Read templates
# ──────────────────────────────────────────────────────────
with open(f"{FRONTEND}/medical-admin.html", encoding="utf-8") as f:
    ADMIN_TEMPLATE = f.read()

with open(f"{FRONTEND}/med-dept-1.html", encoding="utf-8") as f:
    DEPT_TEMPLATE = f.read()

# ──────────────────────────────────────────────────────────
# Department definitions
# ──────────────────────────────────────────────────────────
DEPTS = [
    {
        "id": "fire",
        "issue_type": "FIRE",
        "admin_file": "fire-admin.html",
        "admin_title": "Fire Control Room – Help Systems",
        "admin_desc": "Fire department control room to manage and dispatch fire emergency cases.",
        "admin_hero_icon": "🔥",
        "admin_hero_gradient": "#f97316, #b45309",
        "admin_hero_shadow": "rgba(249, 115, 22, 0.35)",
        "admin_avatar_gradient": "#f97316, #ef4444",
        "admin_heading": "Fire Control Room",
        "admin_subheading": "Manage and dispatch fire emergency requests",
        "storage_key": "request_fire_squad_",
        "squads": [
            {"key": "FIRE_1", "name": "Fire Engine 1", "icon": "🚒", "priority": "CRITICAL",
             "color": "#f87171", "color_dim": "rgba(248,113,113,0.12)", "color_border_hex": "rgba(248,113,113,0.3)",
             "grad1": "#f87171", "grad2": "#b91c1c", "file": "fire-unit-1.html", "nav_label": "🔴 Engine 1"},
            {"key": "FIRE_2", "name": "Fire Engine 2", "icon": "🚒", "priority": "HIGH",
             "color": "#fb923c", "color_dim": "rgba(251,146,60,0.12)", "color_border_hex": "rgba(251,146,60,0.3)",
             "grad1": "#fb923c", "grad2": "#c2410c", "file": "fire-unit-2.html", "nav_label": "🟠 Engine 2"},
            {"key": "FIRE_3", "name": "Rescue Unit", "icon": "🪖", "priority": "MEDIUM",
             "color": "#facc15", "color_dim": "rgba(250,204,21,0.12)", "color_border_hex": "rgba(250,204,21,0.3)",
             "grad1": "#facc15", "grad2": "#a16207", "file": "fire-unit-3.html", "nav_label": "🟡 Rescue"},
            {"key": "FIRE_4", "name": "Hazmat Team", "icon": "☢️", "priority": "LOW",
             "color": "#4ade80", "color_dim": "rgba(74,222,128,0.12)", "color_border_hex": "rgba(74,222,128,0.3)",
             "grad1": "#4ade80", "grad2": "#15803d", "file": "fire-unit-4.html", "nav_label": "🟢 Hazmat"},
        ]
    },
    {
        "id": "women_safety",
        "issue_type": "WOMEN_SAFETY",
        "admin_file": "women-safety-admin.html",
        "admin_title": "Women Safety Control Room – Help Systems",
        "admin_desc": "Women safety control room to manage and dispatch pink patrol units.",
        "admin_hero_icon": "🚺",
        "admin_hero_gradient": "#a855f7, #7c3aed",
        "admin_hero_shadow": "rgba(168, 85, 247, 0.35)",
        "admin_avatar_gradient": "#a855f7, #6366f1",
        "admin_heading": "Women Safety Control Room",
        "admin_subheading": "Manage and dispatch women safety patrol units",
        "storage_key": "request_safety_squad_",
        "squads": [
            {"key": "WS_1", "name": "Pink Patrol Alpha", "icon": "👩‍✈️", "priority": "CRITICAL",
             "color": "#f87171", "color_dim": "rgba(248,113,113,0.12)", "color_border_hex": "rgba(248,113,113,0.3)",
             "grad1": "#f87171", "grad2": "#b91c1c", "file": "safety-unit-1.html", "nav_label": "🔴 Patrol Alpha"},
            {"key": "WS_2", "name": "Pink Patrol Bravo", "icon": "👩‍✈️", "priority": "HIGH",
             "color": "#e879f9", "color_dim": "rgba(232,121,249,0.12)", "color_border_hex": "rgba(232,121,249,0.3)",
             "grad1": "#e879f9", "grad2": "#a21caf", "file": "safety-unit-2.html", "nav_label": "🟣 Patrol Bravo"},
            {"key": "WS_3", "name": "Women Help Desk", "icon": "🏥", "priority": "MEDIUM",
             "color": "#facc15", "color_dim": "rgba(250,204,21,0.12)", "color_border_hex": "rgba(250,204,21,0.3)",
             "grad1": "#facc15", "grad2": "#a16207", "file": "safety-unit-3.html", "nav_label": "🟡 Help Desk"},
            {"key": "WS_4", "name": "Crisis Response", "icon": "🛡️", "priority": "LOW",
             "color": "#4ade80", "color_dim": "rgba(74,222,128,0.12)", "color_border_hex": "rgba(74,222,128,0.3)",
             "grad1": "#4ade80", "grad2": "#15803d", "file": "safety-unit-4.html", "nav_label": "🟢 Crisis"},
        ]
    },
    {
        "id": "accident",
        "issue_type": "ACCIDENT",
        "admin_file": "accident-admin.html",
        "admin_title": "Accident Rescue Control Room – Help Systems",
        "admin_desc": "Accident rescue control room to manage and dispatch rescue teams.",
        "admin_hero_icon": "🚗",
        "admin_hero_gradient": "#64748b, #334155",
        "admin_hero_shadow": "rgba(100, 116, 139, 0.35)",
        "admin_avatar_gradient": "#64748b, #6366f1",
        "admin_heading": "Accident Rescue Control Room",
        "admin_subheading": "Manage and dispatch accident rescue and trauma teams",
        "storage_key": "request_accident_squad_",
        "squads": [
            {"key": "ACC_1", "name": "Trauma Unit 1", "icon": "🚑", "priority": "CRITICAL",
             "color": "#f87171", "color_dim": "rgba(248,113,113,0.12)", "color_border_hex": "rgba(248,113,113,0.3)",
             "grad1": "#f87171", "grad2": "#b91c1c", "file": "rescue-unit-1.html", "nav_label": "🔴 Trauma 1"},
            {"key": "ACC_2", "name": "Trauma Unit 2", "icon": "🚑", "priority": "HIGH",
             "color": "#fb923c", "color_dim": "rgba(251,146,60,0.12)", "color_border_hex": "rgba(251,146,60,0.3)",
             "grad1": "#fb923c", "grad2": "#c2410c", "file": "rescue-unit-2.html", "nav_label": "🟠 Trauma 2"},
            {"key": "ACC_3", "name": "Traffic Police", "icon": "👮", "priority": "MEDIUM",
             "color": "#facc15", "color_dim": "rgba(250,204,21,0.12)", "color_border_hex": "rgba(250,204,21,0.3)",
             "grad1": "#facc15", "grad2": "#a16207", "file": "rescue-unit-3.html", "nav_label": "🟡 Traffic Police"},
            {"key": "ACC_4", "name": "Road Rescue", "icon": "🏗️", "priority": "LOW",
             "color": "#4ade80", "color_dim": "rgba(74,222,128,0.12)", "color_border_hex": "rgba(74,222,128,0.3)",
             "grad1": "#4ade80", "grad2": "#15803d", "file": "rescue-unit-4.html", "nav_label": "🟢 Road Rescue"},
        ]
    }
]

# ──────────────────────────────────────────────────────────────────────────────
# Helpers that generate the squad rows inside admin HTML
# ──────────────────────────────────────────────────────────────────────────────
def make_squad_group_cards(squads, storage_key):
    """Generate the 4 squad group cards for the admin panel."""
    UC_MAP = {"CRITICAL": "gc-critical", "HIGH": "gc-high", "MEDIUM": "gc-medium", "LOW": "gc-low"}
    ICON_MAP = {"CRITICAL": "🚨", "HIGH": "🔶", "MEDIUM": "🔷", "LOW": "🔹"}
    rows = []
    for sq in squads:
        gc = UC_MAP.get(sq["priority"], "gc-low")
        icon = ICON_MAP.get(sq["priority"], "🔹")
        rows.append(f"""
        <div class="group-card {gc}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <div class="gc-squad-name">{sq['icon']} {sq['name']}</div>
              <div class="gc-handles">{sq['priority']} priority</div>
            </div>
            <span class="gc-icon">{icon}</span>
          </div>
          <div class="gc-count-row">
            <div class="gc-count" id="gc-{sq['key'].lower().replace('_','-')}-active">—</div>
            <div style="text-align:right">
              <div style="font-size:10px;color:var(--text-3);font-weight:600;">ACTIVE</div>
              <div class="gc-pending-tag" id="gc-{sq['key'].lower().replace('_','-')}-status">Loading…</div>
            </div>
          </div>
          <a href="{sq['file']}" style="display:block;margin-top:12px;text-align:center;font-size:12px;font-weight:700;color:{sq['color']};text-decoration:none;padding:6px;border-radius:8px;border:1px solid {sq['color_border_hex']};background:{sq['color_dim']};">→ Open {sq['name']}</a>
        </div>""")
    return "\n".join(rows)


def make_squad_dropdown_options(squads):
    """Generate <option> elements for the dispatch dropdown."""
    return "\n".join(
        f'          <option value="{sq["key"]}">{sq["icon"]} {sq["name"]} ({sq["priority"]})</option>'
        for sq in squads
    )


def make_squad_js_config(squads):
    """Generate the SQUAD_GROUPS JS constant for the admin page."""
    entries = []
    for sq in squads:
        entries.append(f"""  {sq['key']}: {{ name: '{sq['name']}', icon: '{sq['icon']}', color: '{sq['color']}', priority: '{sq['priority']}', desc: '{sq['name']} — handles {sq["priority"].lower()} priority cases', file: '{sq['file']}' }}""")
    return "const SQUAD_GROUPS = {\n" + ",\n".join(entries) + "\n};"


def make_squad_js_busy_logic(squads, storage_key):
    """Generate the JS to populate group cards."""
    lines = []
    for sq in squads:
        safe_id = sq['key'].lower().replace('_', '-')
        lines.append(f"""      const cnt_{sq['key']} = allData.filter(r => localStorage.getItem('{storage_key}' + r.requestId) === '{sq['key']}' && (r.status||'').toUpperCase() !== 'RESOLVED').length;
      document.getElementById('gc-{safe_id}-active').innerText = cnt_{sq['key']};
      document.getElementById('gc-{safe_id}-status').innerText = cnt_{sq['key']} > 0 ? 'BUSY' : 'AVAILABLE';""")
    return "\n".join(lines)


def make_squad_urgency_map(squads):
    """URGENCY_GROUP JS constant for the admin page."""
    entries = []
    priority_colors = {
        "CRITICAL": {"squad": "Alpha", "cls": "grp-alpha", "icon": "🚨"},
        "HIGH":     {"squad": "Bravo", "cls": "grp-bravo",  "icon": "🔶"},
        "MEDIUM":   {"squad": "Charlie", "cls": "grp-charlie", "icon": "🔷"},
        "LOW":      {"squad": "Delta", "cls": "grp-delta",  "icon": "🔹"},
    }
    for sq in squads:
        pc = priority_colors.get(sq["priority"], priority_colors["LOW"])
        entries.append(f"  {sq['priority']}: {{ squad: '{sq['name']}', cls: 'grp-{sq['priority'].lower()}', icon: '{sq['icon']}', key: '{sq['key']}' }}")
    return "const URGENCY_GROUP = {\n" + ",\n".join(entries) + "\n};"


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN PAGE GENERATOR
# ──────────────────────────────────────────────────────────────────────────────
def generate_admin(dept):
    squads = dept["squads"]
    storage_key = dept["storage_key"]

    html = ADMIN_TEMPLATE

    # Title / meta
    html = html.replace("Medical Admin – Help Systems", dept["admin_title"])
    html = html.replace(
        'content="Police officer dashboard to manage and resolve emergency help requests with group-based auto-assignment."',
        f'content="{dept["admin_desc"]}"'
    )

    # Hero icon gradient
    html = re.sub(
        r'background: linear-gradient\(135deg, #3b82f6, #1d4ed8\);',
        f'background: linear-gradient(135deg, {dept["admin_hero_gradient"]});',
        html, count=1
    )
    html = re.sub(
        r'box-shadow: 0 8px 26px rgba\(59, 130, 246, 0.35\);',
        f'box-shadow: 0 8px 26px {dept["admin_hero_shadow"]};',
        html, count=1
    )
    # Avatar gradient
    html = re.sub(
        r'background: linear-gradient\(135deg, #3b82f6, #6366f1\);',
        f'background: linear-gradient(135deg, {dept["admin_avatar_gradient"]});',
        html, count=1
    )

    # Hero heading
    html = html.replace("Medical Control Room", dept["admin_heading"])
    html = html.replace("Manage and dispatch medical emergency requests", dept["admin_subheading"])
    html = re.sub(r'(<div class="police-hero-icon">)🏥(</div>)', rf'\g<1>{dept["admin_hero_icon"]}\g<2>', html)

    # Officer bar text
    html = html.replace("Medical Dispatch", f'{dept["admin_hero_icon"]} Dispatch')
    html = html.replace("Medical Admin Control Room", f'{dept["admin_heading"]}')
    html = html.replace("Medical Control Room", dept["admin_heading"])

    # Issue type filter
    html = re.sub(
        r"rawData\.filter\(r => \(r\.issueType \|\| ''\)\.toUpperCase\(\) !== 'MEDICAL'\)",
        f"rawData.filter(r => (r.issueType || '').toUpperCase() === '{dept['issue_type']}')",
        html
    )

    # Storage key
    html = html.replace("'request_med_squad_'", f"'{storage_key}'")
    html = html.replace('"request_med_squad_"', f'"{storage_key}"')

    # Nav links — update the topbar to point to correct admin
    html = re.sub(
        r'<a href="medical-admin\.html">.*?</a>',
        f'<a href="{dept["admin_file"]}" class="active">🚨 {dept["admin_heading"]}</a>',
        html
    )
    # Nav active link
    html = re.sub(r'class="active"\s*>Medical Admin</a>', f'class="active">{dept["admin_hero_icon"]} {dept["admin_heading"]}</a>', html)

    # Squad group cards
    medical_groups_pattern = re.compile(
        r'<div class="groups-grid" id="groupsGrid">.*?</div>\s*</div>\s*</div>\s*<!-- Tabs',
        re.DOTALL
    )
    new_groups_html = f'''<div class="groups-grid" id="groupsGrid">
{make_squad_group_cards(squads, storage_key)}
        </div>
      </div>
    </div>

    <!-- Tabs'''
    html = medical_groups_pattern.sub(new_groups_html, html)

    # Squad dropdown options
    medical_opts_pattern = re.compile(
        r'<option value="AMB1">.*?</option>\s*<option value="AMB2">.*?</option>\s*<option value="PARAMEDIC">.*?</option>\s*<option value="AIR_AMB">.*?</option>',
        re.DOTALL
    )
    html = medical_opts_pattern.sub(make_squad_dropdown_options(squads), html)

    # JS SQUAD_GROUPS constant
    medical_squads_js = re.compile(
        r'const SQUAD_GROUPS = \{.*?\};',
        re.DOTALL
    )
    html = medical_squads_js.sub(make_squad_js_config(squads), html)

    # JS URGENCY_GROUP constant
    urgency_group_js = re.compile(r'const URGENCY_GROUP = \{.*?\};', re.DOTALL)
    html = urgency_group_js.sub(make_squad_urgency_map(squads), html)

    # JS busy/active count population
    busy_logic_pattern = re.compile(
        r'// Populate group cards.*?renderTable\(allData\);',
        re.DOTALL
    )
    busy_logic_replacement = f"""// Populate group cards
      {make_squad_js_busy_logic(squads, storage_key)}
      renderTable(allData);"""
    html = busy_logic_pattern.sub(busy_logic_replacement, html)

    out_path = f"{FRONTEND}/{dept['admin_file']}"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[OK] {dept['admin_file']}")


# ──────────────────────────────────────────────────────────────────────────────
# UNIT PAGE GENERATOR
# ──────────────────────────────────────────────────────────────────────────────
def generate_unit(dept, squad):
    html = DEPT_TEMPLATE

    storage_key = dept["storage_key"]

    # Replace storage key
    html = html.replace("'request_med_squad_'", f"'{storage_key}'")
    html = html.replace('"request_med_squad_"', f'"{storage_key}"')

    # Replace SQUAD_KEY
    html = html.replace("const SQUAD_KEY = 'AMB1';", f"const SQUAD_KEY = '{squad['key']}';")

    # Replace colors
    html = html.replace("--squad-color: #f87171;", f"--squad-color: {squad['color']};")
    html = html.replace("--squad-color-dim: rgba(248, 113, 113, 0.12);", f"--squad-color-dim: {squad['color_dim']};")
    html = html.replace("--squad-border: rgba(248, 113, 113, 0.3);", f"--squad-border: {squad['color_border_hex']};")
    html = html.replace("--squad-glow: rgba(248, 113, 113, 0.25);", f"--squad-glow: {squad['color_dim']};")
    html = html.replace(
        "background: linear-gradient(135deg, #f87171, #b91c1c);",
        f"background: linear-gradient(135deg, {squad['grad1']}, {squad['grad2']});"
    )

    # Replace name/title
    html = html.replace("Ambulance 1", squad["name"])

    # Replace icon
    html = re.sub(r'(<div class="squad-hero-icon">)🚨(</div>)', rf'\g<1>{squad["icon"]}\g<2>', html)

    # Nav bar
    html = re.sub(
        r'<a href="medical-admin\.html">Control Room</a>',
        f'<a href="{dept["admin_file"]}">Control Room</a>',
        html
    )
    html = re.sub(
        r'<a href="med-dept-1\.html" class="active">.*?</a>',
        f'<a href="{squad["file"]}" class="active">{squad["nav_label"]}</a>',
        html
    )
    # ← Control Room back link
    html = html.replace(
        'href="medical-admin.html" style="font-size:12px',
        f'href="{dept["admin_file"]}" style="font-size:12px'
    )

    # Title
    html = html.replace(
        '<title>Ambulance 1 — Help Systems</title>',
        f'<title>{squad["name"]} — Help Systems</title>'
    )
    html = html.replace(
        'content="Ambulance 1 interface — view and resolve assigned emergency cases."',
        f'content="{squad["name"]} interface — view and resolve assigned emergency cases."'
    )

    out_path = f"{FRONTEND}/{squad['file']}"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  [OK] {squad['file']}")


# ──────────────────────────────────────────────────────────────────────────────
# RUN
# ──────────────────────────────────────────────────────────────────────────────
for dept in DEPTS:
    print(f"\nGenerating {dept['id'].upper()} pages...")
    generate_admin(dept)
    for squad in dept["squads"]:
        generate_unit(dept, squad)

print("\n✅ All pages generated successfully!")
