---
title: Releases
description: Current Flecha releases and project status.
---

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

## Development on `master`

Work after v0.1.3 includes callable values and closures with explicit `copy`, checked-reference, `lend`, and `own` captures; generic callable signatures; safe movement of callable-containing values; and quiver-scoped declarations and private modules. These features are development behavior rather than part of the v0.1.3 release contract.

Read the [v0.2.0 milestone](/docs/reference/release_0_2/) for implemented and remaining work, or see the [complete changelog on GitHub](https://github.com/segfaultcafe/flecha/blob/master/CHANGELOG.md).
