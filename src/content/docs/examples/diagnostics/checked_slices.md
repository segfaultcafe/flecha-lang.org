---
title: "Diagnostics · Checked Slices"
description: A Flecha source example from the compiler repository.
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/diagnostics/checked_slices.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/diagnostics/checked_slices.fl)

```flecha title="diagnostics/checked_slices.fl"
// This file intentionally fails semantic analysis.
void invalid_bounds() {
    a := [1, 2];
    s := a[2:1];
}
void needs_storage() {
    s := [1, 2][:]; // A temporary array cannot back a borrowed slice.
}
void moved_handle() {
    a := [1, 2];
    s := a[:];
    moved := s;
    s.len();
}
void conflicting_access() {
    a := [1, 2];
    s := a[:];
    a[0] = 3;
    s.front();
}
void read_only() {
    a := [1, 2];
    []const i32 s = a[:];
    s.back()++;
}
void escaping_slice() {
    a := [1, 2];
    s := a[:];
    { inner := [3, 4]; s = inner[:]; }
    s.len();
}
```
