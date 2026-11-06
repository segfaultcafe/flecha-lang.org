# 02 — The picture becomes state

## Starting point

Checkpoint 01 prints a recognisable but hard-coded room.

## Why now?

Changing a character in a string cannot express movement. The player needs a
position owned by game state, and drawing must read that position.

## New behaviour

`Game` owns a `Position`; the scene derives `@` from it and reports `(1, 1)`.
The visible room is unchanged, but its source of truth is now data.

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `src/main.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

See `../../diffs/02-state.patch` for the exact predecessor diff. All current
source is present in this directory.

## Verify

```sh
longbow check tutorial/checkpoints/02-state
longbow test tutorial/checkpoints/02-state
longbow build tutorial/checkpoints/02-state
longbow run tutorial/checkpoints/02-state < tutorial/checkpoints/02-state/tests/input.txt
```

## Timeline

1. A room appears — static terminal scene.
2. **The picture becomes state** — structs and methods own the player position.

## Challenge / acceptance

Set the start position to `(2, 1)`: both `@` and the reported coordinate must
move. Restore `(1, 1)` afterward.
