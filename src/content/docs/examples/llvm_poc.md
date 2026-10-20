---
title: "LLVM IR proof of concept"
description: "Inspect a small Flecha program used to exercise LLVM IR generation and execution."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/llvm_poc.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/llvm_poc.fl)

```flecha title="llvm_poc.fl"
i32 add(i32 left, i32 right) {
    return left + right;
}

i32 main() {
    x := 20;
    y := 22;
    return add(x, y);
}
```
