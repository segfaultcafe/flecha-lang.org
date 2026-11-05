---
title: "Standard-library public API tests"
description: "Compile and execute the public standard-library qualification fixture through Flecha tests."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/standard_library/src/public_api_test.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/standard_library/src/public_api_test.fl)

```flecha title="standard_library/src/public_api_test.fl"
module public_api_test;

@imports
    :: root::public_api
    :: lib::std::cryptography::sha2
    :: lib::std::encoding::hex
    :: lib::std::tests::asserts
    :: lib::std::tests::testing;

test documented_digest_is_stable(&testing::UnitTest t) {
    digest, digestError := sha2::sha256("Flecha");
    asserts::is_true(
        t,
        digestError == none,
        "SHA-256 accepts the documented input"
    );
    if digestError != none {
        return;
    }

    encoded, encodingError := hex::encode_bytes(digest.bytes());
    asserts::is_true(
        t,
        encodingError == none,
        "hexadecimal encoding succeeds"
    );
    if encodingError != none {
        return;
    }
    asserts::string_equal(
        t,
        encoded.view(),
        public_api::expected_digest(),
        "the documented digest is platform independent"
    );
}
```
