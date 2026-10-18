---
title: "Modules · Src · Parser · Math · Factorial"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/modules/src/parser/math/factorial.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/modules/src/parser/math/factorial.fl)

```flecha title="modules/src/parser/math/factorial.fl"
module factorial;

export i32 factorial(i32 n) {
    if n <= 1 { return 1; }
    return n * factorial(n - 1);
}
```
