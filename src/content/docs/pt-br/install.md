---
title: Instalar a Flecha
description: Baixe a Flecha 0.3.0 ou compile o compilador e a ferramenta de projetos Longbow a partir do código-fonte.
---

Flecha é um software em estágio inicial. Use um arquivo de versão marcada
para um toolchain reproduzível ou compile `master` quando quiser explicitamente
comportamento de desenvolvimento ainda não lançado.

[Baixe a Flecha v0.3.0 para Linux, Windows ou macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.3.0). A versão inclui checksums, o compilador, Longbow, runtime e biblioteca padrão, suporte ao Neovim e uma extensão para VS Code. Leia as [notas de lançamento e atualização — em inglês](/docs/reference/release_0_3_0/) antes de migrar um projeto 0.2.x.

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
O arquivo para Windows usa MSYS2 UCRT64 com Clang e ABI MinGW. MSVC nativo não
é compatível com a versão 0.3.0.

## Compilar do código-fonte

```sh
git clone https://github.com/segfaultcafe/flecha.git
cd flecha
make build
```

O compilador será criado em `build/flecha`, e a ferramenta de projetos e
pacotes em `build/longbow`. Mantenha os dois binários da mesma compilação.

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

O exemplo imprime `Factorial: 120`. Adicione o diretório `build` absoluto ao
`PATH` para seguir os tutoriais e confirme que `flecha --version` e
`longbow --version` mostram a mesma versão. Continue em
[Aprender Flecha](/pt-br/learn/).
