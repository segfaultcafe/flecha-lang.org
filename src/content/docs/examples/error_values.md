---
title: "Error Values example"
description: "Learn error values in Flecha with a complete source example you can inspect and run."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/error_values.fl
---

[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/error_values.fl)

```flecha title="error_values.fl"
error MathError {
    DivisionByZero,
    Overflow,
}

error InputError {
    InvalidDigit,
}

(i32, MathError) divide(i32 numerator, i32 denominator) {
    if denominator == 0 {
        return (0, MathError.DivisionByZero);
    }
    return (numerator / denominator, none);
}

// A named error widens to error, including inside returned tuples.
(i32, error) calculate(i32 numerator, i32 denominator) {
    return divide(numerator, denominator);
}

i32 main() {
    quotient, err := divide(84, 2);
    if err != none { return 1; }

    i32 unused, error failure = calculate(1, 0);
    if failure != MathError.DivisionByZero { return 2; }

    // One generic variable can hold failures from different families.
    failure = InputError.InvalidDigit;
    if failure == MathError.DivisionByZero { return 3; }

    // Success is explicit; uninitialized error variables cannot be read.
    MathError success = none;
    failure = success;
    if failure != none { return 4; }

    const MathError fixed = MathError.Overflow;
    MathError first, second = (fixed, success);
    if first != MathError.Overflow or second != none { return 5; }

    return quotient; // 42
}
```
