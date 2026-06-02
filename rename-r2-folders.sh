#!/usr/bin/env bash
# rename-r2-folders.sh — Rename R2 image folders (copy + delete, no native rename)
# Reads credentials from secrets/credentials.json
# Shows preview, waits for explicit "yes" before executing.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS="$SCRIPT_DIR/secrets/credentials.json"

if [[ ! -f "$CREDS" ]]; then
  echo "ERROR: secrets/credentials.json not found at $CREDS" >&2
  exit 1
fi

ENDPOINT=$(python3 -c "import json; d=json.load(open('$CREDS')); print(d['r2']['endpoint'])")
ACCESS_KEY=$(python3 -c "import json; d=json.load(open('$CREDS')); print(d['r2']['access_key_id'])")
SECRET_KEY=$(python3 -c "import json; d=json.load(open('$CREDS')); print(d['r2']['secret_access_key'])")
BUCKET=$(python3 -c "import json; d=json.load(open('$CREDS')); print(d['r2']['bucket'])")

export AWS_ACCESS_KEY_ID="$ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SECRET_KEY"
export AWS_DEFAULT_REGION="auto"

AWS_CMD="aws --endpoint-url=$ENDPOINT"

# Rename mapping: "old_name|new_name"
PAIRS=(
  "exterior|entry-doors"
  "Barn Doors|barn-sliding-doors"
  "Custom Wood work|crown-woodwork"
  "Room divider|room-dividers"
  "Closet doors|closet-doors"
  "Interior|interior-doors"
)

echo ""
echo "=== R2 FOLDER RENAME PREVIEW ==="
echo "Bucket: $BUCKET"
echo "Endpoint: $ENDPOINT"
echo ""
printf "%-26s  %-26s  %s\n" "OLD FOLDER" "NEW FOLDER" "FILE COUNT"
printf "%-26s  %-26s  %s\n" "----------" "----------" "----------"

for PAIR in "${PAIRS[@]}"; do
  OLD="${PAIR%%|*}"
  NEW="${PAIR##*|}"
  COUNT=$($AWS_CMD s3 ls "s3://$BUCKET/$OLD/" 2>/dev/null | grep -c '\.webp' || echo "0")
  printf "%-26s  %-26s  %s\n" "$OLD/" "$NEW/" "$COUNT files"
done

echo ""
echo "This will:"
echo "  1. Copy all files from each old folder to the new folder"
echo "  2. Verify file counts match"
echo "  3. Delete the old folder only after successful copy"
echo ""
read -r -p "Proceed? Type 'yes' to execute: " CONFIRM
echo ""

if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted. No changes made."
  exit 0
fi

echo "=== EXECUTING ==="
echo ""

ERRORS=0

for PAIR in "${PAIRS[@]}"; do
  OLD="${PAIR%%|*}"
  NEW="${PAIR##*|}"

  # Check if source folder has objects
  OBJECTS=$($AWS_CMD s3 ls "s3://$BUCKET/$OLD/" 2>/dev/null || true)
  if [[ -z "$OBJECTS" ]]; then
    echo "SKIP  $OLD/  (empty or does not exist)"
    continue
  fi

  echo "COPY  $OLD/ → $NEW/"
  $AWS_CMD s3 cp "s3://$BUCKET/$OLD/" "s3://$BUCKET/$NEW/" --recursive

  # Verify counts
  OLD_COUNT=$($AWS_CMD s3 ls "s3://$BUCKET/$OLD/" --recursive 2>/dev/null | wc -l | tr -d ' ')
  NEW_COUNT=$($AWS_CMD s3 ls "s3://$BUCKET/$NEW/" --recursive 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$OLD_COUNT" -eq "$NEW_COUNT" && "$NEW_COUNT" -gt 0 ]]; then
    echo "  ✓ Verified $NEW_COUNT files. Deleting old folder..."
    $AWS_CMD s3 rm "s3://$BUCKET/$OLD/" --recursive
    echo "  DONE: $OLD/ → $NEW/"
  else
    echo "  ERROR: Count mismatch (old=$OLD_COUNT, new=$NEW_COUNT). NOT deleting $OLD/" >&2
    ERRORS=$((ERRORS + 1))
  fi
  echo ""
done

if [[ "$ERRORS" -gt 0 ]]; then
  echo "=== COMPLETED WITH $ERRORS ERROR(S) — review above output ===" >&2
  exit 1
else
  echo "=== ALL RENAMES COMPLETE ==="
fi
