import os
from pathlib import Path

def replace_lib_imports():
    root_dir = Path(r"D:\candian-cart")
    
    # Target all the places where old aliases might be hiding
    targets = [
        root_dir / "packages" / "actions" / "src",
        root_dir / "packages" / "ui" / "src",
        root_dir / "apps" / "customer-cashier" / "app",
        root_dir / "apps" / "store-admin-immigration" / "app",
        root_dir / "components" # Scans components that haven't been moved yet
    ]

    replacements = {
        "@/lib/": "@canadian-cart/lib/"
    }

    print("Scanning for old Next.js lib path aliases...\n")

    for target in targets:
        if not target.exists(): 
            continue
            
        for root, _, files in os.walk(target):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = Path(root) / file
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    new_content = content
                    for old_str, new_str in replacements.items():
                        new_content = new_content.replace(old_str, new_str)

                    if content != new_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed imports in: {file_path.relative_to(root_dir)}")

    print("\nLib import migration complete.")

if __name__ == "__main__":
    replace_lib_imports()