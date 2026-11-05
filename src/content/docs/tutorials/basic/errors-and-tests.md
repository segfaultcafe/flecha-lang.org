---
title: '3. Errors and tests'
description: Return explicit error values, keep success data separate, and verify public behavior with Longbow.
---

Expected failures are values. Define an `error` family, return it beside any
success value, and inspect it before consuming the result. Reserve crashable
operations for contexts where termination is the declared policy; do not hide
ordinary I/O, parsing, or allocation failure.

Tests live in paired `_test.fl` modules and receive a
`testing::UnitTest`. Arrange inputs, call the exported behavior, and assert on
both the result and its error. `longbow test` compiles the same module graph as
the application and returns nonzero when any test fails.

Use [error values](/docs/reference/error_values/) for the value model,
[crashable functions](/docs/reference/crashable_functions/) for the explicit
termination boundary, and [testing](/docs/reference/testing/) for assertions
and runner behavior.

## What to learn next

- [Project: a tested scorecard](/tutorials/basic/project/)
- [Error-value example](/examples/error_values/)
- [Testing reference](/docs/reference/testing/)

