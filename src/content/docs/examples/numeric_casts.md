---
title: "Numeric Casts example"
description: "Learn numeric casts in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/numeric_casts.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/numeric_casts.fl)

```flecha title="numeric_casts.fl"
i32 main() {
    first := 32 as i32;
    second := 10.cast<i32>;
    base := first + second;
    wide := base.cast<i64>;
    narrow := wide.cast<u8>;
    decimal := narrow.cast<f64>;
    result := (decimal as f32) as i32;
    return result;
}
```
