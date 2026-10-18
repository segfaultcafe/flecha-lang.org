---
title: "Factorial"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/factorial.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/factorial.fl)

```flecha title="factorial.fl"
i32 factorial(i32 n) {
    if n <= 1 {
        return 1;
    }

    return n * factorial(n - 1);
}

void main() {
    result := factorial(5);
    stdout("Factorial: ");
    stdoutln(result);
}
```
