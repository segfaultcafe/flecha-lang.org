---
title: "While Also"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/while_also.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/while_also.fl)

```flecha title="while_also.fl"
i32 main() {
    value := 0;
    counter := 0;

    while counter < 4 {
        value = value + 10;
        counter = counter + 1;
    } also counter % 2 == 0 {
        value = value + 1;
    }

    return value;
}
```
