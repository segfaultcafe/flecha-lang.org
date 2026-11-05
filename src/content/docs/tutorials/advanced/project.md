---
title: '4. Project: qualify a deterministic ledger'
description: Audit a larger application across canonical encoding, persistence, hashing, package, and failure boundaries.
---

The [deterministic ledger](/examples/ledger/src/main/) stores an append-only
SHA-256 chain in a canonical binary format. Its modules separate commands,
codec, storage, and model; golden-vector tests pin exact bytes.

Qualify it like release software. Build from a clean verified package cache,
run its tests, create and append records, and verify the file. Compare the same
fixture across two clean builds. Corrupt a length, payload, and digest one at a
time and confirm deterministic rejection without losing the original file.
Inspect the codec for fixed endianness and bounds, and the storage layer for
partial-read and allocation failure cleanup.

Finally, capture compiler, Longbow, target, commands, checksums, output, and
resource budgets in the evidence. The result is a reproducible qualification,
not “it worked once.”

## Track complete

Continue to [Unsafe: the unsafe boundary](/tutorials/unsafe/boundary/) only
when you need to implement a boundary safe Flecha cannot express.

