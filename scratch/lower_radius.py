
import os

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the mapping (order matters to avoid partial replacements)
    # We use regex with word boundaries to be safe
    replacements = [
        (r'\brounded-3xl\b', 'rounded-xl'),
        (r'\brounded-2xl\b', 'rounded-lg'),
        (r'\brounded-xl\b', 'rounded-md'),
        (r'\brounded-lg\b', 'rounded'),
        (r'\brounded-md\b', 'rounded-sm'),
    ]

    import re
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    directory = 'c:/xampp/htdocs/role-based-OIMS/frontend/src'
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.jsx')):
                path = os.path.join(root, file)
                if replace_in_file(path):
                    count += 1
                    print(f"Updated: {path}")
    print(f"Total files updated: {count}")

if __name__ == '__main__':
    main()
