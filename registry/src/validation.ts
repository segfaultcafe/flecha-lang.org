import { HttpError } from "./errors";

const ARCHIVE_MAGIC = new TextEncoder().encode("FLECHA-PACKAGE-1\n");
const MAX_FILES = 10_000;
const MAX_PATH_BYTES = 4_096;
const MAX_UINT64 = 18_446_744_073_709_551_615n;
const PACKAGE_PART = /^[a-z][a-z0-9_-]*$/;
const CHECKSUM = /^sha256:[0-9a-f]{64}$/;
const SEMVER = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const TOML_STRING = '"(?:[^"\\\\\\x00-\\x1f\\x7f]|\\\\["\\\\nrt])*"';

export const DEFAULT_MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
export const PACKAGE_CONTENT_TYPE = "application/vnd.flecha.package.v1";

export function validPackagePart(value: string): boolean {
  return PACKAGE_PART.test(value);
}

export function validIdentity(owner: string, name: string): boolean {
  return validPackagePart(owner) && validPackagePart(name);
}

export function validChecksum(value: string | null): value is string {
  return value !== null && CHECKSUM.test(value);
}

export function validSemanticVersion(value: string): boolean {
  if (value.length > 256) return false;
  const match = SEMVER.exec(value);
  if (!match) return false;
  for (const part of match.slice(1, 4)) {
    if (BigInt(part) > MAX_UINT64) return false;
  }
  if (match[4]) {
    for (const identifier of match[4].split(".")) {
      if (/^[0-9]+$/.test(identifier) && identifier.length > 1 && identifier.startsWith("0")) {
        return false;
      }
    }
  }
  return true;
}

export function semanticVersionKey(value: string): string {
  return value.split("+", 1)[0];
}

export async function sha256Hex(value: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function supportedPath(path: string): boolean {
  if (path === "longbow.toml" || path === "README.md" || path === "LICENSE") return true;
  if (path.startsWith("LICENSE.") && !path.includes("/")) return true;
  return path.startsWith("src/") && path.endsWith(".fl");
}

function validatePath(path: string, seen: Set<string>): void {
  if (
    path.length === 0 ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path.split("/").some((part) => part.length === 0 || part === "." || part === "..") ||
    !supportedPath(path)
  ) {
    throw new HttpError(400, `archive contains unsupported or unsafe path: ${path}`);
  }
  const portable = path.toLowerCase();
  if (seen.has(portable)) {
    throw new HttpError(400, `archive contains case-colliding path: ${path}`);
  }
  seen.add(portable);
}

function validateManifest(contents: Uint8Array, identity: string, version: string): void {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(contents);
  } catch {
    throw new HttpError(400, "archive manifest is not valid UTF-8");
  }
  if (text.includes("\r") || !text.startsWith("[package]\n")) {
    throw new HttpError(400, "archive manifest is not normalized");
  }
  const dependenciesMarker = "\n[dependencies]\n";
  const dependenciesOffset = text.indexOf(dependenciesMarker);
  if (dependenciesOffset < 0 || text.indexOf("\n[", dependenciesOffset + dependenciesMarker.length) >= 0) {
    throw new HttpError(400, "archive manifest has unsupported sections");
  }

  const packageLines = text.slice("[package]\n".length, dependenciesOffset).split("\n");
  const packageValues = new Map<string, string>();
  const packageLine = new RegExp(`^(name|registry|version|kind|flecha) = (${TOML_STRING})$`);
  for (const line of packageLines) {
    if (!line) continue;
    const match = packageLine.exec(line);
    if (!match || packageValues.has(match[1])) {
      throw new HttpError(400, "archive manifest package metadata is not normalized");
    }
    packageValues.set(match[1], match[2]);
  }
  if (
    packageValues.get("registry") !== JSON.stringify(identity) ||
    packageValues.get("version") !== JSON.stringify(version) ||
    packageValues.get("kind") !== '"library"' ||
    !packageValues.has("name")
  ) {
    throw new HttpError(400, "archive manifest identity, version, or kind does not match the publication");
  }

  const dependencyLines = text.slice(dependenciesOffset + dependenciesMarker.length).split("\n");
  const registryDependency = new RegExp(
    `^([a-z][a-z0-9_]*) = \\{ package = (${TOML_STRING}), version = (${TOML_STRING}) \\}$`,
  );
  const gitDependency = new RegExp(
    `^([a-z][a-z0-9_]*) = \\{ git = (${TOML_STRING}), rev = "[0-9a-fA-F]{40}" \\}$`,
  );
  const aliases = new Set<string>();
  for (const line of dependencyLines) {
    if (!line) continue;
    const match = registryDependency.exec(line) ?? gitDependency.exec(line);
    if (!match || match[1] === "root" || match[1] === "lib" || aliases.has(match[1])) {
      throw new HttpError(400, "archive manifest contains a non-publishable dependency");
    }
    aliases.add(match[1]);
  }
}

function startsWith(bytes: Uint8Array, prefix: Uint8Array): boolean {
  return prefix.every((byte, index) => bytes[index] === byte);
}

export function validatePackageArchive(
  buffer: ArrayBuffer,
  expectedIdentity: string,
  expectedVersion: string,
  maximumBytes = DEFAULT_MAX_ARCHIVE_BYTES,
): void {
  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength > maximumBytes || !startsWith(bytes, ARCHIVE_MAGIC)) {
    throw new HttpError(400, "invalid Flecha package archive");
  }
  const view = new DataView(buffer);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const seen = new Set<string>();
  let manifest: Uint8Array | undefined;
  let offset = ARCHIVE_MAGIC.byteLength;
  let count = 0;

  const requireBytes = (amount: number): void => {
    if (amount < 0 || offset + amount > bytes.byteLength) {
      throw new HttpError(400, "truncated Flecha package archive");
    }
  };

  while (true) {
    requireBytes(4);
    const pathSize = view.getUint32(offset, false);
    offset += 4;
    if (pathSize === 0) break;
    requireBytes(8);
    const contentSize = view.getBigUint64(offset, false);
    offset += 8;
    if (++count > MAX_FILES || pathSize > MAX_PATH_BYTES || contentSize > BigInt(maximumBytes)) {
      throw new HttpError(400, "invalid Flecha package archive entry");
    }
    const entrySize = pathSize + Number(contentSize);
    requireBytes(entrySize);
    let path: string;
    try {
      path = decoder.decode(bytes.subarray(offset, offset + pathSize));
    } catch {
      throw new HttpError(400, "archive path is not valid UTF-8");
    }
    offset += pathSize;
    validatePath(path, seen);
    const contents = bytes.subarray(offset, offset + Number(contentSize));
    if (path === "longbow.toml") manifest = contents;
    offset += Number(contentSize);
  }

  if (offset !== bytes.byteLength) {
    throw new HttpError(400, "Flecha package archive has trailing bytes");
  }
  if (!manifest) throw new HttpError(400, "Flecha package archive is missing longbow.toml");
  validateManifest(manifest, expectedIdentity, expectedVersion);
}
