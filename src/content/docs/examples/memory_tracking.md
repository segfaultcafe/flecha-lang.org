---
title: "Memory Tracking example"
description: "Learn memory tracking in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/memory_tracking.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/memory_tracking.fl)

```flecha title="memory_tracking.fl"
// build/flecha build examples/memory_tracking.fl -o /tmp/memory_tracking
// Returns 42. Ownership follows the allocation across calls and aliases.
unsafe (*u8, error) make_byte() {
    return new<u8>(42);
}

unsafe void consume(*const u8 pointer) {
    defer free(pointer);
}

i32 main() {
    unsafe {
        pointer, err := make_byte();
        if err != none { return 1; }
        alias := pointer;
        i32 answer = (*alias) as i32;
        consume(pointer);
        // free(alias); would be a compile-time double-free error.
        // *alias = 0; would be a compile-time use-after-free error.

        // The deferred call captures this allocation before rebinding.
        another, failure := new<u8>(1);
        defer free(another); // Null is also a valid free argument.
        another = null;

        return answer;
    }
}
```
