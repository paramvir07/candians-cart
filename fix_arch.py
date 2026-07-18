import os
import re
import shutil
from pathlib import Path

def fix_architecture():
    root = Path(r"D:\candian-cart")

    # 1. Nuke Barrel Files (Vercel Best Practice)
    actions_src = root / "packages" / "actions" / "src"
    if actions_src.exists():
        for p in actions_src.rglob("index.ts"):
            p.unlink()
            print(f"Deleted barrel file: {p.relative_to(root)}")

    # 2. Move remaining root directories into workspace packages
    moves = [
        (root / "types", root / "packages" / "types" / "src"),
        (root / "components", root / "packages" / "ui" / "src")
    ]

    for src_dir, dest_dir in moves:
        if src_dir.exists():
            dest_dir.mkdir(parents=True, exist_ok=True)
            for item in src_dir.iterdir():
                dest = dest_dir / item.name
                if not dest.exists():
                    shutil.move(str(item), str(dest))
                elif item.is_dir():
                    # Merge directories safely (e.g., if 'shared' already exists)
                    for subitem in item.rglob('*'):
                        if subitem.is_file():
                            subdest = dest / subitem.relative_to(item)
                            subdest.parent.mkdir(parents=True, exist_ok=True)
                            shutil.move(str(subitem), str(subdest))
            shutil.rmtree(str(src_dir), ignore_errors=True)
            print(f"Moved {src_dir.name} to {dest_dir.relative_to(root)}")

    # 3. Regex Replace Imports to Direct Subpaths
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
    for target in targets:
        if not target.exists(): continue
        for filepath in target.rglob("*"):
            if filepath.is_file() and filepath.suffix in ['.ts', '.tsx']:
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    new_content = content
                    for pattern, replacement in patterns:
                        new_content = pattern.sub(replacement, new_content)

                    if content != new_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                except Exception:
                    pass

    print(f"\nMigration complete. Rewrote direct imports in {count} files.")

if __name__ == "__main__":
    fix_architecture()