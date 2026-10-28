import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index";

const TOKEN = "flp_test-token-with-enough-entropy-for-registry-tests";
const BASE = "https://registry.flecha-lang.org";
const encoder = new TextEncoder();

function concatenate(parts: Uint8Array<ArrayBufferLike>[]): Uint8Array<ArrayBuffer> {
  const size = parts.reduce((total, part) => total + part.byteLength, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function unsigned(value: bigint, bytes: 4 | 8): Uint8Array {
  const result = new Uint8Array(bytes);
  const view = new DataView(result.buffer);
  if (bytes === 4) view.setUint32(0, Number(value), false);
  else view.setBigUint64(0, value, false);
  return result;
}

function packageArchive(identity = "flecha/example", version = "1.2.3"): Uint8Array {
  const manifest = `[package]
name = "example"
registry = "${identity}"
version = "${version}"
kind = "library"

[dependencies]
`;
  const files = new Map([
    ["longbow.toml", manifest],
    ["src/example.fl", "module example;\n\npublic i32 answer() { return 42; }\n"],
  ]);
  const parts: Uint8Array<ArrayBufferLike>[] = [encoder.encode("FLECHA-PACKAGE-1\n")];
  for (const [path, contents] of [...files].sort(([left], [right]) => left.localeCompare(right))) {
    const pathBytes = encoder.encode(path);
    const contentBytes = encoder.encode(contents);
    parts.push(unsigned(BigInt(pathBytes.byteLength), 4));
    parts.push(unsigned(BigInt(contentBytes.byteLength), 8));
    parts.push(pathBytes, contentBytes);
  }
  parts.push(unsigned(0n, 4));
  return concatenate(parts);
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return `sha256:${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

async function seedToken({
  owner = "flecha",
  packageName = "*",
  publish = 1,
  yank = 1,
}: {
  owner?: string;
  packageName?: string;
  publish?: 0 | 1;
  yank?: 0 | 1;
} = {}): Promise<void> {
  const hash = (await sha256(encoder.encode(TOKEN))).slice("sha256:".length);
  await env.REGISTRY_DB.batch([
    env.REGISTRY_DB
      .prepare("INSERT INTO registry_tokens(token_sha256, subject) VALUES (?1, ?2)")
      .bind(hash, "registry-test"),
    env.REGISTRY_DB
      .prepare(
        `INSERT INTO registry_token_scopes(
             token_sha256, owner, package, can_publish, can_yank
         ) VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(hash, owner, packageName, publish, yank),
  ]);
}

async function publish(
  archive = packageArchive(),
  {
    owner = "flecha",
    packageName = "example",
    version = "1.2.3",
    token = TOKEN,
    checksum,
  }: {
    owner?: string;
    packageName?: string;
    version?: string;
    token?: string;
    checksum?: string;
  } = {},
): Promise<Response> {
  const body = archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer;
  return worker.fetch(
    new Request(`${BASE}/v1/packages/${owner}/${packageName}/${version}/archive`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.flecha.package.v1",
        "X-Flecha-Checksum": checksum ?? (await sha256(archive)),
      },
      body,
    }),
    env,
  );
}

