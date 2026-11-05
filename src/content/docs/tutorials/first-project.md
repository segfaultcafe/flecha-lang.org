---
title: Your first Longbow project
description: Create, check, test, build, and run a multi-module Flecha v0.3 program with the supported project workflow.
---

Longbow is Flecha's project and package tool. It keeps the compiler, bundled
standard library, dependency graph, and native linker inputs on one supported
path. Use direct `flecha` commands for compiler experiments; use Longbow for
applications and libraries.

## Create the project

Install `flecha` and `longbow` from the same toolchain, then run:

```sh
longbow new hello
cd hello
longbow check
longbow run
```

The scaffold contains a manifest and one source module:

```text
hello/
  longbow.toml
  src/
    main.fl
```

```toml title="longbow.toml"
[package]
name = "hello"
version = "0.1.0"
kind = "program"

[dependencies]
```

Longbow automatically injects the standard library bundled with the selected
toolchain as `lib::std`. Do not add it as a registry dependency.

## Add a module

Create `src/math.fl`:

```flecha title="src/math.fl"
module math;

export i32 double(i32 value) {
    return value * 2;
}
```

Then replace `src/main.fl`:

```flecha title="src/main.fl"
module main;

@imports
    :: root::math
    :: lib::std::fmt;

i32 main() {
    fmt::println("Six doubled is ", math::double(6));
    return 0;
}
```

`root` means this package's `src` tree. An import selects the declared module,
not a filename; several files may contribute to the same logical module.

## Add a test

Create `src/math_test.fl`:

```flecha title="src/math_test.fl"
module math_test;

@imports
    :: root::math
    :: lib::std::tests::asserts
    :: lib::std::tests::testing;

test doubles_an_integer(&testing::UnitTest t) {
    i32 expected = 12;
    actual := math::double(6);
    asserts::equal<i32>(t, &expected, &actual, "double returns twice the input");
}
```

Run the complete workflow:

```sh
longbow check
longbow test
longbow build
longbow run
```

Generated files stay under `target/`. `longbow clean` removes that directory.
Compilation failure prevents `run` from launching an older executable.

## What to learn next

- [Modules, imports, exports, and quivers](/docs/reference/modules/)
- [Error values and crashable functions](/docs/reference/error_values/)
- [Memory and ownership](/docs/reference/memory/)
- [Flecha v0.3 standard-library API](/docs/reference/standard_library/)
- [Create and ship a package](/tutorials/publish-package/)

