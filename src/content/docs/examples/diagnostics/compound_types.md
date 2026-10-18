---
title: "Diagnostics · Compound Types"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/diagnostics/compound_types.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/diagnostics/compound_types.fl)

```flecha title="diagnostics/compound_types.fl"
// Intentionally rejected: nested reference storage and compound casts.
// Check: build/flecha --emit-llvm examples/diagnostics/compound_types.fl
// Runnable references: examples/checked_references.fl

// FLECHA-S0024: these storage shapes need additional lifetime contracts.
void unsupported_storage(
    *&u8 pointerToReference,
    & &u8 referenceToReference,
    &string stringReference,
    &stringv viewReference
) {}

void unsupported_casts() {
    0 as *u8;               // FLECHA-S0017: integer-to-pointer cast rejected.
    0.cast<constref u8>;    // FLECHA-S0017: integer-to-reference cast rejected.
}

// Aliases already include const on their own layer. These cause parser errors:
// const constptr u8 duplicatePointer;
// const constref u8 duplicateReference;
// const const i32 duplicateValue = 42;
```
