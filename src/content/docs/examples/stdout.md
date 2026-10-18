---
title: "Stdout example"
description: "Learn stdout in Flecha with a complete source example you can inspect and run."
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
