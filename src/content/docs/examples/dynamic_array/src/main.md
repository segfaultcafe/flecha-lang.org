---
title: "Dynamic Array · Src · Main"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/dynamic_array/src/main.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/dynamic_array/src/main.fl)

```flecha title="dynamic_array/src/main.fl"
module main;

@imports
    :: lib::std::containers::array;

i32 main() {
    numbers := array::Array<i32>::init();

    i32 i = 0;
    while i < 100 {
        err := numbers.push(i);
        if err != none {
            return 1;
        }
        i++;
    }

    value, err := numbers.get(42);
    if err != none {
        return 2;
    }

    stdout("Array length: ");
    stdoutln(numbers.len());
    stdout("Element 42: ");
    stdoutln(value);
    return value;
}
```
