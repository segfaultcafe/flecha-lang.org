#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
longbow_bin="${LONGBOW:-longbow}"
cd "$root"

for step in \
    01-scene \
    02-state \
    03-movement \
    04-map \
    05-goblin \
    06-archery \
    07-final; do
    project="tutorial/checkpoints/$step"
    "$longbow_bin" check "$project"
    "$longbow_bin" test "$project"
    "$longbow_bin" build "$project"
    actual="$(mktemp)"
    trap 'rm -f "$actual"' RETURN
    if [[ "$step" == "07-final" ]]; then
        "$longbow_bin" run "$project" -- --no-clear --seed 20261105 \
            < "$project/tests/input.txt" > "$actual"
    else
        "$longbow_bin" run "$project" \
            < "$project/tests/input.txt" > "$actual"
    fi
    diff -u "$project/tests/output.txt" "$actual"
    echo "$step: OK"
done

LONGBOW="$longbow_bin" tutorial/checkpoints/07-final/scripts/check-golden.sh
./tutorial/render_frames.py
./tutorial/generate_diffs.sh
git diff --check
