---
title: '1. The unsafe boundary'
description: Decide whether unsafe is necessary, state the missing proof, and keep the boundary smaller than the safe API around it.
---

:::danger[Prerequisite, not a shortcut]
Complete the Advanced track first. Unsafe does not disable responsibility and
is never a performance shortcut. Measure performance separately; use unsafe
only for a boundary safe Flecha cannot express.
:::

Safe Flecha proves checked-reference lifetimes, slice bounds, resource moves,
and typed calls. `unsafe` exists for raw addresses, raw allocation, and native
contracts whose validity comes from outside those proofs. Before using it,
write the invariant in plain language and check whether a checked reference,
checked slice, owned value, or standard-library wrapper already expresses it.

Put the raw operation in a private function or tiny block. Validate sizes,
alignment, nullability, lifetime, ownership, and error behavior before crossing
the boundary. Return an ordinary safe value or explicit error; do not make every
caller repeat the proof.

## What to learn next

- [Raw memory and the first unsafe program](/tutorials/unsafe/raw-memory/)
- [Unsafe contexts and raw pointers](/docs/reference/unsafe_pointers/)
- [Memory safety invariants](/docs/reference/memory_safety_invariants/)

