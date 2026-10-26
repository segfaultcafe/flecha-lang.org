---
title: Instalar a Flecha
description: Compile o compilador Flecha e a ferramenta de projetos Longbow a partir do código-fonte.
---

Flecha é um software em estágio inicial. Atualmente, a instalação mais confiável é a compilação a partir do código-fonte; versões marcadas também publicam arquivos por plataforma e pacotes para editores.

[Baixe a Flecha v0.2.4 para Linux, Windows ou macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.4). Cada versão inclui checksums, o compilador, Longbow, runtime e biblioteca padrão, suporte ao Neovim e uma extensão para VS Code.

:::caution[Antes de começar]
A linguagem, a CLI do compilador e a ABI podem mudar entre versões. Use uma versão marcada quando precisar de um toolchain reproduzível.
:::

## Requisitos

- CMake 3.20 ou mais recente
- Ninja ou outro gerador do CMake
- Compilador C++23 compatível: Clang 17–23, GCC 13–16 ou Apple Clang 16–17
- Bibliotecas e ferramentas de desenvolvimento do LLVM 17–23
- Git

A [matriz de toolchains](/docs/reference/toolchains/) permanece em inglês enquanto a referência técnica é traduzida.

## Compilar do código-fonte

```sh
git clone https://github.com/segfaultcafe/flecha.git
cd flecha
make build
```

O compilador será criado em `build/flecha`, e a ferramenta de projetos em `build/longbow`.

```sh
cmake -S . -B build -G Ninja -DBUILD_TESTING=OFF
cmake --build build --parallel
```

## Verificar a instalação

```sh
build/flecha --version
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
```

O exemplo imprime `Factorial: 120`. Continue em [Aprender Flecha](/pt-br/learn/).
