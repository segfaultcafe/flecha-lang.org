---
title: "Flecha 0.1.2"
description: "Flecha 0.1.2 is a patch release correcting zero-construction triviality."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/CHANGELOG.md
---
Flecha 0.1.2 is a patch release correcting zero-construction triviality.

### Fixed

- Explicit `zero()` overrides that only construct canonical zero values are
  recognized as trivial, including through generic and nested structures.
