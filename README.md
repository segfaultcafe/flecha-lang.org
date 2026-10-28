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

## Deployment

```sh
npm run build
npm run deploy
```

Registry provisioning and deployment are documented in
[`registry/README.md`](registry/README.md).

## License

[MIT](LICENSE)
