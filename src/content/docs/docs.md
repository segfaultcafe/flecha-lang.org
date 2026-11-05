---
title: Documentation
description: Current Flecha v0.3 language, standard-library, package, compiler, and tooling documentation.
---

Flecha's documentation is synced from the compiler repository so the guides here track the implementation while this website remains independently deployable.

:::note[Version boundary]
These pages track the developing v0.3 contract on `master`. Historical release
and implementation documents are retained for archaeology, but they are not the
current API. Pin a tagged toolchain when you need a frozen contract.
:::

## Start here

- [Language specification](/docs/specification/)
- [Compiler reference](/docs/reference/compiler/)
- [Supported toolchains](/docs/reference/toolchains/)
- [Modules](/docs/reference/modules/)
- [Longbow](/docs/reference/longbow/)
- [Package ecosystem](/docs/reference/package_ecosystem/)
- [Complete v0.3 standard-library API inventory](/docs/reference/standard_library/)

## Tutorials

- [Your first Longbow project](/tutorials/first-project/)
- [Build a command-line application](/tutorials/command-line-app/)
- [Create and ship a package](/tutorials/publish-package/)

## Language features

- [Structures](/docs/reference/structures/), [tuples](/docs/reference/tuples/), and [enums](/docs/reference/enums/)
- [Fixed arrays](/docs/reference/fixed_arrays/) and [dynamic arrays](/docs/reference/dynamic_arrays/)
- [Strings](/docs/reference/string/) and [error values](/docs/reference/error_values/)
- [Iteration](/docs/reference/iteration/), [match](/docs/reference/match/), and [defer](/docs/reference/defer/)
- [Generics and callable signatures](/docs/reference/generics/), [callable examples](/examples/callables/), and [extern declarations](/docs/reference/extern/)
- [Module, quiver, and private-module visibility](/docs/reference/modules/)
- [Logical modules across multiple source files](/docs/reference/module_composition/)

## Memory and ownership

- [Checked references](/docs/reference/checked_references/) and [checked slices](/docs/reference/checked_slices/)
- [Ownership contracts](/docs/reference/ownership_contracts/)
- [Definite assignment](/docs/reference/definite_assignment/)
- [Raw allocation](/docs/reference/raw_allocation/) and [unsafe pointers](/docs/reference/unsafe_pointers/)
- [Memory model and remaining proposals](/docs/reference/memory_model/)

## Tooling and standard library

- [Bytes](/docs/reference/bytes/), [collections](/docs/reference/collections/), [text](/docs/reference/text/), and [formatting](/docs/reference/formatting/)
- [Filesystem and buffered I/O](/docs/reference/filesystem/), [paths](/docs/reference/path/), [networking](/docs/reference/network/), [OS APIs](/docs/reference/os/), and [child processes](/docs/reference/process/)
- [Encoding](/docs/reference/encoding/), [hashing](/docs/reference/hashing/), [cryptography](/docs/reference/cryptography/), and [randomness](/docs/reference/random/)
- [Math](/docs/reference/math/), [time](/docs/reference/time/), [memory helpers](/docs/reference/memory/), and [testing](/docs/reference/testing/)
- [Every exported module and top-level declaration](/docs/reference/standard_library/)

## Compiler internals

Implementation references cover [semantic analysis](/docs/reference/semantic_analysis/), [typed lowering IR](/docs/reference/typed_lowering_ir/), [LLVM code generation](/docs/reference/llvm_codegen/), [native code generation](/docs/reference/native_codegen/), and the [runtime ABI](/docs/reference/runtime_abi/).

## Current milestone and history

- [Flecha v0.3 release contract](/docs/reference/release_0_3/)
- [Changelog and current development](/docs/reference/changelog/)
- [Tagged releases](/releases/)
