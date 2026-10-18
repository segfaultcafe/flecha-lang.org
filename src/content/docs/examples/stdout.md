---
title: "Stdout"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/stdout.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/stdout.fl)

```flecha title="stdout.fl"
i32 main() {
    stringv mom = "mom";
    stdout("Hello, ");
    stdout("Flecha!\n");
    stdoutln(mom);
#here
    return 42;
}
```
