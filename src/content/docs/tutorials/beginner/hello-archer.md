---
title: '1. Hello, Archer!'
description: Install the v0.3.0 toolchain, create one Longbow project, and compile and run your first Flecha program.
---

**Prerequisite:** [install Flecha v0.3.0](/install/) and confirm that `flecha
--version` and `longbow --version` both report `0.3.0`.

Create a project:

```sh test="hello-archer"
longbow new hello-archer
cd hello-archer
```

Replace `src/main.fl` with the tested source below:

```flecha title="src/main.fl" test="hello-archer"
module main;

@imports
    :: lib::std::fmt;

i32 main() {
    fmt::println("Hello, Archer!");
    return 0;
}
```

Check types before building, then run through Longbow:

```sh test="hello-archer"
longbow check
longbow run
```

The exact output is:

```text test="hello-archer"
Hello, Archer!
```

`module main;` declares the logical module. `@imports` makes the standard
library formatter available. The parameterless `i32 main()` is the executable
entry point, and zero reports success to the host.

## What to learn next

- [Build a command-line application](/tutorials/beginner/command-line-app/)
- [Compiler commands](/docs/reference/compiler/)
- [Longbow project workflow](/docs/reference/longbow/)

