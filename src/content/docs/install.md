---
title: Install Flecha
description: Build the Flecha compiler and Longbow project tool from source.
---

Flecha is early-stage software. Use a tagged platform archive for a repeatable
toolchain or build `master` when you intentionally want the developing v0.3
contract documented on this site.

[Download Flecha v0.2.5 for Linux, Windows, or macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.5). Every release includes checksums, the compiler, Longbow, the runtime and standard library, Neovim support, and a VS Code extension.

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

The build writes the compiler to `build/flecha` and the project/package tool to
`build/longbow`. Keep the two binaries from the same build.

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

## Put the development tools on PATH

For the tutorials, either install the build with the repository's CMake install
target or add the absolute `build` directory to your current shell's `PATH`.
Verify that both tools report the same version:

```sh
flecha --version
longbow --version
longbow new hello
cd hello
longbow check
longbow run
```

Installed release bundles discover their matching runtime and standard library
after relocation. Longbow injects that standard library as `lib::std`; ordinary
projects do not configure a host-specific standard-library path.

## Editor support

GitHub Releases include a VS Code extension named `flecha-language-VERSION.vsix`. Release archives also bundle Neovim support. Follow the [editor installation guide](/docs/reference/editors/) for setup and verification.

Continue to [Learn Flecha](/learn/), browse the [runnable examples](/examples/),
or follow the [package publishing tutorial](/tutorials/publish-package/).
