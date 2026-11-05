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

The ordered learning path is defined once in
[`src/data/curriculum.mjs`](src/data/curriculum.mjs). It generates the tutorial
sidebar and Previous/Next links. Each route has matching English and Brazilian
Portuguese content. Standalone references and examples intentionally do not
render curriculum pagination.

## Validation

```sh
npm ci
npm run check
npm run check:curriculum -- --toolchain /path/to/flecha-0.3.0-Linux-x86_64
npm run build
npm run check:links
npx --no-install wrangler deploy --dry-run
```

`check:curriculum` compares every marked executable documentation block with a
curated fixture, then checks/builds/runs it through the official Flecha 0.3.0
compiler or Longbow. It asserts exact stdout, stderr, and exit status where the
tutorial documents them. `check:links` validates internal links, exact EN/PT
curriculum order, explicit onward recommendations, and the absence of
curriculum pagination on standalone pages. CI downloads the tagged Linux
toolchain and verifies it against the release `SHA256SUMS` before running the
same qualification.

## Deployment

```sh
npm run build
npm run deploy
```

Registry provisioning and deployment are documented in
[`registry/README.md`](registry/README.md).

## License

[MIT](LICENSE)
