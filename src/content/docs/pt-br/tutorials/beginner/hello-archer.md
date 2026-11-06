---
title: '1. Olá, Arqueiro!'
description: Instale o toolchain v0.3.1, crie um projeto Longbow e compile e execute seu primeiro programa Flecha.
---

**Pré-requisito:** [instale Flecha v0.3.1](/pt-br/install/) e confirme que
`flecha --version` e `longbow --version` mostram `0.3.1`.

Crie um projeto:

```sh test="hello-archer"
longbow new hello-archer
cd hello-archer
```

Substitua `src/main.fl` pelo código testado abaixo:

```flecha title="src/main.fl" test="hello-archer"
module main;

@imports
    :: lib::std::fmt;

i32 main() {
    fmt::println("Hello, Archer!");
    return 0;
}
```

Verifique os tipos antes de compilar e execute pelo Longbow:

```sh test="hello-archer"
longbow check
longbow run
```

A saída exata é:

```text test="hello-archer"
Hello, Archer!
```

`module main;` declara o módulo lógico. `@imports` disponibiliza o formatador da
biblioteca padrão. `i32 main()` sem parâmetros é o ponto de entrada, e zero
informa sucesso ao sistema.

## O que aprender a seguir

- [Crie um aplicativo de linha de comando](/pt-br/tutorials/beginner/command-line-app/)
- [Comandos do compilador — referência em inglês](/docs/reference/compiler/)
- [Fluxo de projetos Longbow — referência em inglês](/docs/reference/longbow/)

