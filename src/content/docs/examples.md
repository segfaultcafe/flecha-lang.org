---
title: Examples
description: Runnable Flecha programs synced from the compiler repository.
---

These examples come directly from [`segfaultcafe/flecha`](https://github.com/segfaultcafe/flecha/tree/master/examples). They exercise syntax and compiler behavior used by the project itself.

## A good reading order

1. [Factorial](/examples/factorial/)
2. [Structures](/examples/structures/)
3. [Iteration](/examples/iteration/)
4. [Fixed arrays](/examples/fixed_arrays/)
5. [Error values](/examples/error_values/)
6. [Checked references](/examples/checked_references/)
7. [Callable values and closures](/examples/callables/)
8. [Standard-library modules and callback algorithms](/examples/standard-library/)
9. [Generic dynamic arrays](/examples/dynamic-array/)
10. [Ownership contracts](/examples/ownership_contracts/)
11. [Raw allocation](/examples/raw_allocation/)

## Run an example

```sh
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
```

Use the Examples section in the sidebar to browse the full synced set.
