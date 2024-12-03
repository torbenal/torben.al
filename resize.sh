#!/bin/bash

# Usage example:
# bash resize.sh -q 90 --overwrite image_a.jpg image_b.png
# Default run with no args: bash resize.sh

# Default settings
QUALITY=80
OVERWRITE=false
DEFAULT_DIR="./public"

echo "Scanning..."
# Check for options
while getopts ":q:-:" opt; do
  case $opt in
    q)
      QUALITY=$OPTARG
      ;;
    -)
      case $OPTARG in
        overwrite)
          OVERWRITE=true
          ;;
        *)
          echo "Invalid option: --$OPTARG" >&2
          exit 1
          ;;
      esac
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Shift off the options and optional argument
shift $((OPTIND -1))

# Gather files, recursively if no specific files are mentioned
if [ "$#" -eq 0 ]; then
    readarray -d '' IMAGES < <(find "$DEFAULT_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" \) ! -path "*/compressed/*" -print0)
else
    IMAGES=("$@")
fi

# Ensure there are images to process
if [ ${#IMAGES[@]} -eq 0 ]; then
    echo "No images found to process."
    exit 0
fi

echo "Compressing ${#IMAGES[@]} files to multiple outputs"

for f in "${IMAGES[@]}"; do
    if [ -f "$f" ]; then  # Ensure it's a file
        dir=$(dirname "$f")
        base=$(basename "$f")
        name="${base%.*}"

        # Only create the directory when needed
        compressed_dir="$dir/compressed"
        mkdir -p "$compressed_dir"

         # Check if the image has already been compressed
        if [ -f "$compressed_dir/${name}_micro.jpg" ] && [ -f "$compressed_dir/${name}_small.jpg" ] && [ -f "$compressed_dir/${name}_medium.jpg" ] && [ -f "$compressed_dir/${name}_large.jpg" ]; then
            echo "[ ✓ ] $f already compressed. Skipping."
            continue
        fi

        echo -n "[    ] Processing $f..."
        convert "$f" -auto-orient -resize 500x500 "$compressed_dir/${name}_micro.jpg" &> /dev/null
        convert "$f" -auto-orient -resize 1000x1000 "$compressed_dir/${name}_small.jpg" &> /dev/null
        convert "$f" -auto-orient -resize 1920x1920 "$compressed_dir/${name}_medium.jpg" &> /dev/null
        convert "$f" -auto-orient -resize 2560x2560 "$compressed_dir/${name}_large.jpg" &> /dev/null
        echo -ne "\r[ ✓ ] $f processed.\n"

        # Optimizing and converting in same directory loop to avoid unnecessary checks
        for size in micro small medium large; do
            jpg_file="$compressed_dir/${name}_${size}.jpg"
            jpegoptim "$jpg_file" --size="$QUALITY"% -s &> /dev/null
            webp_file="$compressed_dir/${name}_${size}.webp"
            cwebp -q "$QUALITY" "$jpg_file" -o "$webp_file" -quiet &> /dev/null
        done
    fi
done

echo "All files processed successfully."