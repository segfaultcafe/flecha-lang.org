---
title: Learn Flecha v0.3
description: Start with Longbow, current Flecha syntax, explicit errors and ownership, tests, standard-library modules, and packages.
---

This guide follows the developing v0.3 toolchain. Install matching `flecha` and
`longbow` binaries first. Flecha files use `.fl`; an executable defines
parameterless `i32 main()` or `void main()`.

## Your first program

```sh
longbow new hello
cd hello
longbow check
longbow run
```

Longbow creates `longbow.toml` and `src/main.fl`, discovers the bundled standard
library, and writes generated output below `target`. Direct compiler commands
remain useful for isolated source files, but Longbow is the supported project
and package workflow.

## Functions and inferred locals

Return types appear before function names. `:=` infers a local variable's type.

```flecha
module main;

@imports
    :: lib::std::fmt;

i32 square(i32 value) {
    return value * value;
}

i32 main() {
    answer := square(7);
    fmt::println(answer);
    return 0;
}
```

Imports identify declared logical modules. `root` addresses the current
package; `lib::<alias>` addresses a dependency alias. Longbow provides
`lib::std` from the matching installed toolchain.

## Errors are values

```flecha
error ParseError { Invalid; }

(i32, ParseError) parse_answer(stringv input) {
    if input != "42" { return (0, ParseError.Invalid); }
    return (42, none);
}
```

Check returned errors before using fallible results. Crashable `!` APIs are an
explicit convenience for contexts where failure should terminate; ordinary
library boundaries should preserve error values.

## Memory and safety boundaries

Checked references and slices can be used in safe code. Owning values are moved,
not silently copied. Raw pointers and raw allocation require an explicit
`unsafe` context. Lifecycle methods and definite-assignment checks keep
resource initialization and teardown visible.

- [Checked references](/docs/reference/checked_references/)
- [Checked slices](/docs/reference/checked_slices/)
- [Ownership contracts](/docs/reference/ownership_contracts/)
- [Raw allocation](/docs/reference/raw_allocation/)
- [Memory model and proposals](/docs/reference/memory_model/)

## Continue through the v0.3 workflow

- [Create, test, build, and run a multi-module project](/tutorials/first-project/)
- [Build a command-line application](/tutorials/command-line-app/)
- [Create and ship an immutable source package](/tutorials/publish-package/)
- [Browse every exported standard-library module](/docs/reference/standard_library/)
- [Study complete runnable examples](/examples/)

The [language specification](/docs/specification/) defines syntax and semantics.
The focused guides define current library ownership, allocation, error,
blocking, determinism, and platform contracts.
