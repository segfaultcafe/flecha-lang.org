---
title: Learn Flecha
description: A short guided introduction to Flecha syntax and its compiler workflow.
---

This guide assumes you have [built the compiler](/install/). Flecha files use the `.fl` extension, and an executable entry module defines either `i32 main()` or `void main()`.

## Your first program

```flecha title="hello.fl"
void main() {
    stdoutln("Hello from Flecha");
}
```

```sh
build/flecha check hello.fl
build/flecha build hello.fl -o build/hello
./build/hello
```

`check` runs the frontend without creating an artifact. `build` emits and links a native executable.

## Functions and inferred locals

Return types appear before function names. `:=` infers a local variable's type.

```flecha
i32 square(i32 value) {
    return value * value;
}

void main() {
    answer := square(7);
    stdoutln(answer);
}
```

## Memory and safety boundaries

Checked references and slices can be used in safe code. Raw pointers and raw allocation require an explicit `unsafe` context. Ownership contracts and definite-assignment checks help the compiler reject invalid resource flows.

- [Checked references](/docs/reference/checked_references/)
- [Checked slices](/docs/reference/checked_slices/)
- [Ownership contracts](/docs/reference/ownership_contracts/)
- [Raw allocation](/docs/reference/raw_allocation/)
- [Memory model and proposals](/docs/reference/memory_model/)

## Projects with Longbow

```sh
build/longbow new hello
cd hello
../build/longbow check
../build/longbow run
```

Continue with [modules and package layout](/docs/reference/modules/), then explore the [examples](/examples/) and [language specification](/docs/specification/).
