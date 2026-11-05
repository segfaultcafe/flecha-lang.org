---
title: '2. Build a command-line application'
description: Extend the Archer project with arguments, deterministic diagnostics, and stable exit codes.
---

Create the next project in the Archer story:

```sh test="archer-cli"
longbow new archer-greet
cd archer-greet
```

Its only command accepts one name. This keeps parsing at the entry point and
makes every outcome observable through stdout, stderr, and the exit status.

```flecha title="src/main.fl" test="archer-cli"
module main;

@imports
    :: lib::std::fmt
    :: lib::std::os::arguments;

i32 main() {
    values, captureError := arguments::capture();
    if captureError != none {
        fmt::eprintln("archer-greet: cannot capture arguments");
        return 3;
    }
    if values.len() != 2 {
        fmt::eprintln("usage: archer-greet <name>");
        return 2;
    }
    fmt::println("Welcome, ", values[1].view(), "!");
    return 0;
}
```

```sh test="archer-cli"
longbow check
longbow run -- Fauna
```

```text test="archer-cli"
Welcome, Fauna!
```

Longbow forwards values after `--` without a shell and returns the program's
status. The qualified fixture also runs with no name and verifies status `2`
and the exact usage diagnostic.

## What to learn next

- [Create and publish a package](/tutorials/beginner/publish-package/)
- [Arguments and environment](/docs/reference/os/)
- [Formatting and diagnostics](/docs/reference/formatting/)

