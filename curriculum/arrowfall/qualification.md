# Tutorial checkpoint qualification

Qualified on 2026-11-05 with official Linux x86-64 Flecha/Longbow 0.3.0,
release commit `6dcea41dbdbee65773747b8474780977b6bb5fd0`.

`LONGBOW=<official-0.3.0-longbow> tutorial/validate.sh` rebuilt and executed
all seven snapshots from their own directories, then compared real stdout with
the checked-in transcript byte for byte.

| Step | Production non-empty lines | Focused tests | Transcript |
|---|---:|---:|---|
| 01 scene | 7 | 0 | exact |
| 02 state | 44 | 0 | exact |
| 03 movement | 104 | 0 | exact |
| 04 map | 217 | 1/1 | exact |
| 05 goblin | 363 | 2/2 | exact defeat |
| 06 archery | 443 | 3/3 | exact victory |
| 07 final | 615 | 11/11 | exact victory and defeat |

The physical line count rises sharply because the required style expands every
body and branch onto separate lines. The architecture remains four gameplay
modules plus the isolated CLI option module; no save/load, unsafe code,
artificial collection, or multiple-enemy subsystem was added.

Final CLI qualification also passed:

- plain winning and natural-defeat transcripts;
- no control bytes in `--no-clear` output;
- attack text and reduced HP in the same ANSI-cleared frame;
- default seed for absent, empty, missing, and option-followed values;
- explicit seed in both option orders;
- invalid and out-of-range seed rejection before game launch;
- byte-identical SVG frames and predecessor diffs after two regenerations;
- `git diff --check`.

The first three checkpoints intentionally have no unit tests: before rules
exist, their compiled deterministic transcript is the useful acceptance test.
Rule-level tests begin with collision/victory in checkpoint 04 and grow only
when behaviour can regress.
