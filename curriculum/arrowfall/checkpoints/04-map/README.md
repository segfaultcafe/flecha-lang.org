# 04 — Walls make movement meaningful

## Starting point

Checkpoint 03 moves on an open rectangle. Every in-bounds direction succeeds,
so movement has no spatial decision.

## Why now?

The symbols introduced in checkpoint 01 should become rules. A real room needs
solid walls, a reachable exit, and feedback when an action cannot happen.

## New behaviour

The fixed 9x7 map is stored as a checked slice over a fixed array. Walls reject
movement without spending a turn; entering `>` wins. Engine, input, and render
modules now separate rules from terminal I/O, and the first unit test protects
collision and victory.

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `src/game.fl`
- `src/game_test.fl`
- `src/input.fl`
- `src/main.fl`
- `src/render.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

Exact changes: `../../diffs/04-map.patch`.

## Verify

```sh
longbow check tutorial/checkpoints/04-map
longbow test tutorial/checkpoints/04-map
longbow build tutorial/checkpoints/04-map
longbow run tutorial/checkpoints/04-map < tutorial/checkpoints/04-map/tests/input.txt
```

## Timeline

1. A room appears — static scene.
2. The picture becomes state — structs own position.
3. The player moves — stdin drives an open floor.
4. **Walls make movement meaningful** — map, collision, exit, modules, test.

## Challenge / acceptance

The recorded leading `W` must print the wall message while the next frame still
shows `Turn: 0`; four `S` moves must then win on turn 4.
