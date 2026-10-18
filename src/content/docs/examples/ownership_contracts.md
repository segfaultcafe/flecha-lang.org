---
title: "Ownership Contracts example"
description: "Learn ownership contracts in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/ownership_contracts.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/ownership_contracts.fl)

```flecha title="ownership_contracts.fl"
structure Box { own *i32 value; };
unsafe Box Box::init(own *i32 value) override {
    return build Box { self.value = value; };
}
unsafe void Box::tear(&self) override { free(self->value); }
unsafe i32 Box::get(&const self) { if self->value == null { return 0; } return *self->value; }
unsafe void consume(own *i32 p) { free(p); }
unsafe (own *i32, error) create() { return new<i32>(42); }
i32 main() {
    unsafe {
        p, e := create();
        if e != none { return 1; }
        box := Box::init(p);
        return box.get();
    }
}
```
