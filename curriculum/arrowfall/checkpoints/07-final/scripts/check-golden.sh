#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
longbow_bin="${LONGBOW:-longbow}"
cd "$project_root"

check_transcript() {
    local name="$1"
    local input="$2"
    local expected="$3"
    local actual
    actual="$(mktemp)"
    trap 'rm -f "$actual"' RETURN
    "$longbow_bin" run -- --no-clear --seed 20261105 < "$input" > "$actual"
    diff -u "$expected" "$actual"
    if od -An -tu1 "$actual" | awk '
        { for (i = 1; i <= NF; i++) if ($i < 32 && $i != 10) found = 1 }
        END { exit found ? 0 : 1 }
    '; then
        echo "$name transcript contains a control byte" >&2
        return 1
    fi
    echo "$name transcript: OK"
}

check_transcript "winning" tests/input.txt tests/output.txt
check_transcript "defeat" tests/defeat_input.txt tests/defeat_output.txt

visible_damage="$(mktemp)"
trap 'rm -f "$visible_damage"' EXIT
"$longbow_bin" run -- --seed 20261105 < tests/defeat_input.txt > "$visible_damage"
awk '
    BEGIN {
        escape = sprintf("%c", 27)
        RS = escape "\\[2J" escape "\\[H"
    }
    index($0, "HP: 2") && index($0, "The goblin attacks: -1 HP.") {
        visible = 1
    }
    END { exit visible ? 0 : 1 }
' "$visible_damage"
echo "clear-screen damage frame: OK"

check_seed() {
    local name="$1"
    local expected="$2"
    shift 2
    local actual
    actual="$(mktemp)"
    trap 'rm -f "$actual"' RETURN
    printf 'q\n' | "$longbow_bin" run -- "$@" > "$actual"
    grep -F "Seed: $expected" "$actual" > /dev/null
    echo "$name seed: OK"
}

check_seed "absent" 20261105 --no-clear
check_seed "explicit empty" 20261105 --no-clear --seed ""
check_seed "missing value" 20261105 --no-clear --seed
check_seed "option follows" 20261105 --seed --no-clear
check_seed "explicit value" 42 --seed 42 --no-clear
check_seed "reverse option order" 42 --no-clear --seed 42

check_seed_error() {
    local name="$1"
    local value="$2"
    local actual
    actual="$(mktemp)"
    trap 'rm -f "$actual"' RETURN
    if "$longbow_bin" run -- --seed "$value" > "$actual"; then
        echo "$name unexpectedly launched" >&2
        return 1
    fi
    grep -F "arrowfall: seed must be a decimal u64" "$actual" > /dev/null
    grep -F "usage: arrowfall [--no-clear] [--seed <u64>]" "$actual" > /dev/null
    if grep -F "ARROWFALL" "$actual" > /dev/null; then
        echo "$name launched the game" >&2
        return 1
    fi
    echo "$name seed error: OK"
}

check_seed_error "invalid" "twelve"
check_seed_error "out-of-range" "18446744073709551616"
