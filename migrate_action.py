import os
import shutil
from pathlib import Path

def run_migration():
    # Enforce strict pathing relative to your workspace execution
    root_dir = Path(r"D:\candian-cart")
    source_base = root_dir / "actions"
    target_base = root_dir / "packages" / "actions" / "src"

    if not source_base.exists():
        print(f"FATAL: Source directory {source_base} does not exist.")
        return

    print(f"Initializing migration from {source_base.name} to {target_base}...\n")
    
    # Ensure the destination monorepo package structure exists
    target_base.mkdir(parents=True, exist_ok=True)

    # Walk the directory tree top-down
    for root, dirs, files in os.walk(source_base):
        current_root = Path(root)
        rel_path = current_root.relative_to(source_base)
        dest_dir = target_base / rel_path
        
        # Replicate the folder structure
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        exports = []
        
        # 1. Safely move the Action files
        for file_name in files:
            if file_name.endswith(('.ts', '.tsx')) and file_name != 'index.ts':
                src_file = current_root / file_name
                dst_file = dest_dir / file_name
                
                shutil.move(str(src_file), str(dst_file))
                print(f"Moved: {rel_path / file_name}")
                
                # Format the export statement (strips the .ts/.tsx extension)
                export_name = file_name.rsplit('.', 1)[0]
                exports.append(f'export * from "./{export_name}";')
        
        # 2. Append sub-directories to the barrel file exports
        for dir_name in dirs:
            exports.append(f'export * from "./{dir_name}";')
            
        # 3. Generate the index.ts barrel file dynamically
        if exports:
            index_file = dest_dir / "index.ts"
            with open(index_file, "w", encoding="utf-8") as f:
                f.write("// Auto-generated Barrel File\n")
                for export_stmt in exports:
                    f.write(f"{export_stmt}\n")
            print(f"Created Barrel: {rel_path / 'index.ts'}")

    # Cleanup Phase: Nuke the old empty directories in reverse order
    for root, dirs, files in os.walk(source_base, topdown=False):
        try:
            os.rmdir(root)
        except OSError:
            # Directory isn't empty (e.g., non-TS files left behind), safe to ignore
            pass

    print("\nMigration completed securely. Actions folder fully processed.")

if __name__ == "__main__":
    run_migration()