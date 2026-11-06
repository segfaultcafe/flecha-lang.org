# Published snippet inventory

This inventory records the executable-code presentation defect introduced by
PR #20 and the rule used by the corrective change.

## Finding

PR #20 rendered 34 selected line ranges as ordinary code examples even though
the ranges were not independent programs:

- 15 `MainPractice` ranges: ten came from otherwise standalone fixture files,
  but omitted declarations, imports, `main`, or other required context; five
  came from multi-file Longbow packages and depended on their manifests and
  sibling modules.
- 19 ARROWFALL ranges across checkpoints 01–07: each was a focused fragment of
  a complete checkpoint source file.

The underlying fixtures compiled and their recorded outputs were real. The
presentation was still incorrect because validation covered each containing
fixture or package, not the exact range shown as if it were copyable by itself.

## Corrected presentation

- A standalone `MainPractice` now publishes its complete fixture file. The
  exact displayed text is the file checked, built, run, and compared with its
  expected output by `scripts/check-main-practice.mjs`.
- A package `MainPractice` labels the selected range as an `Excerpt`/`Trecho`,
  states that it depends on the package, and publishes the complete manifest
  and source bundle on the same page. Longbow checks, tests, builds, and runs
  that complete bundle.
- Every selected ARROWFALL range is labeled `Excerpt`/`Trecho`. The complete
  checkpoint manifest and source bundle appear on the same page. The seven
  bundles are checked, tested, built, run, and compared with committed golden
  output using official Flecha/Longbow v0.3.0.
- `scripts/check-published-code.mjs` reads the generated HTML, extracts the
  rendered code blocks, and requires byte-equivalence with every complete
  source file and every labeled excerpt selected from the committed fixtures.

This distinction is intentional: an excerpt explains one decision; only the
complete source is described as directly compilable.
