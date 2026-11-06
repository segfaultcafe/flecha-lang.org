# 05 — A turn now has consequences

## Starting point

Checkpoint 04 has meaningful walls and an exit, but the room is safe and the
shortest path is automatic.

## Why now?

Without pressure there is no reason to weigh one movement against another. A
single pursuer makes the turn model visible before combat adds another action.

## New behaviour

A goblin takes one response after each effective player turn. First adjacency
only warns. If the player begins the next action adjacent and fails to escape,
the goblin deals one HP; safe no-ops remain free. `TurnResult` carries player
and enemy events so rules are observable instead of inferred by the CLI.

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

Exact changes: `../../diffs/05-goblin.patch`.

## Verify

```sh
longbow check tutorial/checkpoints/05-goblin
longbow test tutorial/checkpoints/05-goblin
longbow build tutorial/checkpoints/05-goblin
longbow run tutorial/checkpoints/05-goblin < tutorial/checkpoints/05-goblin/tests/input.txt
```

## Timeline

1. A room appears.
2. The picture becomes state.
3. The player moves.
4. Walls create collision and victory.
5. **A turn has consequences** — pursuit, warning, HP, defeat, events.

## Challenge / acceptance

The first adjacent frame must show a warning at 3 HP. Only a later failed
response may show `-1 HP`; the goblin must never move and attack together.