async function clearStorage(): Promise<void> {
  await env.REGISTRY_DB.batch([
    env.REGISTRY_DB.prepare("DELETE FROM registry_releases"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_packages"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_token_scopes"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_tokens"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_oauth_requests"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_device_authorizations"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_browser_sessions"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_owner_memberships"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_owners"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_oauth_identities"),
    env.REGISTRY_DB.prepare("DELETE FROM registry_users"),
  ]);
  let cursor: string | undefined;
  do {
    const listed = await env.PACKAGE_ARCHIVES.list({ cursor });
    if (listed.objects.length) {
      await env.PACKAGE_ARCHIVES.delete(listed.objects.map((object) => object.key));
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

beforeEach(clearStorage);

describe("Flecha registry protocol", () => {
  it("reports protocol health", async () => {
    const response = await worker.fetch(new Request(`${BASE}/healthz`), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", protocol: 1 });
  });

  it("publishes, indexes, downloads, and yanks an immutable archive", async () => {
    await seedToken();
    const archive = packageArchive();
    const checksum = await sha256(archive);

    const published = await publish(archive);
    expect(published.status).toBe(201);
    expect(published.headers.get("X-Flecha-Checksum")).toBe(checksum);

    const index = await worker.fetch(new Request(`${BASE}/v1/packages/flecha/example/index`), env);
    expect(index.status).toBe(200);
    expect(await index.text()).toBe(`flecha-registry-index 1\n1.2.3\t${checksum}\tactive\n`);

    const downloaded = await worker.fetch(
      new Request(`${BASE}/v1/packages/flecha/example/1.2.3/archive`),
      env,
    );
    expect(downloaded.status).toBe(200);
    expect(downloaded.headers.get("Cache-Control")).toContain("immutable");
    expect(new Uint8Array(await downloaded.arrayBuffer())).toEqual(archive);

    const yanked = await worker.fetch(
      new Request(`${BASE}/v1/packages/flecha/example/1.2.3/yank`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }),
      env,
    );
    expect(yanked.status).toBe(204);
    const yankedIndex = await worker.fetch(new Request(`${BASE}/v1/packages/flecha/example/index`), env);
    expect(await yankedIndex.text()).toContain(`${checksum}\tyanked`);

    const lockedDownload = await worker.fetch(
      new Request(`${BASE}/v1/packages/flecha/example/1.2.3/archive`),
      env,
    );
    expect(lockedDownload.status).toBe(200);
  });

  it("never replaces a published owner, package, and version", async () => {
    await seedToken();
    expect((await publish()).status).toBe(201);
    const duplicate = await publish();
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toMatchObject({ error: "published package versions are immutable" });
  });

  it("rejects versions that differ only by build metadata", async () => {
    await seedToken();
    const firstArchive = packageArchive("flecha/example", "1.2.3+build1");
    expect((await publish(firstArchive, { version: "1.2.3+build1" })).status).toBe(201);

    const secondArchive = packageArchive("flecha/example", "1.2.3+build2");
    const duplicatePrecedence = await publish(secondArchive, { version: "1.2.3+build2" });
    expect(duplicatePrecedence.status).toBe(409);
  });

  it("requires scoped permissions for registry mutations", async () => {
    const missing = await publish(packageArchive(), { token: "unknown" });
    expect(missing.status).toBe(401);

    await seedToken({ packageName: "another-package" });
    const wrongPackage = await publish();
    expect(wrongPackage.status).toBe(403);

    await clearStorage();
    await seedToken({ publish: 0, yank: 1 });
    const wrongPermission = await publish();
    expect(wrongPermission.status).toBe(403);
  });

  it("rejects checksum mismatches and mismatched archive manifests", async () => {
    await seedToken();
    const wrongChecksum = await publish(packageArchive(), {
      checksum: `sha256:${"0".repeat(64)}`,
    });
    expect(wrongChecksum.status).toBe(400);

    const wrongIdentity = packageArchive("flecha/not-example");
    const mismatchedManifest = await publish(wrongIdentity);
    expect(mismatchedManifest.status).toBe(400);
    expect(await mismatchedManifest.json()).toMatchObject({
      error: "archive manifest identity, version, or kind does not match the publication",
    });
  });

  it("returns not found for unknown packages and versions", async () => {
    const index = await worker.fetch(new Request(`${BASE}/v1/packages/flecha/missing/index`), env);
    expect(index.status).toBe(404);
    const archive = await worker.fetch(
      new Request(`${BASE}/v1/packages/flecha/missing/1.0.0/archive`),
      env,
    );
    expect(archive.status).toBe(404);
  });
});

describe("Flecha registry identity", () => {
  it("lets a signed-in user claim an available owner", async () => {
    const session = "browser-session-secret";
    const sessionHash = (await sha256(encoder.encode(session))).slice("sha256:".length);
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB.prepare("INSERT INTO registry_users(id, handle) VALUES ('usr_browser', 'browser-user')"),
      env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_browser_sessions(session_sha256, user_id, csrf_token, expires_at)
           VALUES (?1, 'usr_browser', 'csrf-test', unixepoch() + 60)`,
        )
        .bind(sessionHash),
    ]);
    const claimed = await worker.fetch(
      new Request("https://packages.flecha-lang.org/account/owners", {
        method: "POST",
        headers: {
          Cookie: `flecha_session=${session}`,
          Origin: "https://packages.flecha-lang.org",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ owner: "browser-user", csrf: "csrf-test" }),
      }),
      env,
    );
    expect(claimed.status).toBe(303);
    expect(
      await env.REGISTRY_DB
        .prepare("SELECT role FROM registry_owner_memberships WHERE owner = 'browser-user' AND user_id = 'usr_browser'")
        .first<{ role: string }>(),
    ).toEqual({ role: "owner" });

    const duplicate = await worker.fetch(
      new Request("https://packages.flecha-lang.org/account/owners", {
        method: "POST",
        headers: {
          Cookie: `flecha_session=${session}`,
          Origin: "https://packages.flecha-lang.org",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ owner: "browser-user", csrf: "csrf-test" }),
      }),
      env,
    );
    expect(duplicate.status).toBe(409);
  });

  it("accepts an opaque origin for a browser-verified same-origin logout", async () => {
    const session = "opaque-origin-session";
    const sessionHash = (await sha256(encoder.encode(session))).slice("sha256:".length);
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB.prepare("INSERT INTO registry_users(id, handle) VALUES ('usr_logout', 'logout-user')"),
      env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_browser_sessions(session_sha256, user_id, csrf_token, expires_at)
           VALUES (?1, 'usr_logout', 'csrf-logout', unixepoch() + 60)`,
        )
        .bind(sessionHash),
    ]);

    const loggedOut = await worker.fetch(
      new Request("https://packages.flecha-lang.org/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `flecha_session=${session}`,
          Origin: "null",
          "Sec-Fetch-Site": "same-origin",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ csrf: "csrf-logout" }),
      }),
      env,
    );

    expect(loggedOut.status).toBe(303);
    expect(loggedOut.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(
      await env.REGISTRY_DB
        .prepare("SELECT user_id FROM registry_browser_sessions WHERE session_sha256 = ?1")
        .bind(sessionHash)
        .first(),
    ).toBeNull();
  });

  it("rejects an opaque origin when Fetch Metadata reports a cross-site request", async () => {
    const session = "cross-site-session";
    const sessionHash = (await sha256(encoder.encode(session))).slice("sha256:".length);
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB.prepare("INSERT INTO registry_users(id, handle) VALUES ('usr_cross_site', 'cross-site-user')"),
      env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_browser_sessions(session_sha256, user_id, csrf_token, expires_at)
           VALUES (?1, 'usr_cross_site', 'csrf-cross-site', unixepoch() + 60)`,
        )
        .bind(sessionHash),
    ]);

    const rejected = await worker.fetch(
      new Request("https://packages.flecha-lang.org/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `flecha_session=${session}`,
          Origin: "null",
          "Sec-Fetch-Site": "cross-site",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ csrf: "csrf-cross-site" }),
      }),
      env,
    );

    expect(rejected.status).toBe(403);
    expect(
      await env.REGISTRY_DB
        .prepare("SELECT user_id FROM registry_browser_sessions WHERE session_sha256 = ?1")
        .bind(sessionHash)
        .first<{ user_id: string }>(),
    ).toEqual({ user_id: "usr_cross_site" });
  });

  it("issues a one-time CLI token after device approval", async () => {
    const started = await worker.fetch(
      new Request(`${BASE}/v1/auth/device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "longbow-cli" }),
      }),
      env,
    );
    expect(started.status).toBe(200);
    const authorization = (await started.json()) as {
      device_code: string;
      user_code: string;
      verification_uri: string;
    };
    expect(authorization.user_code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(authorization.verification_uri).toBe("https://packages.flecha-lang.org/device");

    const pending = await worker.fetch(
      new Request(`${BASE}/v1/auth/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "longbow-cli", device_code: authorization.device_code }),
      }),
      env,
    );
    expect(pending.status).toBe(400);
    expect(await pending.json()).toMatchObject({ error: "authorization_pending" });

    const deviceHash = (await sha256(encoder.encode(authorization.device_code))).slice("sha256:".length);
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_users(id, handle, display_name, email, email_verified)
           VALUES ('usr_test', 'alice', 'Alice', 'alice@example.com', 1)`,
        ),
      env.REGISTRY_DB
        .prepare(
          "UPDATE registry_device_authorizations SET status = 'approved', user_id = 'usr_test', last_polled_at = NULL WHERE device_code_sha256 = ?1",
        )
        .bind(deviceHash),
    ]);

    const exchanged = await worker.fetch(
      new Request(`${BASE}/v1/auth/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "longbow-cli", device_code: authorization.device_code }),
      }),
      env,
    );
    expect(exchanged.status).toBe(200);
    const credentials = (await exchanged.json()) as { access_token: string };
    expect(credentials.access_token).toMatch(/^flp_/);

    const reused = await worker.fetch(
      new Request(`${BASE}/v1/auth/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "longbow-cli", device_code: authorization.device_code }),
      }),
      env,
    );
    expect(reused.status).toBe(400);

    const whoami = await worker.fetch(
      new Request(`${BASE}/v1/auth/whoami`, {
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      }),
      env,
    );
    expect(whoami.status).toBe(200);
    expect(await whoami.json()).toMatchObject({
      handle: "alice",
      email: "alice@example.com",
      email_verified: true,
      owners: [],
    });
  });

  it("derives CLI publishing authority from current owner membership", async () => {
    const token = "flp_member-token";
    const tokenHash = (await sha256(encoder.encode(token))).slice("sha256:".length);
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB.prepare("INSERT INTO registry_users(id, handle) VALUES ('usr_owner', 'owner')"),
      env.REGISTRY_DB
        .prepare("INSERT INTO registry_owners(slug, display_name, created_by) VALUES ('alice', 'alice', 'usr_owner')"),
      env.REGISTRY_DB
        .prepare("INSERT INTO registry_owner_memberships(owner, user_id, role) VALUES ('alice', 'usr_owner', 'owner')"),
      env.REGISTRY_DB
        .prepare("INSERT INTO registry_tokens(token_sha256, subject, user_id) VALUES (?1, 'owner', 'usr_owner')")
        .bind(tokenHash),
    ]);
    const archive = packageArchive("alice/example");
    expect((await publish(archive, { owner: "alice", token })).status).toBe(201);
  });
});
