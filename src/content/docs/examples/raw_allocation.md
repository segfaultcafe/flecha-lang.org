---
title: "Raw Allocation example"
description: "Learn raw allocation in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/raw_allocation.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/raw_allocation.fl)

```flecha title="raw_allocation.fl"
// build/flecha build examples/raw_allocation.fl -o /tmp/raw_allocation
// Returns 42. Heap allocations need explicit or deferred free.
structure Box {
    i32 value;
    string label;
};

Box Box::init(i32 value, string label) override {
    return build Box { self.value = value; self.label = label; };
}

i32 Box::valueOf(&const self) { 
    return self->value; 
}

i32 main() {
    unsafe {
        (*Box box, error err) = new<Box>(Box::init(42, "heap object"));
        if err != none { return 1; }
        defer free(box); // Releases the owned label, then the Box storage.

        (byte, byteError) := new<u8>(none);
        if byteError == AllocationError.OutOfMemory { return 2; }
        *byte = 42;
        free(byte);
        byte = null;
        free(byte); // Null is a no-op.

        return box->valueOf();
    }
}
```
