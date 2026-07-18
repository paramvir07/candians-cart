import os
import re
from pathlib import Path

def fix_imports_only():
    root = Path(r"D:\candian-cart")
    targets = [root / "apps", root / "packages"]

    patterns = [
        (re.compile(r'["\']@/actions/(.*?)["\']'), r'"@canadian-cart/actions/\1"'),
        (re.compile(r'["\']@/types/(.*?)["\']'), r'"@canadian-cart/types/\1"'),
        (re.compile(r'["\']@/db/(.*?)["\']'), r'"@canadian-cart/db/\1"'),
        (re.compile(r'["\']@/lib/(.*?)["\']'), r'"@canadian-cart/lib/\1"'),
        (re.compile(r'["\']@/components/(.*?)["\']'), r'"@canadian-cart/ui/\1"'),
        # Catch hardcoded relative escapes
        (re.compile(r'["\'](?:\.\./)+components/(.*?)["\']'), r'"@canadian-cart/ui/\1"'),
        (re.compile(r'["\'](?:\.\./)+db/(.*?)["\']'), r'"@canadian-cart/db/\1"'),
        (re.compile(r'["\'](?:\.\./)+types/(.*?)["\']'), r'"@canadian-cart/types/\1"'),
        (re.compile(r'["\'](?:\.\./)+lib/(.*?)["\']'), r'"@canadian-cart/lib/\1"'),
        (re.compile(r'["\'](?:\.\./)+actions/(.*?)["\']'), r'"@canadian-cart/actions/\1"'),
    ]

    count = 0
    print("Starting memory-safe import migration. Skipping node_modules...")

    for target in targets:
        if not target.exists(): continue
        
        # os.walk allows us to modify dirnames in-place to prune the search tree
        for dirpath, dirnames, files in os.walk(target):
            # CRITICAL: Prevent the script from entering heavy/binary directories
            dirnames[:] = [d for d in dirnames if d not in ['node_modules', '.next', '.git']]
            
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    filepath = Path(dirpath) / file
                    try:
                        # errors='ignore' prevents crashes on weirdly encoded characters
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()

                        new_content = content
                        for pattern, replacement in patterns:
                            new_content = pattern.sub(replacement, new_content)

                        if content != new_content:
                            with open(filepath, 'w', encoding='utf-8', errors='ignore') as f:
                                f.write(new_content)
                            count += 1
                            print(f"Fixed imports in: {filepath.relative_to(root)}")
                    except Exception as e:
                        print(f"Skipped {file} due to read error.")

    print(f"\nMigration complete. Rewrote direct imports in {count} files.")

if __name__ == "__main__":
    fix_imports_only()