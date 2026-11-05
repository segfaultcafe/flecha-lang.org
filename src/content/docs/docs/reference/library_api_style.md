---
title: "Flecha built-in and library API style"
description: "These rules govern APIs supplied to Flecha programs by the language and its libraries: primitive members, compiler built-ins, the runtime-facing prelude, and…"
editUrl: https://github.com/segfaultcafe/flecha/edit/master/docs/library_api_style.md
---
These rules govern APIs supplied to Flecha programs by the language and its
libraries: primitive members, compiler built-ins, the runtime-facing prelude,
and the standard library. The complete v0.3 surface is recorded in the
[standard-library reference](/docs/reference/standard_library/). These rules do not govern
ordinary user-defined Flecha functions, and they do not replace the C++
implementation rules in
[`CODE_STYLE.md`](https://github.com/segfaultcafe/flecha/blob/master/CODE_STYLE.md).

For Flecha source formatting in `std/`, also follow the
[standard-library development guidelines](/docs/reference/std_development/).

## Member functions

Member functions use `camelCase`:

```flecha
text.len();
text.at(0);
text.substr(0, 3);
text.startsWith("fl");
text.string();
text.cast<string>;
owned.cast<stringv>;
```

An acronym is treated as a word, such as `isUtf8()` rather than `isUTF8()`.
Generic member forms such as `cast<type>` follow the same naming rule even
when their syntax does not include parentheses.
The checked-in v0.3 API reference records the compatibility baseline. Renaming
an existing public member now requires compatibility review and release notes.

When a text-oriented destination accepts both strings and raw byte slices,
the concise operation name is reserved for text: use `write(stringv)` and
`writeAll(stringv)`. Name the raw variants `writeBytes([]const u8)` and
`writeAllBytes([]const u8)` instead of adding `String` to the text operation.
New APIs follow this convention. Changing a listed v0.3 API requires the same
compatibility review as any other public rename.

## Free functions

Built-in and standard-library free functions use `snake_case`:

```flecha
stdoutln("ready");
stderrln("failed");
stdin("value: ", &value);
fmt::printf("{} files", count);
fmt::sprintf("{}:{}", line, column);
read_line();
parse_i32("42");
string_from_bytes(data);
```

Single-word names naturally remain lowercase, including `stdout`, `stdoutln`,
`stderr`, `stderrln`, `stdin`, and `stdinln`. Naming rules for ordinary user-defined Flecha
functions are a separate language-design decision.

Compiler intrinsics and exported runtime C symbols are implementation details.
Their names may follow ABI-specific conventions, such as the existing
`flecha_runtime_v1_` snake-case prefix, without exposing those names as the
idiomatic Flecha API.

Small cross-cutting facades may live directly under `std`. Formatting is
`std::fmt`, while resource-specific stream operations remain under `std::io`.
