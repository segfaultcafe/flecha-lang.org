---
title: '4. Containment, review, and testing'
description: Review each unsafe proof, exercise its failure surface, and prevent raw invariants from escaping into ordinary code.
---

Review unsafe code by invariant, not by line count. For every raw access, name
who established address validity, size, alignment, initialization, aliasing,
mutability, and lifetime. For every allocation, name the single cleanup owner
and what happens on every earlier failure. For every native call, name the ABI
source and supported targets.

Test the safe wrapper at zero, one, boundary, and invalid sizes; null and empty
inputs; repeated calls; injected allocation failure where supported; and cleanup
after partial progress. Run compiler sanitizers for the compiler itself and
native sanitizers for C/C++ fixtures, while remembering that a passing sanitizer
run is evidence, not a proof.

Keep the unsafe module private, expose typed operations, document the invariant
next to the boundary, and require focused review for changes. If a later safe
feature or library wrapper can express the operation, delete the unsafe path.

## Curriculum complete

Use [examples](/examples/) for complete applications and the [reference
documentation](/docs/) for precise contracts. Neither adds an accidental Next
step to this learning sequence.

