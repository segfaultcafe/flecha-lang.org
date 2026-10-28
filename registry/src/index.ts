import { authorize } from "./auth";
import { errorResponse, HttpError, methodNotAllowed } from "./errors";
import {
  accountPage,
  approveDevice,
  claimOwner,
  createDeviceAuthorization,
  devicePage,
  exchangeDeviceAuthorization,
  finishOAuth,
  loginPage,
  logoutBrowser,
  revokeCurrentToken,
  startOAuth,
  whoAmI,
} from "./identity";
import {
  DEFAULT_MAX_ARCHIVE_BYTES,
  PACKAGE_CONTENT_TYPE,
  semanticVersionKey,
  sha256Hex,
  validChecksum,
  validIdentity,
  validSemanticVersion,
  validatePackageArchive,
} from "./validation";

export interface Env {
  REGISTRY_DB: D1Database;
  PACKAGE_ARCHIVES: R2Bucket;
  MAX_ARCHIVE_BYTES?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  PACKAGES_ORIGIN?: string;
}

interface ReleaseRow {
  version: string;
  checksum: string;
  state: "active" | "yanked";
}

interface ArchiveRow {
  checksum: string;
  archive_key: string;
}

const INDEX_CONTENT_TYPE = "text/plain; charset=utf-8";
const MAX_INDEX_BYTES = 4 * 1024 * 1024;
const MAX_RELEASES_PER_PACKAGE = 100_000;

interface PackageStats {
  release_count: number;
  index_bytes: number;
}

function maximumArchiveBytes(env: Env): number {
  const configured = Number(env.MAX_ARCHIVE_BYTES ?? DEFAULT_MAX_ARCHIVE_BYTES);
  if (!Number.isSafeInteger(configured) || configured <= 0) return DEFAULT_MAX_ARCHIVE_BYTES;
  return Math.min(configured, DEFAULT_MAX_ARCHIVE_BYTES);
}

function registryHeaders(extra: HeadersInit = {}): Headers {
  const headers = new Headers(extra);
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

function requirePackage(owner: string, packageName: string): void {
  if (!validIdentity(owner, packageName)) {
    throw new HttpError(400, "invalid owner or package name");
  }
}

function requireVersion(version: string): void {
  if (!validSemanticVersion(version)) throw new HttpError(400, "invalid semantic version");
}

async function readIndex(request: Request, env: Env, owner: string, packageName: string): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  requirePackage(owner, packageName);
  const result = await env.REGISTRY_DB
    .prepare(
      `SELECT version, checksum, state
         FROM registry_releases
        WHERE owner = ?1 AND package = ?2
        ORDER BY version COLLATE BINARY`,
    )
    .bind(owner, packageName)
    .all<ReleaseRow>();
  if (result.results.length === 0) throw new HttpError(404, "package not found");

  let body = "flecha-registry-index 1\n";
  for (const release of result.results) {
    body += `${release.version}\t${release.checksum}\t${release.state}\n`;
  }
  const etag = `"${await sha256Hex(body)}"`;
  const headers = registryHeaders({
    "Content-Type": INDEX_CONTENT_TYPE,
    "Cache-Control": "public, max-age=60",
    ETag: etag,
  });
  if (request.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });
  return new Response(body, { headers });
}

async function readArchive(
  request: Request,
  env: Env,
  owner: string,
  packageName: string,
  version: string,
): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  requirePackage(owner, packageName);
  requireVersion(version);
  const release = await env.REGISTRY_DB
    .prepare(
      `SELECT checksum, archive_key
         FROM registry_releases
        WHERE owner = ?1 AND package = ?2 AND version = ?3`,
    )
    .bind(owner, packageName, version)
    .first<ArchiveRow>();
  if (!release) throw new HttpError(404, "package version not found");

  const object = await env.PACKAGE_ARCHIVES.get(release.archive_key);
  if (!object || !object.body) {
    console.error("registry archive metadata exists without R2 object", {
      owner,
      package: packageName,
      version,
      archiveKey: release.archive_key,
    });
    throw new HttpError(503, "package archive is temporarily unavailable", { "Retry-After": "60" });
  }
  const headers = registryHeaders({
    "Content-Type": PACKAGE_CONTENT_TYPE,
    "Content-Length": object.size.toString(),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Flecha-Checksum": release.checksum,
    ETag: object.httpEtag,
  });
  return new Response(object.body, { headers });
}

