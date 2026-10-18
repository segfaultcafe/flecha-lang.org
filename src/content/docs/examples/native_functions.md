---
title: "Native Functions"
description: A Flecha source example from the compiler repository.
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
