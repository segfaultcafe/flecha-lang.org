---
title: "String View example"
description: "Learn string view in Flecha with a complete source example you can inspect and run."
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
