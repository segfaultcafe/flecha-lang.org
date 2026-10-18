---
title: "Ref And Slice Returns"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/ref_and_slice_returns.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/ref_and_slice_returns.fl)

```flecha title="ref_and_slice_returns.fl"
structure Pair {
    i32 left;
    i32 right;
};

&const i32 view(&const i32 value) <- value {
    return value;
}

[]const i32 as_readonly([]i32 values) <- values {
    return values;
}

(&i32, &i32) fields(&Pair pair) <- pair {
    return (&pair->left, &pair->right);
}

i32 main() {
    Pair pair = none;
    left, right := fields(&pair);
    *left = 20;
    *right = 22;

    values := [20, 22];
    readonly := as_readonly(values[:]);
    first := view(&readonly[0]);
    return pair.left + pair.right + *first - 20;
}
```
