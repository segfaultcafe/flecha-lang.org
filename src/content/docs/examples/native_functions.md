---
title: "Native Functions example"
description: "Learn native functions in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/native_functions.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/native_functions.fl)

```flecha title="native_functions.fl"
i32 main() {
    i32 x = Factorial(3);
    return Add(x, 36);
}

i32 Add(i32 left, i32 right) {
    return left + right;
}

i32 Factorial(i32 value) {
    if value <= 1 {
        return 1;
    }

    return value * Factorial(value - 1);
}
```
