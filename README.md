# flecha-lang.org

The official website and documentation portal for the [Flecha programming language](https://github.com/segfaultcafe/flecha).

Built with Astro and Starlight, and deployed as static assets on Cloudflare Workers.

The repository also contains the independently deployed package registry Worker
under [`registry/`](registry/). It serves the Longbow registry protocol at
`registry.flecha-lang.org` using D1 for metadata and R2 for immutable archives.

## Development

```sh
npm install
FLECHA_SOURCE_DIR=../flecha npm run sync:content
npm run dev
```

The generated reference and example pages are committed so the website can deploy independently. Run `npm run sync:content` after the compiler documentation changes.

The main Beginner → Basic → Intermediate → Advanced → Unsafe learning path is
defined once in [`src/data/curriculum.mjs`](src/data/curriculum.mjs). The
independent seven-step ARROWFALL project tutorial is defined in
[`src/data/arrowfall.mjs`](src/data/arrowfall.mjs). The two series generate
separate sidebar and Previous/Next sequences and have matching English and
Brazilian Portuguese routes. ARROWFALL's frozen cumulative source projects live
in [`curriculum/arrowfall`](curriculum/arrowfall) at commit `56bb003`; concrete
main-track practice evidence lives in [`curriculum/main-evidence`](curriculum/main-evidence).
Standalone references and examples intentionally do not render pagination.

## Validation

```sh
npm ci
npm run check
npm run check:curriculum -- --toolchain /path/to/flecha-0.3.0-Linux-x86_64
npm run build
npm run check:links
npx --no-install wrangler deploy --dry-run
```

`check:curriculum` validates the original marked examples, 15 concrete
main-track practice checkpoints, and all seven ARROWFALL snapshots. With
`--toolchain`, it executes their documented Flecha/Longbow 0.3.0 checks,
builds, tests, and runs; compares exact output and exit status; and runs
ARROWFALL's final ANSI, seed, option, victory, and defeat golden campaign.
`check:links` validates internal links, both independent EN/PT Previous/Next
orders, explicit onward recommendations, and the absence of pagination on
standalone pages. CI downloads the tagged Linux toolchain and verifies it
against the release `SHA256SUMS` before running the same qualification.

## Deployment

```sh
npm run build
npm run deploy
```

Registry provisioning and deployment are documented in
[`registry/README.md`](registry/README.md).

## License

[MIT](LICENSE)
