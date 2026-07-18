import os
import re
from pathlib import Path

def fix_imports():
    root = Path(r"D:\candian-cart")
    # Only target actions, apps, and lib to avoid node_modules
    targets = [root / "packages" / "actions", root / "apps", root / "packages" / "lib"]

    # Regex to remove extensions from within the import string
    # Matches: '@canadian-cart/actions/auth/getUserSession.actions' -> '@canadian-cart/actions/auth/getUserSession'
    pattern = re.compile(r'(@canadian-cart/[^/]+/[^"\']+)\.(actions|ts|tsx)')

    count = 0
    for target in targets:
        if not target.exists(): continue
        for root_dir, _, files in os.walk(target):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    filepath = Path(root_dir) / file
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    # Replace extensions
                    new_content = pattern.sub(r'\1', content)

                    if content != new_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                        print(f"Cleaned imports in: {filepath.relative_to(root)}")

    print(f"\nFixed {count} files. Extensions removed.")

if __name__ == "__main__":
    fix_imports()