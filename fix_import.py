import os
from pathlib import Path

root = Path(r"D:\candian-cart")

replacements_by_target = [
    (root / "packages" / "ui" / "src", {
        "@/packages/ui/src/utils": "@canadian-cart/ui/utils",
    }),
    (root / "packages" / "actions" / "src", {
        '@canadian-cart/actions/auth/getUserSession"': '@canadian-cart/actions/auth/getUserSession.actions"',
    }),
]

total = 0
for target, replacements in replacements_by_target:
    if not target.exists():
        print(f"Skipping missing folder: {target}")
        continue
    for filepath in target.rglob("*"):
        if filepath.is_file() and filepath.suffix in (".ts", ".tsx"):
            try:
                content = filepath.read_text(encoding="utf-8")
            except Exception as e:
                print(f"Skipped {filepath}: {e}")
                continue
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
            if new_content != content:
                filepath.write_text(new_content, encoding="utf-8")
                total += 1
                print(f"Fixed: {filepath.relative_to(root)}")

print(f"\nDone. Modified {total} files.")