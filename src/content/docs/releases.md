---
title: Releases
description: Current Flecha releases and project status.
---

## 0.2.4

Released October 25, 2026. Flecha 0.2.4 corrects test selection for logical modules composed from multiple source files.

`flecha test <file>` now executes only tests declared in the requested source file while still loading the complete logical test module for shared declarations, imports, and semantic analysis. `longbow test` now runs every source file that declares a test module, preserving complete project-wide coverage.

[View release v0.2.4 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.4)

## 0.2.3

Released October 22, 2026. Flecha 0.2.3 fixes nested receiver reborrowing in method-call arguments. Mutable receiver borrows now activate after argument evaluation, allowing temporary shared reborrows that produce ordinary values, such as `self->read(self->remaining())`.

Overlapping mutation, moves, and arguments that retain a borrow into the mutable call remain rejected.

[View release v0.2.3 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.3)

## 0.2.2

Released October 21, 2026. Flecha 0.2.2 fixes zero-state classification for structures containing move-only runtime-array owners. Null `*[]T` owners now count as trivially zeroable, so equivalent structures can use `none` directly, including inside tuple results, without weakening move-only ownership semantics.

[View release v0.2.2 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.2)

## 0.2.1

Released October 20, 2026. Flecha 0.2.1 corrects the module model introduced in 0.2.0: modules are now logical scopes assembled from declarations across any number of source files, and filenames no longer define module identity.

Imports select declared modules instead of files. Each source unit keeps its own imports while sharing declarations with every other file in the same logical module. Distinct imported modules with the same name can overlap; unique members resolve normally, ambiguous members produce a use-site error, and aliases isolate either module. Test pairing now follows declared `<name>_test` modules, so multiple arbitrarily named files can contribute to one test module.

Legacy `private module` remains accepted with a deprecation warning. New code should use `quiver` for same-namespace visibility. `export` now always means public declaration visibility, even inside a legacy private module, while the private module's import gate still limits who can import it.

[View release v0.2.1 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.1), read the [complete module correction](/docs/reference/release_0_2_1/), or use the current [modules and imports guide](/docs/reference/modules/).

## 0.2.0

Released October 20, 2026. Flecha 0.2.0 adds first-class callable values and closures, explicit capture ownership, generic and single-use `once` callables, callable-aware `defer`, scoped module visibility, first-class language tests, callback algorithms, expanded arrays, and richer filesystem and file-stream APIs.

[View release v0.2.0 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.0) or read the [complete v0.2.0 release notes](/docs/reference/release_0_2_0/).

## 0.1.3

Released October 19, 2026. This patch release improves character-byte interoperability: character values convert implicitly to `u8`, and borrowed string data can cross compatible byte-pointer boundaries in external calls.

[View release v0.1.3 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.3)

## 0.1.2

Released October 17, 2026. This patch release corrects zero-construction triviality, including through generic and nested structures.

[View release v0.1.2 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.2)

## 0.1.1

A stabilization release for the first installable toolchain. It strengthens clean-install verification across Linux, Windows, and macOS, improves linker diagnostics, and ships editor packages alongside platform archives.

[View release v0.1.1 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.1)

## 0.1.0

The first tagged Flecha release, establishing the initial compiler, runtime, standard library, packaging workflow, and language surface.

[View release v0.1.0 on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.0)

:::caution[Early-stage releases]
Flecha has not reached a stable language or ABI. Read each release's notes and pin versions for reproducible projects.
:::

## Current development

Flecha v0.3.0 is the current development milestone; it has not been released.
The latest released version is v0.2.4. The `master` branch tracks work
toward v0.3.0, and features there remain development behavior until they appear
in a tagged release.

Read the [v0.2.4 release on GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.4), the [v0.3.0 standard-library milestone](/docs/reference/release_0_3/), or the [complete changelog on GitHub](https://github.com/segfaultcafe/flecha/blob/master/CHANGELOG.md).
