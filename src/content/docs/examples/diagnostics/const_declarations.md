---
title: "Diagnostics · Const Declarations"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/diagnostics/const_declarations.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/diagnostics/const_declarations.fl)

```flecha title="diagnostics/const_declarations.fl"
// Intentionally rejected: demonstrates the three const declaration errors.
// Check: build/flecha --emit-llvm examples/diagnostics/const_declarations.fl

void parameter_write(const i32 input) {
    input = 42;                  // FLECHA-S0005: input is not writable.
}

void local_write() {
    const i32 value = 42;
    value = 42;                  // FLECHA-S0005: even the same value is a write.
}

void missing_initializer() {
    const i32 value;             // FLECHA-S0023: initializer required.
}
```
