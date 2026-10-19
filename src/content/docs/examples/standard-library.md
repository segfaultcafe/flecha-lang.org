---
title: "Standard library modules"
description: "Import and use Flecha standard-library algorithms with modules, generic functions, fixed arrays, and slices."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/modules/src/main.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/modules/src/main.fl)

```flecha title="modules/src/main.fl"
module main;

@imports
    :: lib::std::containers::algorithms;

i32 main() {
    [5]i32 values = [10, 20, 30, 20, 40];
    index, found := algorithms::index_of<i32>(values[:], 30);

    if found {
        stdout("Found at index: ");
        stdoutln(index);
        return 0;
    }

    return 1;
}
```
