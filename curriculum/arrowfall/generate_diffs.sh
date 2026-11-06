#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
checkpoints="tutorial/checkpoints"
diffs="tutorial/diffs"

: > "$diffs/01-scene.patch"
while IFS= read -r file; do
    diff -U0 /dev/null "$file" | \
        sed -E 's/^((---|\+\+\+) [^[:space:]]+)[[:space:]].*/\1/' \
        >> "$diffs/01-scene.patch" || true
done < <(find "$checkpoints/01-scene" -type f ! -path '*/target/*' | sort)

previous="01-scene"
for current in 02-state 03-movement 04-map 05-goblin 06-archery 07-final; do
    diff -rN -U0 --exclude target \
        "$checkpoints/$previous" "$checkpoints/$current" \
        | sed -E 's/^((---|\+\+\+) [^[:space:]]+)[[:space:]].*/\1/' \
        > "$diffs/$current.patch" || true
    previous="$current"
done
