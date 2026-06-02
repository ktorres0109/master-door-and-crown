#!/usr/bin/env bash
# upload-images.sh — Convert and upload site images to Cloudflare R2
# Reads credentials from secrets/credentials.json (never hardcoded)
# Run from repo root. Requires: jq, awscli

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS="$SCRIPT_DIR/secrets/credentials.json"
WEBP_SRC="$HOME/Documents/MDC/webp_output"

# ── dependency check ──────────────────────────────────────────────────────────
for cmd in jq aws; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' not found."
    [[ "$cmd" == "aws" ]] && echo "  Install: brew install awscli"
    [[ "$cmd" == "jq"  ]] && echo "  Install: brew install jq"
    exit 1
  fi
done

if [[ ! -f "$CREDS" ]]; then
  echo "ERROR: credentials not found at $CREDS"
  exit 1
fi

# ── read credentials ──────────────────────────────────────────────────────────
ACCESS_KEY=$(jq -r '.r2.access_key_id'     "$CREDS")
SECRET_KEY=$(jq -r '.r2.secret_access_key' "$CREDS")
ENDPOINT=$(jq -r '.r2.endpoint'            "$CREDS")
BUCKET=$(jq -r '.r2.bucket'               "$CREDS")
PUBLIC_BASE=$(jq -r '.r2.public_base_url'  "$CREDS")

export AWS_ACCESS_KEY_ID="$ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SECRET_KEY"

AWS_CMD="aws s3 --endpoint-url $ENDPOINT"

# ── folders to upload ─────────────────────────────────────────────────────────
FOLDERS=(barn-doors closet-doors custom-wood-work interior room-divider exterior)

total_ok=0
total_skip=0
total_fail=0

for prefix in "${FOLDERS[@]}"; do
  src_dir="$WEBP_SRC/$prefix"
  if [[ ! -d "$src_dir" ]]; then
    echo "WARN: $src_dir not found, skipping"
    continue
  fi

  files=("$src_dir"/*.webp)
  echo ""
  echo "── $prefix/ (${#files[@]} files) ──"

  for local_file in "${files[@]}"; do
    fname="$(basename "$local_file")"
    r2_key="$prefix/$fname"

    # check if already exists in R2
    if $AWS_CMD ls "s3://$BUCKET/$r2_key" &>/dev/null; then
      echo -n "  EXISTS $r2_key — overwrite? [y/N] "
      read -r ans
      if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
        echo "  skipped $r2_key"
        ((total_skip++))
        continue
      fi
    fi

    if $AWS_CMD cp "$local_file" "s3://$BUCKET/$r2_key" \
        --content-type "image/webp" \
        --no-progress 2>&1; then
      echo "  ✓ $r2_key"
      ((total_ok++))
    else
      echo "  ✗ FAILED $r2_key"
      ((total_fail++))
    fi
  done
done

echo ""
echo "═══════════════════════════════════════"
echo "  Uploaded : $total_ok"
echo "  Skipped  : $total_skip"
echo "  Failed   : $total_fail"
echo "═══════════════════════════════════════"

if [[ "$PUBLIC_BASE" == *"REPLACE"* ]]; then
  echo ""
  echo "NOTE: public_base_url is still a placeholder in credentials.json."
  echo "      Enable R2 public access in Cloudflare dashboard, then update it."
else
  echo ""
  echo "Public URLs:"
  for prefix in "${FOLDERS[@]}"; do
    echo "  $PUBLIC_BASE/$prefix/1.webp  …"
  done
fi
