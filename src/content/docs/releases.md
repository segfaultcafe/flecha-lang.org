---
title: Releases
description: Current Flecha releases and project status.
---

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

The `master` branch now tracks work after v0.2.0. Features on that branch remain development behavior until they appear in another tagged release.

Read the [v0.2.0 implementation milestone](/docs/reference/release_0_2/) or see the [complete changelog on GitHub](https://github.com/segfaultcafe/flecha/blob/master/CHANGELOG.md).
