---
title: "Loop Control"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/loop_control.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/loop_control.fl)

```flecha title="loop_control.fl"
i32 main() {
    value := 0;
    warmup := 0;

    while warmup < 1 {
        warmup = warmup + 1;
        proceed;
    }

    while true {
        if value == 0 {
            jumpto inner_position;
        }

        #outer_position
        break;

        while true {
            #inner_position
            value = 42;
            jumpto outer_position;
        }
    }

    return value;
}
```
