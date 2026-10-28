# Flecha package registry

This Cloudflare Worker implements registry protocol v1 for Longbow. Metadata,
token scopes, release state, and audit subjects live in D1. Immutable package
archives are stored by SHA-256 in a private R2 bucket.

The service exposes:

```text
GET  /v1/packages/OWNER/PACKAGE/index
GET  /v1/packages/OWNER/PACKAGE/VERSION/archive
PUT  /v1/packages/OWNER/PACKAGE/VERSION/archive
POST /v1/packages/OWNER/PACKAGE/VERSION/yank
GET  /healthz
```

Published versions cannot be replaced. Yanking only changes index state, so an
existing Longbow lock can continue downloading the immutable archive.

## Local development

```sh
cd registry
npm ci
npm run check
npm test
npm run dev
```

Wrangler emulates D1 and R2 locally. Apply the migration to persistent local
state when exercising the development server manually:

```sh
npx wrangler d1 migrations apply flecha-registry --local
```

## Production deployment

Authenticate Wrangler with the Cloudflare account that owns
`flecha-lang.org`:

```sh
npx wrangler login
```

The `flecha-registry` D1 database is provisioned, its production identifier is
committed in `wrangler.jsonc`, and migration `0001_initial.sql` has been applied.

R2 must be enabled once in the Cloudflare dashboard before Wrangler can create
the archive bucket. After enabling it, create the private bucket; do not expose
an `r2.dev` URL:

```sh
npx wrangler r2 bucket create flecha-registry-archives
```

Apply any pending migrations and deploy:

```sh
npx wrangler d1 migrations apply flecha-registry --remote
npm run deploy
```

The `custom_domain` route makes the Worker the origin for
`registry.flecha-lang.org`; Cloudflare creates the DNS record and certificate.
No separate CNAME should exist for that hostname.

Verify the deployment:

```sh
curl --fail --show-error https://registry.flecha-lang.org/healthz
curl --fail --show-error https://registry.flecha-lang.org/v1
```

## Publishing tokens

Tokens are random bearer credentials stored only as SHA-256 hashes. Each token
is scoped to one owner and either one package or every package under that owner.
Generate a hash-only provisioning file locally:

```sh
npm run token:create -- \
  --owner flecha \
  --package '*' \
  --subject release-automation \
  --permissions publish,yank \
  --sql /tmp/flecha-registry-token.sql
```

The command prints the raw token once. Store it in a password manager or CI
secret as `LONGBOW_TOKEN`, then load only its hash into D1:

```sh
npx wrangler d1 execute flecha-registry \
  --remote \
  --file /tmp/flecha-registry-token.sql
```

Delete the temporary SQL file after applying it. Revoke a token by setting
`revoked_at = unixepoch()` for its hash in `registry_tokens`.

Use `--package package-name` for a package-specific token and
`--permissions publish` or `--permissions yank` for narrower authority.

## Operational properties

- Package identities, semantic versions, content types, sizes, and checksums
  are validated before storage.
- The Worker parses the source-only Flecha archive format and verifies that its
  normalized manifest identity and version match the request path.
- R2 keys are content-addressed; D1 publication rows are append-only.
- Public archive responses are immutable and cacheable. Index responses have a
  short cache lifetime so yanks propagate quickly.
- R2 is not exposed through an `r2.dev` URL.
- Mutation authorization is denied by default and uses package-scoped token
  rows. Raw tokens are never stored.

Cloudflare rate limiting and alerting should be enabled before announcing the
public service. Worker observability is enabled in `wrangler.jsonc`.
