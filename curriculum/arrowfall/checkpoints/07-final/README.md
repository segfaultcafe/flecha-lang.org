# 07 — Reproducible, testable, terminal-ready

## Starting point

Checkpoint 06 is a complete small game, but pursuit always makes the same
choice, transcripts scroll interactively, and changing behaviour requires
editing source.

## Why now?

Different runs are fun; flaky lessons and tests are not. We need controlled
variation, a clean terminal presentation, and a release-quality verification
boundary without changing the pure engine/render split.

## New behaviour

`Generator::fromSeed` breaks pursuit ties reproducibly. `--seed <u64>` lets the
player select a run, defaulting empty/absent values to `20261105`.
Interactive mode redraws with isolated ANSI; `--no-clear` preserves accessible
goldens and logs. Eleven focused tests plus winning, defeat, option, no-control,
and visible-damage checks qualify the complete project.

## Files changed

- `README.md`
- `longbow.lock`
- `longbow.toml`
- `scripts/check-golden.sh`
- `src/game.fl`
- `src/game_test.fl`
- `src/input.fl`
- `src/input_test.fl`
- `src/main.fl`
- `src/options.fl`
- `src/options_test.fl`
- `src/render.fl`
- `src/render_test.fl`
- `tests/input.txt`
- `tests/output.txt`
- `tests/defeat_input.txt`
- `tests/defeat_output.txt`
- `tests/frame.txt`
- `tests/frame.svg`

Exact changes: `../../diffs/07-final.patch`. This snapshot contains the full
final source; it does not depend on files above this directory.

## Verify

```sh
longbow check tutorial/checkpoints/07-final
longbow test tutorial/checkpoints/07-final
longbow build tutorial/checkpoints/07-final
longbow run tutorial/checkpoints/07-final -- --no-clear --seed 20261105 < tutorial/checkpoints/07-final/tests/input.txt
LONGBOW=longbow tutorial/checkpoints/07-final/scripts/check-golden.sh
```

Try controlled variation:

```sh
longbow run tutorial/checkpoints/07-final -- --seed 42
```

## Timeline

1. A room appears — static scene.
2. The picture becomes state — structs and methods.
3. The player moves — stdin and typed commands.
4. Walls create collision and victory — map, modules, first test.
5. A goblin creates turn pressure — threat, HP, observable events.
6. The archer earns the name — IJKL, inventory, line of sight.
7. **Reproducible and terminal-ready** — seeded RNG, CLI options, ANSI/plain
   modes, persistent feedback, full rule and golden qualification.

## Challenge / acceptance

Run the same seed twice: stdout and decisions must match. Run seed 42 and
observe the displayed seed and possibly different tie choices. `--no-clear`
must contain no control bytes, and invalid non-empty seeds must not launch.
