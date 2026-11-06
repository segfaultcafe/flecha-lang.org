# 01 — A room appears

## Starting point

There is no previous checkpoint: we begin with an empty Flecha program.

## Why now?

A terminal game first needs something recognisable on screen. Before state,
input, or rules, a static room gives the project a visible identity.

## New behaviour

Running the program prints Arrowfall's title and a tiny room containing the
player (`@`), floor (`.`), walls (`#`), and exit (`>`).

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `src/main.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

The exact source diff is `../../diffs/01-scene.patch`. This directory contains
the complete current code, not a fragment.

## Verify

```sh
longbow check tutorial/checkpoints/01-scene
longbow test tutorial/checkpoints/01-scene
longbow build tutorial/checkpoints/01-scene
longbow run tutorial/checkpoints/01-scene < tutorial/checkpoints/01-scene/tests/input.txt
```

Expected stdout is `tests/output.txt`; the representative frame is
`tests/frame.txt` and `tests/frame.svg`.

## Timeline

1. **A room appears** — a static scene establishes the game's visual goal.

## Challenge / acceptance

Change one floor dot to a wall, rebuild, and verify exactly one character in
the frame changes. Restore it before moving on.
