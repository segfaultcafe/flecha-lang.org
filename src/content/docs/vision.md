---
title: Flecha 1.0 (and beyond)
description: The direction toward a self-hosted, performant Flecha 1.0—and the possibilities that may follow it.
---

Flecha is being built to become a practical native systems language that can
eventually carry its own implementation. The work before 1.0 develops the
language, compiler, runtime, tooling, standard library, and broader library
ecosystem together.

:::note[A direction, not a frozen checklist]
This page explains where Flecha is heading, not every step it must take. The
language is still learning from its own implementation. Features may be added,
replaced, reordered, or removed as real programs reveal better designs.
Individual release milestones define concrete commitments; this vision does
not assign every idea to a version in advance.
:::

## Why the foundations matter

The current work on ownership, bytes, strings, containers, encoding, streams,
files, and buffering is deliberately composable:

```text
ownership and memory
        |
bytes, strings, containers, and allocation
        |
encoding, streams, files, and buffering
        |
   +----+----------------+----------------+
   |                     |                |
data formats          networking     compiler infrastructure
JSON and XML          sockets        source loading
Base64                HTTP           diagnostics
serialization         WebSocket      caches and artifacts
                      gRPC
```

A buffered reader is not only a file convenience. It can become the shared
incremental-input layer for parsers, protocols, compiler source loading, and
future asynchronous adapters. Flecha is building a small number of trustworthy
foundations that can unlock many independent libraries.

## Directions on the way to 1.0

These directions can overlap, and their exact release boundaries remain open.

### Data and interchange

Flecha should support efficient streaming implementations of Base64, JSON,
XML, and other serialization formats. That requires mature byte and text APIs,
buffered I/O, Unicode, numeric conversion, builders, collections, and
structured errors.

Some formats may belong in the standard library and others may remain
companion packages. The important test is whether Flecha makes them safe,
natural, and efficient to implement.

### Security and cryptography

Real programs need secure randomness, hashing, authentication, encryption,
TLS, constant-time operations, and careful key handling. Flecha should be able
to integrate established cryptographic implementations and wrap them in safe
APIs. The project will favor reviewed algorithms, published vectors, and
proven providers rather than inventing new cryptography.

### Networking and async I/O

Blocking sockets, DNS, timeouts, and stream adapters can enable useful TCP and
UDP programs before async exists. Basic HTTP and WebSocket implementations can
grow on those foundations. Async I/O can later provide scalable transport
without forcing protocol parsing and framing to be rewritten.

HTTP/2 and gRPC may follow. They bring further dependencies—including Protocol
Buffers, TLS, streaming, cancellation, deadlines, code generation, and a
capable async runtime. This is a direction, not a promise that every layer will
live in `std` or arrive in a predetermined release.

### Native systems integration

Flecha should be able to bind directly to demanding native APIs such as Vulkan
and ImGui, and it may eventually support native GUI libraries of its own. This
work exercises ABI compatibility, explicit layout and alignment, raw pointers,
unions, callbacks, linking, build integration, and ownership across foreign
boundaries.

Graphics and GUI libraries do not have to become part of the standard library.
They are proof that Flecha can express serious low-level integration without a
C++ wrapper making the difficult parts possible.

### Metaprogramming

Large native APIs and schema-driven protocols need more than handwritten
boilerplate. Flecha is expected to explore macros and other compile-time tools
for hygienic generation, serialization, derived operations, FFI bindings, and
protocol-generated types.

The exact design remains open. Declarative macros, compile-time functions,
reflection, derives, or a combination should be judged by the programs they
enable and by how understandable the resulting code remains.

## What v1.0 means

Flecha reaches v1.0 when it no longer depends on another implementation
language for its ordinary continued development.

The v1.0 compiler will be written in Flecha, compile the language and its
libraries, and be capable of compiling itself. The current compiler, written
in C++, becomes the legacy v0 bootstrap implementation:

```text
legacy v0 compiler
        |
        v
stage-1 compiler written in Flecha
        |
        v
stage-2 compiler built by Flecha itself
```

Stage 1 must successfully build stage 2, and the resulting compilers must be
reproducible or demonstrably equivalent. The language and library suites must
pass through the self-hosted toolchain. Once that path is trusted, v0 should no
longer be required for ordinary development or releases.

Self-hosting alone is not enough. The self-hosted compiler and the programs it
generates should be in the same performance class as equivalent native C++
implementations. This will be treated as an engineering target with explicit
benchmarks, not as a claim that every possible program will perform
identically. Measurements should include:

- generated-program execution time and memory use;
- compiler execution time and peak memory;
- compilation scalability;
- generated binary size; and
- the runtime cost of ownership and high-level abstractions.

Flecha v1.0 is not simply the release where the syntax is declared finished.
It is the point where Flecha can carry its own weight: implemented in itself,
capable of building real native systems, supported by the libraries its
toolchain needs, and performant enough that rewriting it in C++ would provide
no fundamental advantage.

That destination is clear, but the route is allowed to improve. Reaching it
may require capabilities not listed today, and experience may show that some
current ideas should take a different form.

## And beyond

Self-hosting is a beginning, not an endpoint. These are possibilities, not a
fixed definition of v2.0:

- a broader self-hosted developer platform with a formatter, language server,
  debugger integration, profiler, package ecosystem, and documentation tools;
- deeper compiler independence through incremental compilation, more native
  backends, stronger optimization, and perhaps more of the linker and
  toolchain implemented in Flecha;
- native graphics, GPU compute, audio, windowing, input, and ergonomic GUI
  libraries built over APIs such as Vulkan;
- a mature service ecosystem with async applications, secure transports,
  HTTP, WebSocket, gRPC, observability, and distributed-systems libraries;
- embedded and bare-metal systems, operating-system components, WebAssembly,
  and other constrained or heterogeneous targets; and
- stronger correctness tools for ownership, concurrency, unsafe boundaries,
  reproducibility, and machine-checkable contracts.

Flecha v2.0, if and when it exists, should be defined by what the project
learns while building and using v1.x—not by locking today's guesses into
tomorrow's language.

For the detailed project version of this direction, read the
[vision document in the Flecha repository](https://github.com/segfaultcafe/flecha/blob/master/docs/vision.md).
