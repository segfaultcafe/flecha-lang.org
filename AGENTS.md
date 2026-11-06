## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Documentation editorial standard (Vulkan standard)

This is the normative documentation standard for every agent and every new or
modified page in this repository. The Khronos Vulkan Tutorial is the structural
and editorial reference: follow its technical clarity and causal progression,
but write in Flecha's own voice and never copy Khronos text.

- Write a human technical narrative. Establish the current state and the real
  problem before presenting a solution.
- Explain the purpose of a concept before introducing its syntax or API. Each
  change must follow causally from the limitation observed in the previous state.
- Use the smallest change that solves the stated problem. Explain relevant design
  decisions, consequences, tradeoffs, and limits between snippets; do not publish
  a code dump with only transitional headings.
- Connect each tutorial page to the preceding state and prepare the next state.
  A page must work in sequence and remain useful as a standalone explanation or
  reference entry. State material that is deliberately out of scope.
- Make the complete tested source available. Every snippet presented as a
  copyable program must be the exact text compiled or checked by automation.
  Partial code must be labeled `excerpt`/`trecho`, include its file and line
  context, and appear with the complete tested source on the same page.
- Commands, stdout, stderr, and exit status must be real results from committed
  fixtures or named source. Never invent code or output for presentation.
- Follow the visual and code-example structure established by
  `src/content/docs/tutorials/beginner/hello-archer.md` and its PT-BR equivalent:
  short context, file name, existing syntax-highlighted code, exact command,
  exact output when useful, and concise explanation. Preserve the existing
  Starlight design system. Do not add promotional cards, badges, banners, labels,
  slogans, course-marketing copy, or artificial calls to action. Do not add local
  or global presentation CSS unless the user explicitly requests a design change.
- `we`, `let's`, and `you` are acceptable when they make technical prose natural.
  They must not turn the documentation into marketing or manufactured enthusiasm.

### Required review checklist

Before opening or updating a documentation pull request, verify and report:

- [ ] The page states its context and problem before its solution.
- [ ] Concepts are motivated before syntax, with decisions and tradeoffs explained.
- [ ] Prose connects snippets and identifies relevant limits or out-of-scope work.
- [ ] Complete source is available; every copyable snippet is the exact validated
      source, and every partial snippet is explicitly labeled as an excerpt.
- [ ] Documented commands and outputs were reproduced from committed fixtures.
- [ ] EN and PT-BR pages have equivalent technical content and navigation.
- [ ] The existing design system is unchanged and no promotional presentation was
      introduced.
- [ ] `npm run check:editorial`, curriculum qualification, site build, and link
      validation pass. Include the exact commands and results in the pull request.
