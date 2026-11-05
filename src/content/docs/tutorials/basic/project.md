---
title: '4. Project: a tested scorecard'
description: Combine modules, fixed data, functions, explicit errors, and tests in one small application.
---

Build `archer-score`, a small program that totals three round scores and rejects
values outside the event's accepted range. Keep validation and total calculation
in `score.fl`, entry-point formatting in `main.fl`, and success plus failure
cases in `score_test.fl`.

Qualification is the project: `longbow check` must accept the complete graph,
`longbow test` must cover the boundary scores and one invalid score, and
`longbow run` must print one stable result. Change one invalid input and confirm
the program returns a documented nonzero status instead of silently clamping it.

This project is deliberately small enough to review in one sitting. Its value
is the separation of contracts: modules own names, functions own validation,
the entry point owns diagnostics, and tests own evidence.

## Track complete

Continue to [Intermediate: ownership, moves, and checked
borrows](/tutorials/intermediate/ownership-and-borrows/). Browse [complete
examples](/examples/) when you want more syntax in context.

