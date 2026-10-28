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
