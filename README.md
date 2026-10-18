# flecha-lang.org

The official website and documentation portal for the [Flecha programming language](https://github.com/segfaultcafe/flecha).

Built with Astro and Starlight, and deployed as static assets on Cloudflare Workers.

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

## License

[MIT](LICENSE)
