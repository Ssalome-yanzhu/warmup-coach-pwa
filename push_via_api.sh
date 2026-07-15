#!/bin/bash
set -e
cd /Volumes/4T/GeminiApps/warmup-coach

REPO="Ssalome-yanzhu/warmup-coach"
COMMIT_MSG="v2 完整版: 38动作库 + purpose字段 + 四级成长语言 + 热身/拉伸方案"

FILES=(
  ".gitignore"
  "data/app.db"
  "data/app.db-shm"
  "data/app.db-wal"
  "index.html"
  "package.json"
  "README.md"
  "scripts/init-db.ts"
  "scripts/schema.sql"
  "scripts/seed.sql"
  "server.ts"
  "server/db.ts"
  "src/App.tsx"
  "src/assets/images/cartoon_kid_stretching_1781416479521.jpg"
  "src/assets/images/kids_sports_header_1781415711864.jpg"
  "src/components/RoutineCard.tsx"
  "src/components/SportSelect.tsx"
  "src/components/VideoPlayer.tsx"
  "src/index.css"
  "src/main.tsx"
  "src/types.ts"
  "src/vite-env.d.ts"
  "tsconfig.json"
  "vite.config.ts"
)

echo "=== Step 1: Creating blobs ==="
BLOB_DIR=$(mktemp -d /tmp/blobs.XXXXXX)

for i in "${!FILES[@]}"; do
  file="${FILES[$i]}"
  if [ ! -f "$file" ]; then
    echo "WARNING: File not found, skipping: $file"
    continue
  fi
  # Check if already created
  if [ -f "$BLOB_DIR/$i.sha" ]; then
    echo "Already created blob for ($i): $file (cached)"
    continue
  fi
  echo "Creating blob for ($i): $file"
  b64=$(base64 < "$file" | tr -d '\n')
  # Retry up to 5 times with backoff
  sha=""
  for attempt in 1 2 3 4 5; do
    sha=$(jq -n --arg content "$b64" --arg encoding "base64" '{content: $content, encoding: $encoding}' \
      | gh api "repos/${REPO}/git/blobs" --input - --jq '.sha' 2>/dev/null || echo "")
    if [ -n "$sha" ]; then
      break
    fi
    echo "  Retry $attempt/5..."
    sleep 3
  done
  if [ -z "$sha" ]; then
    echo "ERROR: Failed to create blob for $file after 5 attempts"
    exit 1
  fi
  echo "  -> SHA: $sha"
  echo "$sha" > "$BLOB_DIR/$i.sha"
done

echo ""
echo "=== Step 2: Creating tree ==="
TREE_ITEMS="[]"
for i in "${!FILES[@]}"; do
  file="${FILES[$i]}"
  if [ ! -f "$file" ]; then
    continue
  fi
  sha_file="$BLOB_DIR/$i.sha"
  if [ ! -f "$sha_file" ]; then
    echo "ERROR: Missing SHA for $file"
    exit 1
  fi
  sha=$(cat "$sha_file")
  if [ -x "$file" ]; then
    mode="100755"
  else
    mode="100644"
  fi
  TREE_ITEMS=$(echo "$TREE_ITEMS" | jq \
    --arg path "$file" \
    --arg mode "$mode" \
    --arg sha "$sha" \
    '. + [{"path": $path, "mode": $mode, "type": "blob", "sha": $sha}]')
done

echo "Creating tree..."
TREE_SHA=$(echo "$TREE_ITEMS" | jq '{tree: .}' \
  | gh api "repos/${REPO}/git/trees" --input - --jq '.sha')
echo "Tree SHA: $TREE_SHA"

echo ""
echo "=== Step 3: Getting parent commit SHA ==="
PARENT_SHA=$(gh api "repos/${REPO}/git/refs/heads/main" --jq '.object.sha')
echo "Parent SHA: $PARENT_SHA"

echo ""
echo "=== Step 4: Creating commit ==="
COMMIT_SHA=$(jq -n \
  --arg msg "$COMMIT_MSG" \
  --arg tree "$TREE_SHA" \
  --arg parent "$PARENT_SHA" \
  '{message: $msg, tree: $tree, parents: [$parent]}' \
  | gh api "repos/${REPO}/git/commits" --input - --jq '.sha')
echo "Commit SHA: $COMMIT_SHA"

echo ""
echo "=== Step 5: Updating ref ==="
RESULT=$(jq -n --arg sha "$COMMIT_SHA" '{sha: $sha}' \
  | gh api "repos/${REPO}/git/refs/heads/main" -X PATCH --input - --jq '.object.sha')
echo "Ref update result: $RESULT"

echo ""
echo "=== Step 6: Verification ==="
NEW_SHA=$(gh api "repos/${REPO}/git/refs/heads/main" --jq '.object.sha')
echo "Ref HEAD SHA: $NEW_SHA"
if [ "$NEW_SHA" = "$COMMIT_SHA" ]; then
  echo "SUCCESS: Push verified! New HEAD is $NEW_SHA"
else
  echo "ERROR: SHA mismatch! Expected $COMMIT_SHA, got $NEW_SHA"
  exit 1
fi

# Cleanup
rm -rf "$BLOB_DIR"
rm -f "$0"
