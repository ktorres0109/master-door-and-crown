#!/usr/bin/env bash
# fix-orientation.sh — Re-process R2 images with magick -auto-orient -strip
# Reads credentials from secrets/credentials.json
# Shows per-folder counts, then asks approval before uploading.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS="$SCRIPT_DIR/secrets/credentials.json"

if [[ ! -f "$CREDS" ]]; then
  echo "ERROR: secrets/credentials.json not found"
  exit 1
fi

AWS_ACCESS_KEY_ID=$(jq -r '.r2.access_key_id' "$CREDS")
AWS_SECRET_ACCESS_KEY=$(jq -r '.r2.secret_access_key' "$CREDS")
R2_ENDPOINT=$(jq -r '.r2.endpoint' "$CREDS")
R2_BUCKET=$(jq -r '.r2.bucket' "$CREDS")

export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=auto

AWS="aws --endpoint-url $R2_ENDPOINT"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

FOLDERS=(entry-doors interior-doors barn-sliding-doors closet-doors room-dividers crown-woodwork)

echo ""
echo "=== Image counts per folder ==="
declare -A COUNTS
for folder in "${FOLDERS[@]}"; do
  count=$($AWS s3 ls "s3://$R2_BUCKET/$folder/" 2>/dev/null | grep -c '\.webp$' || true)
  COUNTS[$folder]=$count
  printf "  %-25s %d images\n" "$folder" "$count"
done

echo ""
read -rp "Re-process all images with 'magick -auto-orient -strip' and re-upload? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
for folder in "${FOLDERS[@]}"; do
  total=${COUNTS[$folder]}
  echo "--- $folder ($total images) ---"
  for ((i=1; i<=total; i++)); do
    key="$folder/$i.webp"
    local_path="$TMPDIR/$folder-$i.webp"
    echo -n "  $key ... "
    $AWS s3 cp "s3://$R2_BUCKET/$key" "$local_path" --quiet
    magick "$local_path" -auto-orient -strip "$local_path"
    $AWS s3 cp "$local_path" "s3://$R2_BUCKET/$key" \
      --content-type "image/webp" \
      --cache-control "public, max-age=31536000, immutable" \
      --quiet
    echo "done"
  done
done

echo ""
echo "All images re-processed and re-uploaded."
