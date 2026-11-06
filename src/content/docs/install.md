---
title: Install Flecha
description: Download Flecha 0.3.1 or build the compiler and Longbow project tool from source.
---

Flecha is early-stage software. Use a tagged platform archive for a repeatable
toolchain or build `master` when you intentionally want unreleased development
behavior.

[Download Flecha v0.3.1 for Linux, Windows, or macOS](https://github.com/segfaultcafe/flecha/releases/tag/v0.3.1). The release includes checksums, the compiler, Longbow, the runtime and standard library, Neovim support, and a VS Code extension. Read the [v0.3.1 JSON slice bug-fix notes](/docs/reference/release_0_3_1/); projects already using v0.3.0 need no source changes for owning-slice JSON fields.

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
The Windows archive targets MSYS2 UCRT64 with Clang and the MinGW ABI. Native
MSVC is not supported in 0.3.1.

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
build/flecha check examples/hello.fl
build/flecha build examples/hello.fl -o build/hello
./build/hello
```

The example prints `Flecha v0.3: 42`.

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
or begin with [Hello, Archer!](/tutorials/beginner/hello-archer/).
