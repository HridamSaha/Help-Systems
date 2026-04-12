import os
import re

files = [
    "squad-alpha.html",
    "squad-bravo.html",
    "squad-charlie.html",
    "squad-delta.html",
    "med-dept-1.html",
    "med-dept-2.html",
    "med-dept-3.html",
    "med-dept-4.html"
]

dir_path = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

map_css = """    #mapModal .modal { max-width: 600px; padding: 20px; }
    #previewMap { height: 300px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border-soft); z-index: 10; }"""

map_modal = """  <!-- Map Modal -->
  <div class="modal-backdrop" id="mapModal">
    <div class="modal">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <h3 style="margin:0;">📍 Emergency Location</h3>
        <button class="btn btn-ghost" style="padding: 4px 10px; width: auto;" onclick="closeMapModal()">✕</button>
      </div>
      <div id="previewMap"></div>
      <p id="mapAddress" style="font-size: 13px; color: var(--text-2); margin: 0; word-break: break-word;">Loading address...</p>
    </div>
  </div>"""

new_case_actions = """<div class="case-actions">
            <button class="btn-ghost" style="flex:0.8; font-size: 13px; font-weight: 700; border-radius: 10px;" 
              ${lat === '—' ? 'disabled' : `onclick="openMapModal(${lat}, ${lon}, '${(r.locationArea || '').replace(/'/g, "\\\\'")}')"`}>
              🗺️ Map
            </button>
            <button class="btn-resolve" onclick="openResolveModal('${r.requestId}')">✅ Mark Resolved</button>
          </div>"""

for f in files:
    path = os.path.join(dir_path, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    # 1. Patch CSS
    if "#previewMap" not in content:
        content = re.sub(r'(\s*\.modal-backdrop\s*\{)', r'\n' + map_css + r'\n\1', content)
        
    # 2. Patch Modal HTML
    if 'id="mapModal"' not in content:
        content = re.sub(r'(\s*<div class="toast")', r'\n' + map_modal + r'\n\1', content)
        
    # 3. Patch case actions (handles single line or missing newlines)
    if '🗺️ Map' not in content:
        content = re.sub(
            r'<div class="case-actions">\s*<button class="btn-resolve" onclick="openResolveModal\(\'\$\{r\.requestId\}\'\)">\s*✅ Mark Resolved\s*</button>\s*</div>',
            new_case_actions,
            content
        )
        
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Patched {f}")
