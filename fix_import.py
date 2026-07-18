import os
from pathlib import Path

root = Path(r"D:\candian-cart")
targets = [root / "apps", root / "packages"]

replacements = {
    "@canadian-cart/types/src/categories": "@canadian-cart/types/categories",
    "@canadian-cart/lib/customer/heardAboutUs": "@canadian-cart/types/customer/heardAboutUs",
    "@canadian-cart/lib/customer/location": "@canadian-cart/types/customer/location",
    "@canadian-cart/lib/google/addressValidation": "@canadian-cart/types/google/addressValidation",
    "@/types/customer/signUp": "@canadian-cart/types/customer/signUp",
    "@/types/store/store": "@canadian-cart/types/store/store",
}

count = 0
for target in targets:
    for dirpath, dirnames, files in os.walk(target):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".next", ".git")]
        for file in files:
            if file.endswith((".ts", ".tsx")):
                fp = Path(dirpath) / file
                try:
                    content = fp.read_text(encoding="utf-8", errors="ignore")
                except Exception:
                    continue
                new_content = content
                for old, new in replacements.items():
                    new_content = new_content.replace(old, new)
                if new_content != content:
                    fp.write_text(new_content, encoding="utf-8")
                    count += 1
                    print(f"Fixed: {fp.relative_to(root)}")

print(f"\nDone. Modified {count} files.")