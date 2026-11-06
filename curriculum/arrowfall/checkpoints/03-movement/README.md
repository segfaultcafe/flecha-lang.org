# 03 — The player moves

## Starting point

Checkpoint 02 derives the picture from a player position, but the position
never changes.

## Why now?

A game cannot be played without input. We first learn blocking stdin on an
open floor, before walls add a second concern.

## New behaviour

W/A/S/D moves within a 5x3 training floor. Q exits. Input is normalised once,
parsed into a `Command` enum, and applied through a mutable game reference.

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `src/main.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

See `../../diffs/03-movement.patch` for the exact predecessor diff.

## Verify

```sh
longbow check tutorial/checkpoints/03-movement
longbow test tutorial/checkpoints/03-movement
longbow build tutorial/checkpoints/03-movement
longbow run tutorial/checkpoints/03-movement < tutorial/checkpoints/03-movement/tests/input.txt
```

## Timeline

1. A room appears — static terminal scene.
2. The picture becomes state — `Game` owns `Position`.
3. **The player moves** — blocking stdin drives mutation.

## Challenge / acceptance

Run the recorded input. The last frame before `Run ended.` must place `@` at
column 2, row 2; an unknown key must not move it.
