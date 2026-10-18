---
title: "If Also"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/if_also.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/if_also.fl)

```flecha title="if_also.fl"
i32 main() {
    value := 0;

    if false {
        value = 100;
    } also true {
        // This does not run because its owning `if` did not run.
        value = 99;
    } else if true {
        value = 40;
    } also value == 40 {
        // This runs because its owning `else if` ran.
        value = value + 2;
    } else {
        value = 1;
    }

    return value;
}
```
