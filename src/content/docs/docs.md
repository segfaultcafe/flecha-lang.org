---
title: Documentation
description: Language, compiler, tooling, implementation, and design documentation for Flecha.
---

Flecha's documentation is synced from the compiler repository so the guides here track the implementation while this website remains independently deployable.

:::note[Project status]
Flecha is under active development. Focused feature guides describe current compiler behavior; broader design documents and parts of the specification may describe intended or experimental behavior.
:::

## Start here

- [Language specification](/docs/specification/)
- [Compiler reference](/docs/reference/compiler/)
- [Supported toolchains](/docs/reference/toolchains/)
- [Modules](/docs/reference/modules/)
- [Longbow](/docs/reference/longbow/)

## Language features

- [Structures](/docs/reference/structures/), [tuples](/docs/reference/tuples/), and [enums](/docs/reference/enums/)
- [Fixed arrays](/docs/reference/fixed_arrays/) and [dynamic arrays](/docs/reference/dynamic_arrays/)
- [Strings](/docs/reference/string/) and [error values](/docs/reference/error_values/)
- [Iteration](/docs/reference/iteration/), [match](/docs/reference/match/), and [defer](/docs/reference/defer/)
- [Generics](/docs/reference/generics/) and [extern declarations](/docs/reference/extern/)

## Memory and ownership

- [Checked references](/docs/reference/checked_references/) and [checked slices](/docs/reference/checked_slices/)
- [Ownership contracts](/docs/reference/ownership_contracts/)
- [Definite assignment](/docs/reference/definite_assignment/)
- [Raw allocation](/docs/reference/raw_allocation/) and [unsafe pointers](/docs/reference/unsafe_pointers/)
- [Memory model and remaining proposals](/docs/reference/memory_model/)

## Compiler internals

Implementation references cover [semantic analysis](/docs/reference/semantic_analysis/), [typed lowering IR](/docs/reference/typed_lowering_ir/), [LLVM code generation](/docs/reference/llvm_codegen/), [native code generation](/docs/reference/native_codegen/), and the [runtime ABI](/docs/reference/runtime_abi/).
