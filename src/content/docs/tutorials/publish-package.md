---
title: Create and ship a Flecha package
description: Build, test, publish, consume, lock, cache, and yank an immutable Flecha v0.3 source package with Longbow.
---

Flecha v0.3 packages are versioned source snapshots. Git remains the development
home; the public registry stores the immutable bytes that consumers resolve,
verify, cache, and rebuild. The compiler never performs network access—Longbow
owns resolution and acquisition.

:::caution[Development contract]
The public package workflow belongs to the developing v0.3 toolchain. Use a
matching `flecha` and `longbow`, and do not publish a real version until its API,
manifest, license, and source archive are ready. A published version cannot be
replaced.
:::

## 1. Create a library

```sh
longbow new arrows --lib
cd arrows
```

For a package owned by `your-name`, make the manifest explicit:

```toml title="longbow.toml"
[package]
name = "arrows"
registry = "your-name/arrows"
version = "0.1.0"
kind = "library"

[dependencies]
```

The registry identity is always lowercase `owner/package`. It is publication
metadata, not an import path. The generated entry module follows the normalized
project name:

```flecha title="src/arrows.fl"
module arrows;

export i32 double(i32 value) {
    return value * 2;
}
```

Once v0.3.0 is tagged, a package that intentionally targets only the v0.3
contract should also declare:

```toml
flecha = ">=0.3.0, <0.4.0"
```

Untagged `master` builds currently report a development version based on the
latest tag, so that future release range can reject a pre-release local smoke
test. Do not publish without the compatibility range you intend to support.

## 2. Test and build it

Create a paired test module:

```flecha title="src/arrows_test.fl"
module arrows_test;

@imports
    :: root::arrows
    :: lib::std::tests::asserts
    :: lib::std::tests::testing;

test doubles_values(&testing::UnitTest t) {
    i32 expected = 42;
    actual := arrows::double(21);
    asserts::equal<i32>(t, &expected, &actual, "double returns twice the input");
}
```

```sh
longbow check
longbow test
longbow build
longbow publish --dry-run
```

The dry run validates the manifest and prints the normalized archive contents
and SHA-256 checksum without uploading anything. A v0.3 registry archive may
contain `longbow.toml`, `src/**/*.fl`, `README.md`, and root `LICENSE*` files.
Version-control data, build output, lock state, symlinks, native inputs, and
unsupported files are excluded or rejected.

## 3. Authenticate and publish

```sh
longbow login
longbow whoami
longbow publish
```

`login` opens the registry's device authorization flow. Sign in with GitHub or
Google, approve the displayed code, and Longbow stores a revocable Flecha
registry credential with owner-only permissions. Provider tokens are never
used as package credentials.

CI can supply `LONGBOW_TOKEN` directly or point `LONGBOW_TOKEN_FILE` at a
managed credential. Never commit either value. `longbow publish` uploads the
exact normalized archive. The registry verifies the checksum and owner role,
then makes the `owner/package/version` tuple immutable.

If the API changes, increment `version` and publish a new version. Do not try to
overwrite `0.1.0`.

## 4. Consume it through a local alias

Create an application outside the library tree:

```sh
longbow new arrow-demo
cd arrow-demo
longbow add your-name/arrows@^0.1.0 --as arrows
```

The dependency key is chosen by the consumer and becomes the import alias:

```toml
[dependencies]
arrows = { package = "your-name/arrows", version = "^0.1.0" }
```

```flecha title="src/main.fl"
module main;

@imports
    :: lib::arrows::arrows
    :: lib::std::fmt;

i32 main() {
    fmt::println(arrows::double(21));
    return 0;
}
```

```sh
longbow run
```

Canonical registry identities never leak into Flecha module paths. A project
can select a short alias, rename a dependency, or use two differently named
aliases for packages with similar module names.

## 5. Lock and reproduce the graph

Resolution writes `longbow.lock` with exact package identities, selected
versions, sources, package-local dependency edges, Flecha compatibility ranges,
and SHA-256 checksums. Commit the lockfile for applications. Libraries may
commit it for reproducible development and tests, but consumers resolve from
the published manifest requirements rather than a library's development lock.

```sh
longbow fetch
longbow check
longbow test
```

Longbow verifies archives before extraction and rehashes cached source before
reuse. With an unchanged lock and a populated verified cache, subsequent builds
reuse the exact package bytes and do not need the source Git repository. Set
`LONGBOW_CACHE_DIR` to an explicit cache root in CI or managed installations.
The cache is disposable; `longbow.lock` and immutable registry storage are the
authoritative state.

Use `longbow update` to re-resolve all registry requirements or
`longbow update arrows` to move one alias within its declared requirement.
`longbow add owner/package@latest` is shorthand for the stable `*` requirement;
the lockfile still records one exact version and checksum.

## 6. Yank a bad release

```sh
longbow yank 0.1.0
```

Yanking prevents new unlocked resolutions from selecting that version. It does
not delete or mutate the archive: existing lockfiles may continue downloading
and building the exact recorded checksum. Publish a corrected version and let
consumers update deliberately.

Use `longbow logout` to revoke and remove the active local credential.

## Local development before publishing

Consumers can use a path dependency while both projects are under development:

```toml
[dependencies]
arrows = { path = "../arrows" }
```

A publishable dependency may combine its registry requirement with a development
path override. Publication records the registry requirement and never embeds the
author's local path. Git dependencies are also supported, but v0.3 requires an
exact commit revision; floating branches and tags are rejected.

Read the [complete package ecosystem contract](/docs/reference/package_ecosystem/)
and the [Longbow command reference](/docs/reference/longbow/) before maintaining
a public package.
