---
title: '3. Failure handling and API design'
description: Bound failure, test pressure paths, benchmark honestly, and design modules whose contracts remain understandable.
---

List each operation's failure classes before choosing an API. Preserve errors
that callers can act on, attach deterministic context at one layer, and convert
to a process exit status only at the entry point. Exercise allocation pressure,
truncated input, repeated calls, partial writes, timeouts, and cleanup after an
error. Tests should assert state as well as the returned error.

Benchmark the operation users face: include setup only when users pay it,
consume results, warm up comparable runtimes, and report distributions rather
than a single best sample. Record versions, target, optimization mode, input,
and command so the result can become a future baseline.

Keep modules cohesive and exports few. Separate wire or disk formats from
in-memory models, make invalid states hard to construct, and prefer one explicit
conversion over implicit policy spread across call sites.

## What to learn next

- [Project: qualify a deterministic ledger](/tutorials/advanced/project/)
- [Testing](/docs/reference/testing/)
- [Module and API design](/docs/reference/library_api_style/)

