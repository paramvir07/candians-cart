import os
from pathlib import Path

def replace_imports():
    root_dir = Path(r"D:\candian-cart")
    
    # Target all the places where old aliases might be hiding
    targets = [
        root_dir / "packages" / "actions" / "src",
        root_dir / "apps" / "customer-cashier" / "app",
        root_dir / "apps" / "store-admin-immigration" / "app",
        root_dir / "components" # If you haven't moved components to packages/ui yet
    ]

    # The exact string mappings
    replacements = {
        "@/db/dbConnect": "@canadian-cart/db/dbConnect",
        "@/db/": "@canadian-cart/db/",
        "@/zod/schemas/": "@canadian-cart/types/schemas/",
        "@/zod/validation/": "@canadian-cart/types/validation/"
    }

    print("Scanning for old Next.js path aliases...\n")

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

    print("\nImport migration complete.")

if __name__ == "__main__":
    replace_imports()