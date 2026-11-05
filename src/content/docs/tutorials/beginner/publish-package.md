---
title: '3. Create and publish a package'
description: Extract the Archer greeting into a tested source package and inspect publication without uploading.
---

Create a library:

```sh test="package-dry-run"
longbow new archer-words --lib
cd archer-words
```

Export a small function from its declared module, add a paired `_test.fl`
module, and run `longbow test`.
The [package ecosystem contract](/docs/reference/package_ecosystem/) explains
manifest identity, aliases, immutable versions, compatibility ranges, and
credentials in full.

Before any upload, qualify the exact archive:

```sh test="package-dry-run"
longbow check
longbow test
longbow build
longbow publish --dry-run
```

The dry run validates the manifest and reports normalized files and a SHA-256
checksum without contacting the registry. A real published version is
immutable. Increment the version for a correction; yank only to prevent new
unlocked resolutions from selecting a bad version.

Applications import a dependency through their local alias, such as
`lib::words::greeting`, rather than through its registry owner. Commit
`longbow.lock` for applications so CI resolves the same bytes.

## Track complete

You can now create, run, diagnose, and package a small application. Continue to
[Basic: modules, values, and functions](/tutorials/basic/modules-values-functions/).
Use [Longbow](/docs/reference/longbow/) as the command reference.

