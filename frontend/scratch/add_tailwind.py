import glob, os

FRONTEND = "c:/Users/ASUS/IdeaProjects/helpsystems/frontend"
html_files = glob.glob(os.path.join(FRONTEND, "*.html"))

TAG = '<script src="https://cdn.tailwindcss.com"></script>'

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    if TAG not in content:
        content = content.replace("</head>", f"  {TAG}\n</head>")
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added to {os.path.basename(file)}")
print("Done.")
