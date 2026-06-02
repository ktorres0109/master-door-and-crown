#!/usr/bin/env bash
# remove-image.sh — Delete a single image from Cloudflare R2
# Usage: ./remove-image.sh <category> <number>
# Example: ./remove-image.sh barn-doors 7
# Reads credentials from secrets/credentials.json (never hardcoded)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS="$SCRIPT_DIR/secrets/credentials.json"

# ── usage ─────────────────────────────────────────────────────────────────────
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <category> <number>"
  echo "  e.g. $0 barn-doors 7"
  echo ""
  echo "Valid categories:"
  echo "  barn-doors  closet-doors  custom-wood-work"
  echo "  interior    room-divider  exterior"
  exit 1
fi

CATEGORY="$1"
NUMBER="$2"
R2_KEY="$CATEGORY/$NUMBER.webp"

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
export AWS_ACCESS_KEY_ID=$(jq -r '.r2.access_key_id'     "$CREDS")
export AWS_SECRET_ACCESS_KEY=$(jq -r '.r2.secret_access_key' "$CREDS")
ENDPOINT=$(jq -r '.r2.endpoint' "$CREDS")
BUCKET=$(jq -r '.r2.bucket'    "$CREDS")

AWS_CMD="aws s3 --endpoint-url $ENDPOINT"

# ── verify exists ─────────────────────────────────────────────────────────────
if ! $AWS_CMD ls "s3://$BUCKET/$R2_KEY" &>/dev/null; then
  echo "ERROR: s3://$BUCKET/$R2_KEY does not exist"
  exit 1
fi

# ── confirm ───────────────────────────────────────────────────────────────────
echo "About to delete: s3://$BUCKET/$R2_KEY"
echo -n "Confirm? [y/N] "
read -r ans
if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# ── delete ────────────────────────────────────────────────────────────────────
$AWS_CMD rm "s3://$BUCKET/$R2_KEY"
echo "Deleted: $R2_KEY"
