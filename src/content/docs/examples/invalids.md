---
title: "Invalids"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/invalids.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/invalids.fl)

```flecha title="invalids.fl"
unsafe i32 main() {
    *i32 pointer = none;
    i32 val = 2;

    pointer = &raw val;
    stdoutln(*pointer);

    return 0;
}
```
