"""
Restore mini-stats and fix div closing in the 3 admin pages.
"""
import os, re

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"

FILES = ["fire-admin.html", "women-safety-admin.html", "accident-admin.html"]

MINI_STATS_HTML = """      </div>
    </div>

    <!-- Mini Stats -->
    <div class="mini-stats">
      <div class="mini-stat ms-total">
        <div class="ms-num" id="ms-total">—</div>
        <div class="ms-label">Total Cases</div>
      </div>
      <div class="mini-stat ms-progress">
        <div class="ms-num" id="ms-progress">—</div>
        <div class="ms-label">In Progress</div>
      </div>
      <div class="mini-stat ms-resolved">
        <div class="ms-num" id="ms-resolved">—</div>
        <div class="ms-label">Resolved</div>
      </div>
      <div class="mini-stat ms-critical">
        <div class="ms-num" id="ms-critical">—</div>
        <div class="ms-label">Critical</div>
      </div>
    </div>"""

for fname in FILES:
    path = os.path.join(FRONTEND, fname)
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # The broken part looks like this:
    #         </a>
    #       </div>
    #     </div>
    #   </div>
    #
    #     <!-- Table Card -->
    
    # We want to replace carefully from the end of the groups grid to the Table Card
    broken_pattern = re.compile(r'</a>\s*</div>\s*</div>\s*</div>\s*<!-- Table Card -->', re.MULTILINE)
    
    if "id=\"ms-total\"" not in content:
        # Mini stats are missing! Let's insert them
        fixed_content = broken_pattern.sub(f'</a>\n{MINI_STATS_HTML}\n\n    <!-- Table Card -->', content)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(fixed_content)
        print(f"Fixed {fname}")
    else:
        print(f"{fname} is already fine.")

