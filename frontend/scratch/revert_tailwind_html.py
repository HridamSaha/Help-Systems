import os
import glob
import re

dir_path = r"c:\Users\ASUS\IdeaProjects\helpsystems\frontend"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

style_regex = re.compile(r'<link\s+rel="stylesheet"\s+href="output\.css"\s*/?>')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = style_regex.sub('<link rel="stylesheet" href="style.css">', content)
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

print(f"Checked {len(html_files)} HTML files for output.css replacement.")
