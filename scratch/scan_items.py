
import os
import re

def scan_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        # Look for 'item.' but not 'editingItem.' or 'selectedItem.' etc.
                        # and not in a map/foreach like '(item) =>' or 'item =>'
                        if re.search(r'\bitem\.', line):
                            # Check context
                            content = "".join(lines[max(0, i-5):i+1])
                            if not re.search(r'(\(item|item\s*=>|\.map\(|\.forEach\(|\.find\(|\.filter\()', content):
                                print(f"{path}:{i+1}: {line.strip()}")

scan_files('c:/xampp/htdocs/role-based-OIMS/frontend/src/pages')
