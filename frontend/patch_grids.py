import os
import glob
import re

files = glob.glob('src/**/*.tsx', recursive=True)
count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'gridTemplateColumns' in content:
        # We need to make sure we don't accidentally add the class to elements that already have a className,
        # but for simplicity let's just insert it before style={{
        # We only match where display: 'grid' is followed by gridTemplateColumns.
        original = content
        
        # Replace 1: <div style={{ display: 'grid', gridTemplateColumns
        content = content.replace("<div style={{ display: 'grid', gridTemplateColumns", "<div className=\"grid-mobile-1\" style={{ display: 'grid', gridTemplateColumns")
        content = content.replace("<div style={{ gridTemplateColumns", "<div className=\"grid-mobile-1\" style={{ gridTemplateColumns")
        content = content.replace("<div style={{display: 'grid', gridTemplateColumns", "<div className=\"grid-mobile-1\" style={{ display: 'grid', gridTemplateColumns")
        
        if content != original:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1
            print(f"Patched {file}")
print(f"Patched {count} files.")
