---
title: Install Flecha
description: Build the Flecha compiler and Longbow project tool from source.
---

Flecha is early-stage software. The most dependable installation path is currently a source build; tagged releases also publish platform archives and editor packages.

[Download Flecha v0.2.4 for Linux, Windows, or macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.4). Every release includes checksums, the compiler, Longbow, the runtime and standard library, Neovim support, and a VS Code extension.

:::caution[Before you begin]
The language, compiler CLI, and ABI may change between releases. Use a tagged release when you need a repeatable toolchain.
:::

## Requirements

- CMake 3.20 or newer
- Ninja or another CMake generator
- A supported C++23 compiler: Clang 17–23, GCC 13–16, or Apple Clang 16–17
- LLVM 17–23 development libraries and tools
- Git

See the [supported toolchains](/docs/reference/toolchains/) for the tested platform matrix.

## Build from source

```sh
git clone https://github.com/segfaultcafe/flecha.git
cd flecha
make build
```

The build writes the compiler to `build/flecha` and the project tool to `build/longbow`.

```sh
cmake -S . -B build -G Ninja -DBUILD_TESTING=OFF
cmake --build build --parallel
```

## Verify the compiler

```sh
build/flecha --version
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
```

The example prints `Factorial: 120`.

## Editor support

GitHub Releases include a VS Code extension named `flecha-language-VERSION.vsix`. Release archives also bundle Neovim support. Follow the [editor installation guide](/docs/reference/editors/) for setup and verification.

Continue to [Learn Flecha](/learn/) or browse the [runnable examples](/examples/).
