# 06 — The archer earns the name

## Starting point

Checkpoint 05 adds pressure and fair warning, but the only response is to run.

## Why now?

An archer should trade a scarce resource for safety. The existing map already
makes direction and line of sight meaningful.

## New behaviour

I/J/K/L shoots up/left/down/right. A shot consumes one of three arrows, walks
cell by cell until a wall, and kills the goblin if the line crosses it. Hit,
miss, and empty-quiver outcomes are distinct; twin control diamonds make both
directional action families visible.

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `src/game.fl`
- `src/game_test.fl`
- `src/input.fl`
- `src/input_test.fl`
- `src/main.fl`
- `src/render.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

Exact changes: `../../diffs/06-archery.patch`.

## Verify

```sh
longbow check tutorial/checkpoints/06-archery
longbow test tutorial/checkpoints/06-archery
longbow build tutorial/checkpoints/06-archery
longbow run tutorial/checkpoints/06-archery < tutorial/checkpoints/06-archery/tests/input.txt
```

## Timeline

1. A room appears.
2. The picture becomes state.
3. The player moves.
4. Walls create collision and victory.
5. A goblin creates turns, threat, and defeat.
6. **The archer earns the name** — IJKL, arrows, line of sight, combat win.

## Challenge / acceptance

The recorded `S S L S S` run must kill the goblin on turn 3 and reach the exit
on turn 5 with 3 HP and 2 arrows. An upward shot from start must miss.
