---
title: "String View"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/string_view.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/string_view.fl)

```flecha title="string_view.fl"
stringv Identity(stringv value) {
    return value;
}

bool Equal(stringv left, stringv right) {
    return left == right;
}

i32 main() {
    message := Identity("Flecha");

    if Equal(message, "Flecha") and message != "Arrow" and "" == "" {
        return 42;
    }

    return 0;
}
```