async function storeArchive(
  env: Env,
  archiveKey: string,
  checksum: string,
  bytes: ArrayBuffer,
): Promise<void> {
  const existing = await env.PACKAGE_ARCHIVES.head(archiveKey);
  if (existing) {
    if (existing.size !== bytes.byteLength || existing.customMetadata?.checksum !== checksum) {
      console.error("content-addressed R2 object has inconsistent metadata", { archiveKey, checksum });
      throw new HttpError(500, "registry archive storage is inconsistent");
    }
    return;
  }
  const stored = await env.PACKAGE_ARCHIVES.put(archiveKey, bytes, {
    onlyIf: { etagDoesNotMatch: "*" },
    httpMetadata: { contentType: PACKAGE_CONTENT_TYPE },
    customMetadata: { checksum },
  });
  if (stored) return;

  const raced = await env.PACKAGE_ARCHIVES.head(archiveKey);
  if (!raced || raced.size !== bytes.byteLength || raced.customMetadata?.checksum !== checksum) {
    throw new HttpError(503, "could not commit package archive", { "Retry-After": "5" });
  }
}

async function publishArchive(
  request: Request,
  env: Env,
  owner: string,
  packageName: string,
  version: string,
): Promise<Response> {
  if (request.method !== "PUT") throw methodNotAllowed("PUT");
  requirePackage(owner, packageName);
  requireVersion(version);
  const identity = `${owner}/${packageName}`;
  const subject = await authorize(request, env.REGISTRY_DB, owner, packageName, "publish");

  const mediaType = request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== PACKAGE_CONTENT_TYPE) {
    throw new HttpError(415, `Content-Type must be ${PACKAGE_CONTENT_TYPE}`);
  }
  const expectedChecksum = request.headers.get("X-Flecha-Checksum");
  if (!validChecksum(expectedChecksum)) {
    throw new HttpError(400, "X-Flecha-Checksum must contain a lowercase sha256 checksum");
  }
  const maximumBytes = maximumArchiveBytes(env);
  const declaredLength = request.headers.get("Content-Length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      throw new HttpError(400, "invalid Content-Length");
    }
    if (parsedLength > maximumBytes) throw new HttpError(413, "package archive exceeds 16 MiB");
  }

  const existing = await env.REGISTRY_DB
    .prepare(
      `SELECT 1
         FROM registry_releases
        WHERE owner = ?1 AND package = ?2 AND version = ?3`,
    )
    .bind(owner, packageName, version)
    .first();
  if (existing) throw new HttpError(409, "published package versions are immutable");

  const stats = await env.REGISTRY_DB
    .prepare(
      `SELECT COUNT(*) AS release_count,
              COALESCE(SUM(
                length(version) + 1 + length(checksum) + 1 + length(state) + 1
              ), 0) AS index_bytes
         FROM registry_releases
        WHERE owner = ?1 AND package = ?2`,
    )
    .bind(owner, packageName)
    .first<PackageStats>();
  const newIndexBytes =
    "flecha-registry-index 1\n".length +
    (stats?.index_bytes ?? 0) +
    version.length +
    1 +
    expectedChecksum.length +
    1 +
    "active\n".length;
  if ((stats?.release_count ?? 0) >= MAX_RELEASES_PER_PACKAGE || newIndexBytes > MAX_INDEX_BYTES) {
    throw new HttpError(409, "package index capacity exceeded");
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > maximumBytes) throw new HttpError(413, "package archive exceeds 16 MiB");
  const actualChecksum = `sha256:${await sha256Hex(bytes)}`;
  if (actualChecksum !== expectedChecksum) {
    throw new HttpError(400, "package archive checksum does not match X-Flecha-Checksum");
  }
  validatePackageArchive(bytes, identity, version, maximumBytes);

  const archiveKey = `sha256/${actualChecksum.slice(7, 9)}/${actualChecksum.slice(7)}`;
  await storeArchive(env, archiveKey, actualChecksum, bytes);
  try {
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB
        .prepare("INSERT OR IGNORE INTO registry_packages(owner, name) VALUES (?1, ?2)")
        .bind(owner, packageName),
      env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_releases(
               owner, package, version, version_key, checksum, archive_key, published_by
           ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
        )
        .bind(
          owner,
          packageName,
          version,
          semanticVersionKey(version),
          actualChecksum,
          archiveKey,
          subject,
        ),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      throw new HttpError(409, "published package versions are immutable");
    }
    throw error;
  }

  const location = new URL(request.url);
  location.pathname = `/v1/packages/${owner}/${packageName}/${version}/archive`;
  return new Response(null, {
    status: 201,
    headers: registryHeaders({
      Location: location.toString(),
      "X-Flecha-Checksum": actualChecksum,
      "Cache-Control": "no-store",
    }),
  });
}

