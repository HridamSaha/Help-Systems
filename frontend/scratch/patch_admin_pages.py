"""
Direct targeted patch for the 3 new admin pages.
Fixes: wrong heading, wrong group cards, wrong issue type filter, wrong squad keys in JS.
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

DEPTS = [
    {
        "file": "fire-admin.html",
        "issue_type": "FIRE",
        "hero_icon": "🔥",
        "heading": "Fire Control Room",
        "officer_id_label": "Fire Admin · Unit Active",
        "panel_title": "🚒 Fire Units — Tap to Open Squad Interface",
        "storage_key": "request_fire_squad_",
        "squads": [
            {"key": "FIRE_1", "name": "Fire Engine 1",  "icon": "🚒", "gc": "gc-critical", "file": "fire-unit-1.html", "grp_id": "grp-alpha"},
            {"key": "FIRE_2", "name": "Fire Engine 2",  "icon": "🚒", "gc": "gc-high",     "file": "fire-unit-2.html", "grp_id": "grp-bravo"},
            {"key": "FIRE_3", "name": "Rescue Unit",    "icon": "🪖", "gc": "gc-medium",   "file": "fire-unit-3.html", "grp_id": "grp-charlie"},
            {"key": "FIRE_4", "name": "Hazmat Team",    "icon": "☢️", "gc": "gc-low",      "file": "fire-unit-4.html", "grp_id": "grp-delta"},
        ],
        "key_urg": "{ FIRE_1: 'CRITICAL', FIRE_2: 'HIGH', FIRE_3: 'MEDIUM', FIRE_4: 'LOW' }",
        "urg_key": "{ CRITICAL: 'FIRE_1', HIGH: 'FIRE_2', MEDIUM: 'FIRE_3', LOW: 'FIRE_4' }",
        "filter_pills": [
            ("FIRE_1", "🔴 Engine 1"),
            ("FIRE_2", "🟠 Engine 2"),
            ("FIRE_3", "🟡 Rescue"),
            ("FIRE_4", "🟢 Hazmat"),
        ],
        "dispatch_label": "🚒 Dispatch Now",
        "dispatch_modal_icon": "🔥",
    },
    {
        "file": "women-safety-admin.html",
        "issue_type": "WOMEN_SAFETY",
        "hero_icon": "🚺",
        "heading": "Women Safety Control Room",
        "officer_id_label": "Women Safety Admin · Unit Active",
        "panel_title": "🚺 Women Safety Units — Tap to Open Squad Interface",
        "storage_key": "request_safety_squad_",
        "squads": [
            {"key": "WS_1", "name": "Pink Patrol Alpha", "icon": "👩‍✈️", "gc": "gc-critical", "file": "safety-unit-1.html", "grp_id": "grp-alpha"},
            {"key": "WS_2", "name": "Pink Patrol Bravo", "icon": "👩‍✈️", "gc": "gc-high",     "file": "safety-unit-2.html", "grp_id": "grp-bravo"},
            {"key": "WS_3", "name": "Women Help Desk",   "icon": "🏥",   "gc": "gc-medium",   "file": "safety-unit-3.html", "grp_id": "grp-charlie"},
            {"key": "WS_4", "name": "Crisis Response",   "icon": "🛡️",  "gc": "gc-low",      "file": "safety-unit-4.html", "grp_id": "grp-delta"},
        ],
        "key_urg": "{ WS_1: 'CRITICAL', WS_2: 'HIGH', WS_3: 'MEDIUM', WS_4: 'LOW' }",
        "urg_key": "{ CRITICAL: 'WS_1', HIGH: 'WS_2', MEDIUM: 'WS_3', LOW: 'WS_4' }",
        "filter_pills": [
            ("WS_1", "🔴 Patrol Alpha"),
            ("WS_2", "🟣 Patrol Bravo"),
            ("WS_3", "🟡 Help Desk"),
            ("WS_4", "🟢 Crisis"),
        ],
        "dispatch_label": "🚺 Dispatch Now",
        "dispatch_modal_icon": "🚺",
    },
    {
        "file": "accident-admin.html",
        "issue_type": "ACCIDENT",
        "hero_icon": "🚗",
        "heading": "Accident Rescue Control Room",
        "officer_id_label": "Accident Admin · Unit Active",
        "panel_title": "🚑 Rescue Units — Tap to Open Squad Interface",
        "storage_key": "request_accident_squad_",
        "squads": [
            {"key": "ACC_1", "name": "Trauma Unit 1",   "icon": "🚑",  "gc": "gc-critical", "file": "rescue-unit-1.html", "grp_id": "grp-alpha"},
            {"key": "ACC_2", "name": "Trauma Unit 2",   "icon": "🚑",  "gc": "gc-high",     "file": "rescue-unit-2.html", "grp_id": "grp-bravo"},
            {"key": "ACC_3", "name": "Traffic Police",  "icon": "👮",  "gc": "gc-medium",   "file": "rescue-unit-3.html", "grp_id": "grp-charlie"},
            {"key": "ACC_4", "name": "Road Rescue",     "icon": "🏗️", "gc": "gc-low",      "file": "rescue-unit-4.html", "grp_id": "grp-delta"},
        ],
        "key_urg": "{ ACC_1: 'CRITICAL', ACC_2: 'HIGH', ACC_3: 'MEDIUM', ACC_4: 'LOW' }",
        "urg_key": "{ CRITICAL: 'ACC_1', HIGH: 'ACC_2', MEDIUM: 'ACC_3', LOW: 'ACC_4' }",
        "filter_pills": [
            ("ACC_1", "🔴 Trauma 1"),
            ("ACC_2", "🟠 Trauma 2"),
            ("ACC_3", "🟡 Traffic Police"),
            ("ACC_4", "🟢 Road Rescue"),
        ],
        "dispatch_label": "🚑 Dispatch Now",
        "dispatch_modal_icon": "🚗",
    },
]


def make_group_cards(dept):
    cards = []
    for sq in dept["squads"]:
        cards.append(f"""        <a href="{sq['file']}" class="group-card {sq['gc']}" style="text-decoration:none;cursor:pointer;">
          <div class="gc-squad-name">{sq['icon']} {sq['name']}</div>
          <div class="gc-handles">{sq['key']} Unit</div>
          <div class="gc-count-row">
            <div>
              <div class="gc-count" id="{sq['grp_id']}">—</div>
              <div class="gc-pending-tag" id="{sq['grp_id']}-resolved">Loading…</div>
            </div>
            <div class="gc-icon">{sq['icon']}</div>
          </div>
        </a>""")
    return "\n".join(cards)


def make_all_squads_js(dept):
    entries = [f"  {{ key: '{sq['key']}',   label: '{sq['icon']} {sq['name']}' }}" for sq in dept["squads"]]
    return "const ALL_SQUADS = [\n" + ",\n".join(entries) + "\n];"


def make_filter_pills(dept):
    pills = []
    for key, label in dept["filter_pills"]:
        pills.append(f'          <button class="filter-pill" onclick="setFilterGroup(\'{key}\',this)">{label}</button>')
    return "\n".join(pills)


GROUPS_GRID_PATTERN = re.compile(
    r'<div class="groups-grid"[^>]*>.*?</div>\s*</div>\s*</div>',
    re.DOTALL
)

FILTER_PILLS_PATTERN = re.compile(
    r'(<button class="filter-pill" onclick="setFilter\(\'ALL\',this\)">All</button>.*?<button class="filter-pill" onclick="setFilter\(\'RESOLVED\',this\)">.*?</button>).*?(<input class="filter-search")',
    re.DOTALL
)

ALL_SQUADS_PATTERN = re.compile(r'const ALL_SQUADS = \[.*?\];', re.DOTALL)
KEY_URG_PATTERN = re.compile(r'\{ AMB1: \'CRITICAL\'.*?\}', re.DOTALL)
URG_KEY_PATTERN = re.compile(r'\{ CRITICAL: \'AMB1\'.*?\}', re.DOTALL)


for dept in DEPTS:
    path = os.path.join(FRONTEND, dept["file"])
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # 1. Fix hero heading
    content = content.replace("<h2>Medical Admin</h2>", f"<h2>{dept['heading']}</h2>")

    # 2. Fix officer bar label
    content = content.replace("Medical Admin · Unit Active", dept["officer_id_label"])

    # 3. Fix panel title
    content = content.replace(
        "🚔 Medical Departments — Tap to open Squad Interface",
        dept["panel_title"]
    )

    # 4. Fix issue type filter — the key bug causing nothing to show
    content = content.replace(
        "allData = rawData.filter(r => (r.issueType || '').toUpperCase() === 'MEDICAL');",
        f"allData = rawData.filter(r => (r.issueType || '').toUpperCase() === '{dept['issue_type']}');"
    )

    # 5. Replace group cards HTML
    new_groups_html = (
        '<div class="groups-grid" id="groupsGrid">\n' +
        make_group_cards(dept) +
        '\n      </div>\n    </div>\n  </div>'
    )
    content = GROUPS_GRID_PATTERN.sub(new_groups_html, content, count=1)

    # 6. Replace ALL_SQUADS JS array
    content = ALL_SQUADS_PATTERN.sub(make_all_squads_js(dept), content)

    # 7. Replace filter pills for squad group buttons
    new_pills_block = (
        "\\1\n" + make_filter_pills(dept) + "\n          \\2"
    )
    # Simpler - find and replace the 4 old squad filter pills
    old_pills = re.compile(
        r'<button class="filter-pill" onclick="setFilterGroup\(\'AMB1\'.*?</button>\s*'
        r'<button class="filter-pill" onclick="setFilterGroup\(\'AMB2\'.*?</button>\s*'
        r'<button class="filter-pill" onclick="setFilterGroup\(\'PARAMEDIC\'.*?</button>\s*'
        r'<button class="filter-pill" onclick="setFilterGroup\(\'AIR_AMB\'.*?</button>',
        re.DOTALL
    )
    new_pills = "\n".join(
        f'          <button class="filter-pill" onclick="setFilterGroup(\'{key}\',this)">{label}</button>'
        for key, label in dept["filter_pills"]
    )
    content = old_pills.sub(new_pills, content)

    # 8. Fix KEY_URG mapping in openAssignModal (AMB1 -> dept-specific)
    content = content.replace(
        "const KEY_URG = { AMB1: 'CRITICAL', AMB2: 'HIGH', PARAMEDIC: 'MEDIUM', AIR_AMB: 'LOW' };",
        f"const KEY_URG = {dept['key_urg']};"
    )

    # 9. Fix urgencyFor mapping in applyFilter
    content = content.replace(
        "const urgencyFor = { AMB1: 'CRITICAL', AMB2: 'HIGH', PARAMEDIC: 'MEDIUM', AIR_AMB: 'LOW' };",
        f"const urgencyFor = {dept['key_urg']};"
    )

    # 10. Fix KEY_URG in renderTable grp lookup
    content = content.replace(
        "{ AMB1: 'CRITICAL', AMB2: 'HIGH', PARAMEDIC: 'MEDIUM', AIR_AMB: 'LOW' };",
        f"{dept['key_urg']};"
    )

    # 11. Fix pendingAssignSquadKey default
    content = content.replace(
        "let pendingAssignSquadKey = 'AMB1';",
        f"let pendingAssignSquadKey = '{dept['squads'][0]['key']}';"
    )
    content = content.replace(
        "pendingAssignSquadKey = selectEl ? selectEl.value : 'AMB1';",
        f"pendingAssignSquadKey = selectEl ? selectEl.value : '{dept['squads'][0]['key']}';"
    )

    # 12. Fix dispatch button label
    content = content.replace("🏥 Dispatch Now", dept["dispatch_label"])

    # 13. Fix dispatch modal icon
    content = content.replace('<div class="modal-icon">🏥</div>', f'<div class="modal-icon">{dept["dispatch_modal_icon"]}</div>')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched {dept['file']}")

print("All admin pages patched successfully.")
