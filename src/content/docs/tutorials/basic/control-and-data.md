---
title: '2. Control flow and compound data'
description: Organize decisions and iteration around arrays, slices, strings, structures, and enums.
---

Use `if` for decisions, `while` when continuation is state-dependent, and
`for (_, value) := range values` to traverse a sequence. Flecha evaluates
conditions as booleans; it does not treat arbitrary integers as truth values.

Fixed arrays own inline elements. Checked slices borrow a range and retain its
length for bounds checks. `string` owns text while `stringv` is a borrowed
view. Structures group fields and lifecycle behavior; enums define a closed
family of named values. Choose the smallest representation that describes the
lifetime you need, then convert explicitly at the boundary.

Work through [fixed arrays](/docs/reference/fixed_arrays/), [checked
slices](/docs/reference/checked_slices/), [strings](/docs/reference/string/),
[structures](/docs/reference/structures/), and [enums](/docs/reference/enums/).
Those references are contracts, not extra curriculum steps.

## What to learn next

- [Errors and tests](/tutorials/basic/errors-and-tests/)
- [Iteration](/docs/reference/iteration/)
- [Enum matching](/docs/reference/match/)

