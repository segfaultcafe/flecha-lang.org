---
title: '3. FFI and native interop'
description: Translate native ABI contracts into narrow Flecha wrappers with explicit ownership and failure behavior.
---

Start from the native declaration, not from a guessed Flecha type. Record target
ABI, calling convention, exact integer widths, pointer constness, structure
layout, string representation, lifetime, thread rules, and error reporting.
Reject a platform at build time when those facts do not match.

Keep `extern` declarations private to one interop module. That module validates
safe inputs, performs the smallest raw conversion, calls native code, copies or
adopts results according to the documented owner, and converts failure to a
Flecha error. Callers should not need `unsafe` merely because the implementation
uses FFI.

Embedded native sources are part of the package and build contract. Pin their
compiler flags, qualify each target, and test nulls, empty buffers, maximum
lengths, callbacks, repeated calls, and cleanup after native failure.

## What to learn next

- [Containment, review, and testing](/tutorials/unsafe/containment/)
- [External functions](/docs/reference/extern/)
- [Runtime ABI](/docs/reference/runtime_abi/)

