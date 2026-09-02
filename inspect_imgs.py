import os
import re

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find img tags
    imgs = re.findall(r'<img[^>]*>', html)
    print(f"Images in {filename}:")
    for img in imgs[:15]:
        if "framerusercontent" in img or "sponsor" in img.lower():
            print(img)

process_file('index.html')
