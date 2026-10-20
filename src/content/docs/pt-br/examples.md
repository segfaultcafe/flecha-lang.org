---
title: Exemplos
description: Catálogo completo de programas Flecha sincronizados do repositório do compilador.
---

Estes 34 exemplos vêm diretamente de [`segfaultcafe/flecha`](https://github.com/segfaultcafe/flecha/tree/master/examples). O código e os identificadores permanecem iguais ao original; as páginas individuais estão em inglês.

## Linguagem e fluxo de controle

- [Factorial](/examples/factorial/)
- [Stdout](/examples/stdout/)
- [Native Functions](/examples/native_functions/)
- [Numeric Casts](/examples/numeric_casts/)
- [Structures](/examples/structures/)
- [Tuples](/examples/tuples/)
- [Const Declarations](/examples/const_declarations/)
- [If Also](/examples/if_also/)
- [While Also](/examples/while_also/)
- [Iteration](/examples/iteration/)
- [Loop Control](/examples/loop_control/)
- [Fixed Arrays](/examples/fixed_arrays/)
- [String View](/examples/string_view/)
- [Error Values](/examples/error_values/)
- [Defer](/examples/defer/)
- [Callables](/examples/callables/)

## Memória e propriedade

- [Checked References](/examples/checked_references/)
- [Checked Slices](/examples/checked_slices/)
- [Ref And Slice Returns](/examples/ref_and_slice_returns/)
- [Ownership Contracts](/examples/ownership_contracts/)
- [Raw Allocation](/examples/raw_allocation/)
- [Unsafe Pointers](/examples/unsafe_pointers/)
- [Memory Tracking](/examples/memory_tracking/)

## Biblioteca padrão e compilação

- [Standard library modules](/examples/standard-library/)
- [Generic dynamic array](/examples/dynamic-array/)
- [LLVM IR proof of concept](/examples/llvm_poc/)

## Diagnósticos do compilador

- [Invalids](/examples/invalids/)
- [Checked References](/examples/diagnostics/checked_references/)
- [Checked Slices](/examples/diagnostics/checked_slices/)
- [Compound Types](/examples/diagnostics/compound_types/)
- [Const Declarations](/examples/diagnostics/const_declarations/)
- [Fixed Arrays](/examples/diagnostics/fixed_arrays/)
- [Iteration](/examples/diagnostics/iteration/)
- [Unsafe Pointers](/examples/diagnostics/unsafe_pointers/)

## Executar um exemplo

```sh
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
```
