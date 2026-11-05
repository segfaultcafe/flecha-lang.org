---
title: '2. Native boundaries and performance evidence'
description: Design FFI and embedded-native boundaries, then inspect generated code before making performance claims.
---

An external function declaration is an ABI contract. Match calling convention,
integer width, layout, ownership, and failure behavior exactly. Wrap it in a
small Flecha module so the rest of the application uses ordinary typed values.
Keep native build inputs explicit and qualify every supported target.

For performance work, start with a representative workload and stable output.
Measure optimized native builds, inspect LLVM for bounds and overflow checks,
and profile allocation before changing code. Constant or provably safe indices
may let LLVM remove checks; variable indices must keep the language's safety
contract. Never weaken a check to win a microbenchmark.

Read [external functions](/docs/reference/extern/), [LLVM code
generation](/docs/reference/llvm_codegen/), and the [v0.3 performance
baseline](/docs/reference/performance/) for current evidence.

## What to learn next

- [Failure handling and API design](/tutorials/advanced/failure-and-api-design/)
- [Runtime ABI](/docs/reference/runtime_abi/)
- [Native code generation](/docs/reference/native_codegen/)