async function yankRelease(
  request: Request,
  env: Env,
  owner: string,
  packageName: string,
  version: string,
): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  requirePackage(owner, packageName);
  requireVersion(version);
  const subject = await authorize(request, env.REGISTRY_DB, owner, packageName, "yank");
  const result = await env.REGISTRY_DB
    .prepare(
      `UPDATE registry_releases
          SET state = 'yanked', yanked_at = unixepoch(), yanked_by = ?4
        WHERE owner = ?1 AND package = ?2 AND version = ?3`,
    )
    .bind(owner, packageName, version, subject)
    .run();
  if (result.meta.changes === 0) throw new HttpError(404, "package version not found");
  return new Response(null, {
    status: 204,
    headers: registryHeaders({ "Cache-Control": "no-store" }),
  });
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === "/" && url.hostname === "packages.flecha-lang.org") {
    return Response.redirect(`${env.PACKAGES_ORIGIN || "https://packages.flecha-lang.org"}/account`, 302);
  }
  if (url.pathname === "/login") return loginPage(request);
  if (url.pathname === "/device") return devicePage(request, env);
  if (url.pathname === "/device/approve") return approveDevice(request, env);
  if (url.pathname === "/account") return accountPage(request, env);
  if (url.pathname === "/account/owners") return claimOwner(request, env);
  if (url.pathname === "/auth/github/start") return startOAuth(request, env, "github");
  if (url.pathname === "/auth/github/callback") return finishOAuth(request, env, "github");
  if (url.pathname === "/auth/logout") return logoutBrowser(request, env);
  if (url.pathname === "/v1/auth/device") return createDeviceAuthorization(request, env);
  if (url.pathname === "/v1/auth/device/token") return exchangeDeviceAuthorization(request, env);
  if (url.pathname === "/v1/auth/whoami") return whoAmI(request, env);
  if (url.pathname === "/v1/auth/revoke") return revokeCurrentToken(request, env);
  if (url.pathname === "/healthz") {
    if (request.method !== "GET") throw methodNotAllowed("GET");
    return Response.json(
      { status: "ok", protocol: 1 },
      { headers: registryHeaders({ "Cache-Control": "no-store" }) },
    );
  }
  if (url.pathname === "/v1" || url.pathname === "/v1/") {
    if (request.method !== "GET") throw methodNotAllowed("GET");
    return Response.json(
      { name: "Flecha package registry", protocol: 1 },
      { headers: registryHeaders({ "Cache-Control": "public, max-age=300" }) },
    );
  }

  let match = /^\/v1\/packages\/([^/]+)\/([^/]+)\/index$/.exec(url.pathname);
  if (match) return readIndex(request, env, match[1], match[2]);
  match = /^\/v1\/packages\/([^/]+)\/([^/]+)\/([^/]+)\/archive$/.exec(url.pathname);
  if (match) {
    return request.method === "PUT"
      ? publishArchive(request, env, match[1], match[2], match[3])
      : readArchive(request, env, match[1], match[2], match[3]);
  }
  match = /^\/v1\/packages\/([^/]+)\/([^/]+)\/([^/]+)\/yank$/.exec(url.pathname);
  if (match) return yankRelease(request, env, match[1], match[2], match[3]);
  throw new HttpError(404, "registry resource not found");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) return errorResponse(error);
      console.error("unhandled registry error", error);
      return errorResponse(new HttpError(500, "internal registry error"));
    }
  },
} satisfies ExportedHandler<Env>;
