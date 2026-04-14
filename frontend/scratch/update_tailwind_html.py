import os
import glob
import re

dir_path = r"c:\Users\ASUS\IdeaProjects\helpsystems\frontend"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

cdn_regex = re.compile(r'<script\s+src="https://cdn\.tailwindcss\.com"></script>')
# The existing link: <link rel="stylesheet" href="style.css">
style_regex = re.compile(r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = cdn_regex.sub('', content)
    new_content = style_regex.sub('<link rel="stylesheet" href="output.css">', new_content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print(f"Updated {len(html_files)} HTML files.")
