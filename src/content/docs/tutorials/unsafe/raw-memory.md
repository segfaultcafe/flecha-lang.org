---
title: '2. Raw memory and the first unsafe program'
description: Contrast a checked borrow with a raw pointer and state the lifetime proof the raw dereference requires.
---

The safe form should be your default:

```flecha title="safe.fl" test="unsafe-first"
i32 main() {
    i32 value = 42;
    reference := &value;
    stdoutln(*reference);
    return 0;
}
```

The smallest raw equivalent needs an explicit boundary:

```flecha title="unsafe.fl" test="unsafe-first"
i32 main() {
    i32 value = 42;
    unsafe {
        *i32 pointer = &raw value;
        stdoutln(*pointer);
    }
    return 0;
}
```

Both qualified programs print exactly `42` and return zero. The first lets the
compiler track the borrow. The second asks the reviewer to prove that `pointer`
is non-null, aligned, points to a live `i32`, has compatible access, and is not
used after `value` dies. It is longer in proof even though it is similar in
syntax.

Run the exact checked pair from the repository:

```sh test="unsafe-first-run"
flecha check curriculum/fixtures/unsafe-first/safe.fl
flecha build curriculum/fixtures/unsafe-first/safe.fl -o build/safe-first
build/safe-first
flecha check curriculum/fixtures/unsafe-first/unsafe.fl
flecha build curriculum/fixtures/unsafe-first/unsafe.fl -o build/unsafe-first
build/unsafe-first
```

```text test="unsafe-first-run"
42
42
```

Raw `new<T>` also returns an allocation error and creates a cleanup obligation.
Pair every successful allocation with exactly one `free`, including early
returns. Prefer an owning safe structure when raw storage is not itself the API.

## What to learn next

- [FFI and native interop](/tutorials/unsafe/native-interop/)
- [Raw allocation](/docs/reference/raw_allocation/)
- [Memory tracking example](/examples/memory_tracking/)

