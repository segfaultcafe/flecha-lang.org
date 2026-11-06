# Arrowfall cumulative tutorial source

These seven independent snapshots are the canonical technical inputs for the
website tutorial. Every directory is a complete Flecha 0.3.0 project that can
be checked, tested, built, and run without the later checkpoints.

The order follows observable needs rather than a language feature catalogue:

1. print a recognisable scene;
2. make the scene derive from owned state;
3. accept blocking input and move;
4. make walls and an exit into rules;
5. add fair turn pressure and observable events;
6. add the archer's scarce, directional action;
7. add controlled variation, terminal polish, and full qualification.

Each checkpoint README contains prior state, motivation, behaviour, exact file
list, commands, cumulative timeline, and an acceptance challenge. `tests` holds
real deterministic stdin/stdout plus an accessible text frame and matching SVG.
`diffs` holds exact cumulative diffs. `manifest.json` exposes paths and commands
to the Frontender without scraping prose.

## Clean campaign

From the Arrowfall repository root with official Flecha/Longbow 0.3.0 on PATH:

```sh
LONGBOW=longbow tutorial/validate.sh
```

The campaign checks each actual transcript against its recorded stdout. It also
runs the final compiled CLI qualification for ANSI visibility, control-byte
absence, the seed matrix, and invalid seed rejection.

Regenerate code-native visual captures and diffs after intentional checkpoint
changes:

```sh
./tutorial/render_frames.py
./tutorial/generate_diffs.sh
```
