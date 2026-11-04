# Flecha registry operations

This runbook defines the production controls and evidence required before the
public registry is treated as an available v0.3 service.

## Service boundaries

- `registry.flecha-lang.org` serves Registry Protocol v1.
- `packages.flecha-lang.org` serves browser sign-in, device approval, account
  management, and owner claiming.
- D1 stores identity, authorization, release metadata, and append-only audit
  events. R2 stores content-addressed immutable archives in a private bucket.
- GitHub authenticates the browser. Longbow receives a separate opaque token;
  only its SHA-256 digest is retained.

## Abuse and size limits

The Worker enforces these controls in addition to Cloudflare's platform limits:

- authentication and device endpoints: 30 requests per minute per hashed
  credential or connecting actor;
- publish, yank, and owner-claim mutations: 60 requests per minute per hashed
  credential or browser session;
- JSON authentication bodies: 16 KiB;
- normalized package archives: 16 MiB, 10,000 files, and 4,096 bytes per path;
- package indexes: 4 MiB or 100,000 releases;
- bearer credentials: 512 bytes;
- device and OAuth transactions: ten-minute expiry, one-time consumption, and
  increasing polling delay after a client exceeds the advertised interval.

Rate limits are deliberately approximate and per Cloudflare location. They
protect the service from ordinary abuse; authentication expiry, immutable
publication keys, checksums, and authorization remain the security boundary.

## Audit trail

Migration `0003_audit_log.sql` records owner claims, publication, yanking,
Longbow token issuance, and token revocation. Database triggers reject updates
or deletion from `registry_audit_events`. Each event records its actor and the
affected owner/package/version where applicable. Provider access tokens and
raw Flecha bearer tokens must never enter logs or audit details.

Review recent events without retrieving user email or bearer-token material:

```sh
npx wrangler d1 execute flecha-registry --remote --command \
  "SELECT occurred_at, action, actor, owner, package, version FROM registry_audit_events ORDER BY id DESC LIMIT 100"
```

## Monitoring and alerts

Worker observability is enabled in `wrangler.jsonc`. Production alerts should
page the maintainer for sustained 5xx responses, missing archive objects,
authentication-provider failures, D1/R2 errors, or a failed scheduled smoke
test. HTTP 404 and isolated 401/403 responses are expected. A sustained rise in
429 responses indicates abuse or a limit that needs review.

The minimum live checks are:

```sh
npm run smoke
npx wrangler deployments list
npx wrangler d1 migrations list flecha-registry --remote
```

When investigating a failure, use Workers Logs and Traces and correlate the
request time with append-only audit events. Never print `Authorization`,
`Cookie`, OAuth codes, session values, or raw token material.

## Backup and recovery

D1 Time Travel is always enabled on production databases. Before every schema
migration or manual data repair, record the current bookmark:

```sh
npx wrangler d1 info flecha-registry
npx wrangler d1 time-travel info flecha-registry
```

Export schema and data before release qualification and retain the encrypted
export outside the production account's failure domain:

```sh
npx wrangler d1 export flecha-registry --remote --output=/secure/path/flecha-registry.sql
```

Restoring D1 overwrites production and requires a maintenance window. Capture
the current bookmark first, stop mutations, restore to the reviewed timestamp
or bookmark, verify migrations and row counts, then run the read-only and
lifecycle smoke tests before reopening publication.

R2 objects are content-addressed and never deleted or replaced by the service.
R2 provides redundant durable storage, but release qualification must still
inventory object count/bytes and verify a sample against the checksum stored in
D1. A missing object is a release-blocking incident: keep the metadata, restore
the exact checksum-addressed bytes from the protected archive copy, and rerun
the lifecycle smoke test.

## Deployment and rollback

1. Run `npm ci`, `npm run check`, `npm test`, and `npm run deploy:dry-run`.
2. Record the D1 Time Travel bookmark.
3. Apply pending migrations with `npx wrangler d1 migrations apply flecha-registry --remote`.
4. Deploy with `npm run deploy`.
5. Run `npm run smoke` and inspect the deployment list.
6. Run a lifecycle smoke with a token scoped only to the dedicated smoke owner.

Worker code rollback uses the previous known-good Wrangler version. A schema
rollback uses D1 Time Travel only after confirming the older Worker is
compatible with the restored schema. Immutable archives are not rolled back.

## Lifecycle smoke test

Use a dedicated owner and package so qualification does not mutate real package
history. The smoke command never prints its bearer token:

```sh
REGISTRY_TOKEN="..." npm run smoke -- --lifecycle \
  --identity flecha-smoke/registry-contract
```

For local operations, prefer `REGISTRY_TOKEN_FILE=/path/to/mode-0600-token`
so the bearer token does not enter shell history or process arguments.

The test checks discovery, publish-once immutability, index visibility, exact
download bytes, yank state, and download-after-yank for existing locks. Every
run uses a unique prerelease version and leaves it yanked for auditability.

For a Longbow cache test, publish with `--keep-active --version VERSION`,
resolve and fetch the exact version online, repeat with the same registry URL
and a deliberately unreachable HTTPS proxy, then finish with
`--yank-existing --version VERSION`.

Run the same command against staging with `--base` before production. Longbow's
separate end-to-end fixture must resolve the active release, write a lock,
rebuild from verified cache with the registry unavailable, then continue to
download the locked archive after the version is yanked.

The committed `staging` Wrangler environment uses the isolated
`flecha-registry-staging` D1 database and
`flecha-registry-staging-archives` R2 bucket. Apply migrations and deploy it
without touching production:

```sh
npx wrangler d1 migrations apply flecha-registry-staging --remote --env staging
npx wrangler deploy --env staging
```
