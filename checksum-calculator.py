import os
import hashlib
import fnmatch
from typing import List

def compute_sha256(filepath: str) -> str:
    sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        return f"Error: {e}"


def should_ignore(path: str, ignored_dirs: List[str]) -> bool:
    abs_path = os.path.abspath(path)
    return any(abs_path.startswith(os.path.abspath(ignored) + os.sep) or abs_path == os.path.abspath(ignored)
               for ignored in ignored_dirs)


def should_ignore_file(path: str, ignored_files: List[str]) -> bool:
    abs_path = os.path.abspath(path)
    return abs_path in ignored_files


def find_matching_files(
    root_dir: str, 
    patterns: List[str], 
    ignored_dirs: List[str],
    ignored_files: List[str]
) -> List[str]:
    matches = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip ignored directories
        dirnames[:] = [d for d in dirnames if not should_ignore(os.path.join(dirpath, d), ignored_dirs)]

        for pattern in patterns:
            for filename in fnmatch.filter(filenames, pattern):
                full_path = os.path.join(dirpath, filename)
                if not should_ignore_file(full_path, ignored_files):
                    matches.append(full_path)
    return matches


def save_files_as_markdown(file_list, output_markdown_name, base_dir):
    base_dir = os.path.abspath(base_dir)

    # Ensure the output directory exists
    output_dir = os.path.join(os.getcwd(), 'markdown-outputs')
    os.makedirs(output_dir, exist_ok=True)

    output_markdown = os.path.join(output_dir, output_markdown_name)

    print("📝 Enter a short message for each file that will show before the file. Something like 'Now, let's create the layout component'")
    try:
        with open(output_markdown, 'w', encoding='utf-8') as out_file:

            for filename in file_list:
                try:
                    abs_path = os.path.abspath(filename)
                    rel_path = os.path.relpath(abs_path, base_dir)

                    print(f"\n➡️  File: {rel_path}")
                    
                    description = ""
                    while not description:
                        description = input("📝 The short message (required):").strip()
                        if not description:
                            print("❗ Description cannot be empty. Please try again.")

                    with open(abs_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    out_file.write(f'{description}\n\n')
                    out_file.write(f'```tsx file="{rel_path}"\n')
                    out_file.write(content.rstrip())
                    out_file.write('\n```\n\n')

                except FileNotFoundError:
                    print(f"⚠️  Warning: File not found: {filename}")
                except Exception as e:
                    print(f"⚠️  Warning: Could not read {filename}: {e}")


        print(f"\n✅ Output saved to '{output_markdown}'")

    except Exception as e:
        print(f"\n❌ Failed to write to output file: {e}")


def main():
    # Configuration
    file_patterns = ['*.ts', '*.tsx']
    ignored_directories = [
        'node_modules', 
        'dist',
        'components/ui',
    ]
    ignored_files = [
        'next-env.d.ts',
        'next.config.ts',
        'tailwind.config.ts',
        'postcss.config.ts',
        'tsconfig.json',
        'tsconfig.node.json',
        'tsconfig.app.json',
        'tsconfig.json',
    ]

    print("📦 Please provide the following:")
    root_dir = input("📁 Repo directory path: ").strip()

    root_dir = os.path.abspath(root_dir)

    # Convert ignored paths to absolute
    ignored_directories = [os.path.abspath(os.path.join(root_dir, d)) for d in ignored_directories]
    ignored_files = [os.path.abspath(os.path.join(root_dir, f)) for f in ignored_files]

    if not os.path.isdir(root_dir):
        print("❌ Error: The specified root directory does not exist.")
        return

    output_file = input("🧾 Item number: ").strip() + ".md"
    tsx_files = find_matching_files(root_dir, file_patterns, ignored_directories, ignored_files)

    if not tsx_files:
        print("⚠️ No .tsx or .ts files found in the specified directory.")
        return

    # Show file list and confirm
    print("\n📄 The following files will be included:\n")
    for f in tsx_files:
        rel_path = os.path.relpath(f, root_dir)
        print(f" - {rel_path}")

    confirm = input("\n✅ Do you want to continue? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Operation cancelled.")
        return

    save_files_as_markdown(tsx_files, output_file, root_dir)

if __name__ == '__main__':
    main()
