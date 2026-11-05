---
title: Build a command-line application
description: Capture arguments, print diagnostics, return stable exit codes, and use the bundled v0.3 standard library in a Flecha program.
---

This tutorial builds a small command-line program through Longbow. It uses
ordinary Flecha error values and the bundled standard library; no runtime
framework or shell wrapper is involved.

```sh
longbow new greeter
cd greeter
```

Replace `src/main.fl` with:

```flecha title="src/main.fl"
module main;

@imports
    :: lib::std::fmt
    :: lib::std::os::arguments;

i32 main() {
    values, captureError := arguments::capture();
    if captureError != none {
        fmt::eprintln("greeter: cannot capture process arguments");
        return 3;
    }

    if values.len() != 2 {
        fmt::eprintln("usage: greeter <name>");
        return 2;
    }

    fmt::println("Hello, ", values[1].view(), "!");
    return 0;
}
```

Check it, then forward arguments after `--`:

```sh
longbow check
longbow run -- Fauna
```

Longbow passes arguments directly without invoking a shell and propagates the
program's exit status. Flecha's entry point remains parameterless; capture host
arguments with `lib::std::os::arguments`.

## Grow it safely

Keep parsing and operations in separate modules, return typed errors, and map
them to stable command exit codes only in `main`. For filesystem work, prefer
`lib::std::io` path, directory, file, reader, and writer modules over native
calls. For secrets, use secure randomness and constant-time byte helpers rather
than a deterministic generator.

The complete [Workspace Guard](/examples/workspace_guard/src/main/) example
adds recursive directory scanning, SHA-256 manifests, environment variables,
child processes, deterministic diagnostics, and portable path validation. The
[deterministic ledger](/examples/ledger/src/main/) demonstrates canonical
binary persistence and tamper detection.

- [Arguments and environment](/docs/reference/os/)
- [Formatting](/docs/reference/formatting/)
- [Filesystem and buffered I/O](/docs/reference/filesystem/)
- [Child processes](/docs/reference/process/)

