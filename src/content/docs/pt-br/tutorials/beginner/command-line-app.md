---
title: '2. Crie um aplicativo de linha de comando'
description: Amplie o projeto Archer com argumentos, diagnósticos determinísticos e códigos de saída estáveis.
---

Crie o próximo projeto da história Archer:

```sh test="archer-cli"
longbow new archer-greet
cd archer-greet
```

Seu único comando aceita um nome. Assim o parsing fica no ponto de entrada, e
cada resultado pode ser observado por stdout, stderr e pelo status de saída.

```flecha title="src/main.fl" test="archer-cli"
module main;

@imports
    :: lib::std::fmt
    :: lib::std::os::arguments;

i32 main() {
    values, captureError := arguments::capture();
    if captureError != none {
        fmt::eprintln("archer-greet: cannot capture arguments");
        return 3;
    }
    if values.len() != 2 {
        fmt::eprintln("usage: archer-greet <name>");
        return 2;
    }
    fmt::println("Welcome, ", values[1].view(), "!");
    return 0;
}
```

```sh test="archer-cli"
longbow check
longbow run -- Fauna
```

```text test="archer-cli"
Welcome, Fauna!
```

Longbow encaminha os valores depois de `--` sem invocar um shell e devolve o
status do programa. A fixture também executa sem nome e verifica o status `2`
e o diagnóstico de uso exato.

## O que aprender a seguir

- [Crie e publique um pacote](/pt-br/tutorials/beginner/publish-package/)
- [Argumentos e ambiente — referência em inglês](/docs/reference/os/)
- [Formatação e diagnósticos — referência em inglês](/docs/reference/formatting/)

