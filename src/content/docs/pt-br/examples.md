---
title: Exemplos
description: Programas Flecha executáveis sincronizados do repositório do compilador.
---

Os exemplos vêm diretamente de [`segfaultcafe/flecha`](https://github.com/segfaultcafe/flecha/tree/master/examples). O código e os identificadores permanecem iguais ao original; as páginas individuais ainda estão em inglês.

## Ordem sugerida

1. [Factorial](/examples/factorial/)
2. [Structures](/examples/structures/)
3. [Iteration](/examples/iteration/)
4. [Fixed arrays](/examples/fixed_arrays/)
5. [Error values](/examples/error_values/)
6. [Checked references](/examples/checked_references/)
7. [Callable values and closures](/examples/callables/)
8. [Standard-library modules and callback algorithms](/examples/standard-library/)
9. [Generic dynamic arrays](/examples/dynamic-array/)
10. [Ownership contracts](/examples/ownership_contracts/)
11. [Raw allocation](/examples/raw_allocation/)

## Executar um exemplo

```sh
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
```
