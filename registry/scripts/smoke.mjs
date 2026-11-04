import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const argumentsMap = new Map();
for (let index = 2; index < process.argv.length; ++index) {
  const argument = process.argv[index];
  if (["--lifecycle", "--keep-active", "--yank-existing"].includes(argument)) {
    argumentsMap.set(argument.slice(2), "true");
    continue;
  }
  if (!argument.startsWith("--") || index + 1 >= process.argv.length) {
    throw new Error(`invalid smoke-test argument: ${argument}`);
  }
  argumentsMap.set(argument.slice(2), process.argv[++index]);
}

const base = (argumentsMap.get("base") || "https://registry.flecha-lang.org").replace(/\/$/, "");
const lifecycle = argumentsMap.get("lifecycle") === "true";
const keepActive = argumentsMap.get("keep-active") === "true";
const yankExisting = argumentsMap.get("yank-existing") === "true";
const identity = argumentsMap.get("identity") || "flecha-smoke/registry-contract";
const version = argumentsMap.get("version") || `0.0.0-smoke.${Math.floor(Date.now() / 1000)}`;
const token = process.env.REGISTRY_TOKEN_FILE
  ? readFileSync(process.env.REGISTRY_TOKEN_FILE, "utf8").trim()
  : process.env.REGISTRY_TOKEN;

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectStatus(response, status, description) {
  if (response.status === status) return;
  const body = (await response.text()).slice(0, 1_000);
  throw new Error(`${description}: expected HTTP ${status}, received ${response.status}: ${body}`);
}

function u32(value) {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value);
  return bytes;
}

function u64(value) {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(BigInt(value));
  return bytes;
}

function archiveBytes(packageIdentity, packageVersion) {
  const packageName = packageIdentity.split("/")[1].replaceAll("-", "_");
  const files = new Map([
    [
      "longbow.toml",
      `[package]\nname = ${JSON.stringify(packageName)}\nregistry = ${JSON.stringify(packageIdentity)}\nversion = ${JSON.stringify(packageVersion)}\nkind = "library"\n\n[dependencies]\n`,
    ],
    ["src/registry_contract.fl", "module registry_contract;\nexport i32 registry_contract_value() { return 146; }\n"],
  ]);
  const parts = [Buffer.from("FLECHA-PACKAGE-1\n")];
  for (const [path, contents] of [...files].sort(([left], [right]) => Buffer.from(left).compare(Buffer.from(right)))) {
    const pathBytes = Buffer.from(path);
    const contentBytes = Buffer.from(contents);
    parts.push(u32(pathBytes.length), u64(contentBytes.length), pathBytes, contentBytes);
  }
  parts.push(u32(0));
  return Buffer.concat(parts);
}

async function readOnlySmoke() {
  const health = await fetch(`${base}/healthz`, { headers: { Accept: "application/json" } });
  await expectStatus(health, 200, "registry health");
  expect((await health.json()).protocol === 1, "registry health did not report protocol 1");

  const discovery = await fetch(`${base}/v1`, { headers: { Accept: "application/json" } });
  await expectStatus(discovery, 200, "registry discovery");
  const metadata = await discovery.json();
  expect(metadata.name === "Flecha package registry" && metadata.protocol === 1, "invalid registry discovery metadata");
  console.log(`Registry protocol v1 is healthy at ${base}`);
}

async function lifecycleSmoke() {
  expect(token, "REGISTRY_TOKEN is required for --lifecycle");
  expect(/^[a-z][a-z0-9_-]*\/[a-z][a-z0-9_-]*$/.test(identity), "--identity must be owner/package");
  const archive = archiveBytes(identity, version);
  const checksum = `sha256:${createHash("sha256").update(archive).digest("hex")}`;
  const archiveUrl = `${base}/v1/packages/${identity}/${version}/archive`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/vnd.flecha.package.v1",
    "X-Flecha-Checksum": checksum,
  };

  const indexUrl = `${base}/v1/packages/${identity}/index`;
  if (!yankExisting) {
    const published = await fetch(archiveUrl, { method: "PUT", headers, body: archive });
    await expectStatus(published, 201, "publish");
    expect(published.headers.get("X-Flecha-Checksum") === checksum, "publish returned the wrong checksum");

    const duplicate = await fetch(archiveUrl, { method: "PUT", headers, body: archive });
    await expectStatus(duplicate, 409, "immutable duplicate publish");
  }

  const activeIndex = await fetch(indexUrl);
  await expectStatus(activeIndex, 200, "active package index");
  expect((await activeIndex.text()).includes(`${version}\t${checksum}\tactive`), "published release is not active in the index");

  const downloaded = await fetch(archiveUrl);
  await expectStatus(downloaded, 200, "archive download");
  expect(Buffer.compare(Buffer.from(await downloaded.arrayBuffer()), archive) === 0, "downloaded archive bytes changed");

  if (keepActive) {
    console.log(`Published and verified active release ${identity}@${version}`);
    return;
  }

  const yanked = await fetch(`${base}/v1/packages/${identity}/${version}/yank`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await expectStatus(yanked, 204, "yank");

  const yankedIndex = await fetch(indexUrl, { headers: { "Cache-Control": "no-cache" } });
  await expectStatus(yankedIndex, 200, "yanked package index");
  expect((await yankedIndex.text()).includes(`${version}\t${checksum}\tyanked`), "release was not yanked in the index");

  const lockedDownload = await fetch(archiveUrl);
  await expectStatus(lockedDownload, 200, "locked download after yank");
  expect(Buffer.compare(Buffer.from(await lockedDownload.arrayBuffer()), archive) === 0, "yank changed immutable archive bytes");

  const prefix = yankExisting
    ? "Verified, yanked, and re-downloaded"
    : "Published, verified, yanked, and re-downloaded";
  console.log(`${prefix} ${identity}@${version}`);
}

await readOnlySmoke();
if (lifecycle || yankExisting) await lifecycleSmoke();
