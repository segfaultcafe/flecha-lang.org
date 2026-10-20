---
title: "Flecha 0.1.3"
description: "Flecha 0.1.3 is a patch release improving character-byte interoperability."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/CHANGELOG.md
---
Flecha 0.1.3 is a patch release improving character-byte interoperability.

### Fixed

- Character values convert implicitly to `u8`, and borrowed string data can be
  passed to compatible byte-pointer parameters at the external ABI boundary.
