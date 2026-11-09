---
title: Instalar a Flecha
description: Baixe a Flecha 0.3.2 e o flecha-lsp 0.1.0 ou compile o toolchain a partir do código-fonte.
---

Flecha é um software em estágio inicial. Use um arquivo de versão marcada
para um toolchain reproduzível ou compile `master` quando quiser explicitamente
comportamento de desenvolvimento ainda não lançado.

[Baixe a Flecha v0.3.2 para Linux, Windows ou macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.3.2). A versão inclui checksums, o compilador, Longbow, runtime e biblioteca padrão, suporte ao Neovim e uma extensão para VS Code. Leia as [notas da versão 0.3.2 — em inglês](/docs/reference/release_0_3_2/) para conhecer o protocolo de análise e as correções.

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
é compatível com a versão 0.3.2.

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
build/flecha check examples/hello.fl
build/flecha build examples/hello.fl -o build/hello
./build/hello
```

O exemplo imprime `Flecha v0.3: 42`. Adicione o diretório `build` absoluto ao
`PATH` para seguir os tutoriais e confirme que `flecha --version` e
`longbow --version` mostram a mesma versão.

## Suporte a editores

A Flecha 0.3.2 contém o analisador usado para diagnósticos ao vivo. Instale
também o
[`flecha-lsp` v0.1.0](https://github.com/segfaultcafe/flecha-lsp/releases/tag/v0.1.0)
e deixe `flecha-lsp` e `flecha` no `PATH` recebido pelo editor.

A extensão `flecha-language-0.3.2.vsix` inicia o servidor no VS Code. O arquivo
do compilador também contém o plugin de runtime do Neovim; no Neovim 0.11, o
cliente LSP nativo pode iniciar `flecha-lsp`. O servidor atual publica
diagnósticos sintáticos e semânticos para buffers salvos ou ainda não salvos.
Completion, hover, navegação, rename e formatação ainda não foram implementados.

Consulte o [guia de editores e do language server — em inglês](/docs/reference/editors/)
para verificar os arquivos e configurar o editor. Depois, continue em
[Aprender Flecha](/pt-br/learn/).
