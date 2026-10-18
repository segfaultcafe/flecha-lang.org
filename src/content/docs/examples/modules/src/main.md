---
title: "Modules · Src · Main"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/modules/src/main.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/modules/src/main.fl)

```flecha title="modules/src/main.fl"
module main;

@imports
    :: root::parser::math::factorial;

void main() {
    stdout("Factorial: ");
    stdoutln(factorial::factorial(5));
}
```
