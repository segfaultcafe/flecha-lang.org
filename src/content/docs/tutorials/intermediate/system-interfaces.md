---
title: '3. Packages and system interfaces'
description: Compose multi-module packages and treat filesystem, process, and network operations as explicit fallible boundaries.
---

Split a package by responsibility: model, parsing, operations, and entry-point
policy. `root` imports the current package; `lib::<alias>` imports a dependency
selected by the manifest. Keep the dependency graph visible and pin application
resolutions in `longbow.lock`.

Filesystem, process, and network APIs return explicit errors and own host
resources. Close or defer cleanup at the scope that acquired them. Normalize
paths before policy decisions, pass process arguments as values rather than a
shell string, and bound network reads, waits, and retries. A deterministic
diagnostic should identify the operation without leaking platform-specific
ordering into tests.

Read [filesystem](/docs/reference/filesystem/), [child
processes](/docs/reference/process/), and [networking](/docs/reference/network/)
only for the interface you are using.

## What to learn next

- [Project: qualify Workspace Guard](/tutorials/intermediate/project/)
- [Paths](/docs/reference/path/)
- [Package ecosystem](/docs/reference/package_ecosystem/)

