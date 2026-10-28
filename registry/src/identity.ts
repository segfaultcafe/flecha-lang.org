import { authenticateToken } from "./auth";
import { HttpError, methodNotAllowed } from "./errors";
import { sha256Hex, validIdentity } from "./validation";

export interface IdentityEnv {
  REGISTRY_DB: D1Database;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  PACKAGES_ORIGIN?: string;
}

type Provider = "github" | "google";

interface DeviceRow {
  device_code_sha256: string;
  status: "pending" | "approved" | "denied" | "consumed";
  user_id: string | null;
  expires_at: number;
  interval_seconds: number;
  last_polled_at: number | null;
}

interface OAuthRequestRow {
  provider: Provider;
  code_verifier: string;
  nonce: string | null;
  device_code_sha256: string | null;
  expires_at: number;
}

interface UserRow {
  id: string;
  handle: string;
  display_name: string | null;
  email: string | null;
  email_verified: number;
}

interface SessionRow extends UserRow {
  csrf_token: string;
}

interface ProviderIdentity {
  subject: string;
  handle: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
}

interface MembershipRow {
  owner: string;
  role: "owner" | "admin" | "publisher";
}

const DEVICE_CLIENT_ID = "longbow-cli";
const DEVICE_TTL_SECONDS = 10 * 60;
const OAUTH_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const USER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RESERVED_OWNERS = new Set(["flecha", "admin", "api", "registry", "support"]);

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function packagesOrigin(env: IdentityEnv): string {
  return (env.PACKAGES_ORIGIN || "https://packages.flecha-lang.org").replace(/\/$/, "");
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomToken(length = 32): string {
  return base64Url(randomBytes(length));
}

function userCode(): string {
  const bytes = randomBytes(8);
  let result = "";
  for (const byte of bytes) result += USER_CODE_ALPHABET[byte % USER_CODE_ALPHABET.length];
  return `${result.slice(0, 4)}-${result.slice(4)}`;
}

function normalizeUserCode(value: unknown): string {
  if (typeof value !== "string") return "";
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return compact.length === 8 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : "";
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function page(title: string, body: string, status = 200, headers: HeadersInit = {}): Response {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)} · Flecha Packages</title>
<style>
:root{color-scheme:dark;background:#080b10;color:#edf3f8;font:16px/1.55 system-ui,sans-serif}body{margin:0}main{max-width:640px;margin:8vh auto;padding:32px}.card{border:1px solid #26313d;border-radius:14px;padding:28px;background:#10161d}h1{margin-top:0}a,button{color:#080b10;background:#59e1c2;border:0;border-radius:8px;padding:11px 16px;text-decoration:none;font-weight:700;display:inline-block;cursor:pointer}.secondary{background:#dbe7ef;margin-left:8px}input{font:inherit;padding:10px;border-radius:8px;border:1px solid #405060;background:#080b10;color:#fff}label{display:block;margin:16px 0 6px}.muted{color:#9fb0bf}.code{font:700 1.5rem ui-monospace,monospace;letter-spacing:.08em}ul{padding-left:20px}</style></head><body><main><div class="card">${body}</div></main></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      ...headers,
    },
  });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > 16 * 1024) throw new HttpError(413, "request body is too large");
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "request body must be a JSON object");
  }
}

function cookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return null;
}

async function currentSession(request: Request, database: D1Database): Promise<SessionRow | null> {
  const raw = cookie(request, "flecha_session");
  if (!raw) return null;
  const hash = await sha256Hex(raw);
  return database
    .prepare(
      `SELECT u.id, u.handle, u.display_name, u.email, u.email_verified, s.csrf_token
         FROM registry_browser_sessions s
         JOIN registry_users u ON u.id = s.user_id
        WHERE s.session_sha256 = ?1 AND s.expires_at > ?2`,
    )
    .bind(hash, now())
    .first<SessionRow>();
}

async function createSession(database: D1Database, userId: string): Promise<{ cookie: string; csrf: string }> {
  const raw = randomToken();
  const csrf = randomToken(24);
  await database
    .prepare(
      `INSERT INTO registry_browser_sessions(session_sha256, user_id, csrf_token, expires_at)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(await sha256Hex(raw), userId, csrf, now() + SESSION_TTL_SECONDS)
    .run();
  return {
    cookie: `flecha_session=${raw}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
    csrf,
  };
}

function requireSameOrigin(request: Request, env: IdentityEnv): void {
  const origin = request.headers.get("Origin");
  if (!origin || origin === packagesOrigin(env)) return;
  // Some embedded browsers serialize a same-origin form submission as an
  // opaque origin. Fetch Metadata is a forbidden request header in browsers,
  // so it still distinguishes that case from a cross-site form submission.
  if (origin === "null" && request.headers.get("Sec-Fetch-Site") === "same-origin") return;
  throw new HttpError(403, "invalid request origin");
}

async function findDeviceByUserCode(database: D1Database, code: string): Promise<DeviceRow | null> {
  if (!code) return null;
  return database
    .prepare(
      `SELECT device_code_sha256, status, user_id, expires_at, interval_seconds, last_polled_at
         FROM registry_device_authorizations
        WHERE user_code_sha256 = ?1`,
    )
    .bind(await sha256Hex(code))
    .first<DeviceRow>();
}

export async function createDeviceAuthorization(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  const body = await readJson(request);
  if (body.client_id !== DEVICE_CLIENT_ID) throw new HttpError(400, "invalid_client");
  const deviceCode = randomToken();
  let code = "";
  for (let attempt = 0; attempt < 5; ++attempt) {
    code = userCode();
    try {
      await env.REGISTRY_DB
        .prepare(
          `INSERT INTO registry_device_authorizations(
             device_code_sha256, user_code_sha256, client_id, expires_at
           ) VALUES (?1, ?2, ?3, ?4)`,
        )
        .bind(await sha256Hex(deviceCode), await sha256Hex(code), DEVICE_CLIENT_ID, now() + DEVICE_TTL_SECONDS)
        .run();
      break;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  const verificationUri = `${packagesOrigin(env)}/device`;
  return json({
    device_code: deviceCode,
    user_code: code,
    verification_uri: verificationUri,
    verification_uri_complete: `${verificationUri}?user_code=${encodeURIComponent(code)}`,
    expires_in: DEVICE_TTL_SECONDS,
    interval: 5,
  });
}

export async function exchangeDeviceAuthorization(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  const body = await readJson(request);
  if (body.client_id !== DEVICE_CLIENT_ID || typeof body.device_code !== "string") {
    throw new HttpError(400, "invalid_request");
  }
  const hash = await sha256Hex(body.device_code);
  const device = await env.REGISTRY_DB
    .prepare(
      `SELECT device_code_sha256, status, user_id, expires_at, interval_seconds, last_polled_at
         FROM registry_device_authorizations
        WHERE device_code_sha256 = ?1 AND client_id = ?2`,
    )
    .bind(hash, DEVICE_CLIENT_ID)
    .first<DeviceRow>();
  const timestamp = now();
  if (!device) throw new HttpError(400, "invalid_grant");
  if (device.expires_at <= timestamp) throw new HttpError(400, "expired_token");
  if (device.status === "pending") {
    if (device.last_polled_at !== null && timestamp - device.last_polled_at < device.interval_seconds) {
      await env.REGISTRY_DB
        .prepare("UPDATE registry_device_authorizations SET interval_seconds = interval_seconds + 5 WHERE device_code_sha256 = ?1")
        .bind(hash)
        .run();
      throw new HttpError(400, "slow_down");
    }
    await env.REGISTRY_DB
      .prepare("UPDATE registry_device_authorizations SET last_polled_at = ?2 WHERE device_code_sha256 = ?1")
      .bind(hash, timestamp)
      .run();
    throw new HttpError(400, "authorization_pending");
  }
  if (device.status === "denied") throw new HttpError(400, "access_denied");
  if (device.status !== "approved" || !device.user_id) throw new HttpError(400, "invalid_grant");

  const user = await env.REGISTRY_DB
    .prepare("SELECT id, handle, display_name, email, email_verified FROM registry_users WHERE id = ?1")
    .bind(device.user_id)
    .first<UserRow>();
  if (!user) throw new HttpError(400, "invalid_grant");
  const consumed = await env.REGISTRY_DB
    .prepare(
      `UPDATE registry_device_authorizations
          SET status = 'consumed'
        WHERE device_code_sha256 = ?1 AND status = 'approved'
        RETURNING user_id`,
    )
    .bind(hash)
    .first<{ user_id: string }>();
  if (!consumed) throw new HttpError(400, "invalid_grant");
  const rawToken = `flp_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);
  await env.REGISTRY_DB
    .prepare(
      `INSERT INTO registry_tokens(token_sha256, subject, user_id, label)
       VALUES (?1, ?2, ?3, 'Longbow CLI')`,
    )
    .bind(tokenHash, user.handle, user.id)
    .run();
  return json({
    access_token: rawToken,
    token_type: "Bearer",
    account: { handle: user.handle, email: user.email },
  });
}

function providerCredentials(env: IdentityEnv, provider: Provider): { id: string; secret: string } {
  const id = provider === "github" ? env.GITHUB_CLIENT_ID : env.GOOGLE_CLIENT_ID;
  const secret = provider === "github" ? env.GITHUB_CLIENT_SECRET : env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) throw new HttpError(503, `${provider} login is not configured`);
  return { id, secret };
}

export async function startOAuth(request: Request, env: IdentityEnv, provider: Provider): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  const credentials = providerCredentials(env, provider);
  const url = new URL(request.url);
  const code = normalizeUserCode(url.searchParams.get("user_code"));
  let deviceHash: string | null = null;
  if (code) {
    const device = await findDeviceByUserCode(env.REGISTRY_DB, code);
    if (!device || device.status !== "pending" || device.expires_at <= now()) {
      throw new HttpError(400, "device code is invalid or expired");
    }
    deviceHash = device.device_code_sha256;
  }

  const state = randomToken();
  const verifier = randomToken(48);
  const nonce = provider === "google" ? randomToken() : null;
  await env.REGISTRY_DB
    .prepare(
      `INSERT INTO registry_oauth_requests(
         state_sha256, provider, code_verifier, nonce, device_code_sha256, expires_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(await sha256Hex(state), provider, verifier, nonce, deviceHash, now() + OAUTH_TTL_SECONDS)
    .run();

  const callback = `${packagesOrigin(env)}/auth/${provider}/callback`;
  const challenge = await pkceChallenge(verifier);
  const authorization =
    provider === "github"
      ? new URL("https://github.com/login/oauth/authorize")
      : new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.searchParams.set("client_id", credentials.id);
  authorization.searchParams.set("redirect_uri", callback);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("code_challenge", challenge);
  authorization.searchParams.set("code_challenge_method", "S256");
  if (provider === "github") {
    authorization.searchParams.set("scope", "read:user user:email");
  } else {
    authorization.searchParams.set("scope", "openid email profile");
    authorization.searchParams.set("nonce", nonce!);
  }
  return Response.redirect(authorization.toString(), 302);
}

async function tokenExchange(
  provider: Provider,
  code: string,
  verifier: string,
  env: IdentityEnv,
): Promise<Record<string, unknown>> {
  const credentials = providerCredentials(env, provider);
  const endpoint =
    provider === "github" ? "https://github.com/login/oauth/access_token" : "https://oauth2.googleapis.com/token";
  const body = new URLSearchParams({
    client_id: credentials.id,
    client_secret: credentials.secret,
    code,
    redirect_uri: `${packagesOrigin(env)}/auth/${provider}/callback`,
    code_verifier: verifier,
    grant_type: "authorization_code",
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const value = (await response.json()) as Record<string, unknown>;
  if (!response.ok || value.error) throw new HttpError(502, `${provider} rejected the authorization code`);
  return value;
}

async function githubIdentity(accessToken: string): Promise<ProviderIdentity> {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "flecha-registry",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const userResponse = await fetch("https://api.github.com/user", { headers });
  if (!userResponse.ok) throw new HttpError(502, "could not read the GitHub identity");
  const user = (await userResponse.json()) as Record<string, unknown>;
  let email = typeof user.email === "string" ? user.email : null;
  let emailVerified = false;
  const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
  if (emailsResponse.ok) {
    const emails = (await emailsResponse.json()) as Array<Record<string, unknown>>;
    const selected = emails.find((item) => item.primary === true && item.verified === true);
    if (selected && typeof selected.email === "string") {
      email = selected.email;
      emailVerified = true;
    }
  }
  if ((typeof user.id !== "number" && typeof user.id !== "string") || typeof user.login !== "string") {
    throw new HttpError(502, "GitHub returned an invalid identity");
  }
  return {
    subject: String(user.id),
    handle: user.login,
    displayName: typeof user.name === "string" ? user.name : null,
    email,
    emailVerified,
  };
}

function decodeJwtPart(part: string): Record<string, unknown> {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), (value) => value.charCodeAt(0))));
}

async function googleIdentity(idToken: string, env: IdentityEnv, nonce: string): Promise<ProviderIdentity> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new HttpError(502, "Google returned an invalid identity token");
  const header = decodeJwtPart(parts[0]);
  const claims = decodeJwtPart(parts[1]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new HttpError(502, "Google returned an unsupported identity token");
  const keysResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!keysResponse.ok) throw new HttpError(502, "could not verify the Google identity");
  const keys = (await keysResponse.json()) as { keys?: Array<JsonWebKey & { kid?: string }> };
  const jwk = keys.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new HttpError(502, "Google identity signing key is unavailable");
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signature = Uint8Array.from(
    atob(parts[2].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[2].length / 4) * 4, "=")),
    (value) => value.charCodeAt(0),
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  const issuer = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (
    !verified ||
    !issuer ||
    claims.aud !== env.GOOGLE_CLIENT_ID ||
    typeof claims.exp !== "number" ||
    claims.exp <= now() ||
    claims.nonce !== nonce ||
    typeof claims.sub !== "string"
  ) {
    throw new HttpError(502, "Google identity token validation failed");
  }
  const email = typeof claims.email === "string" ? claims.email : null;
  return {
    subject: claims.sub,
    handle: email?.split("@", 1)[0] || `google-${claims.sub.slice(0, 8)}`,
    displayName: typeof claims.name === "string" ? claims.name : null,
    email,
    emailVerified: claims.email_verified === true,
  };
}

async function upsertIdentity(
  database: D1Database,
  provider: Provider,
  identity: ProviderIdentity,
): Promise<UserRow> {
  const existing = await database
    .prepare(
      `SELECT u.id, u.handle, u.display_name, u.email, u.email_verified
         FROM registry_oauth_identities i
         JOIN registry_users u ON u.id = i.user_id
        WHERE i.provider = ?1 AND i.provider_subject = ?2`,
    )
    .bind(provider, identity.subject)
    .first<UserRow>();
  if (existing) {
    await database.batch([
      database
        .prepare(
          `UPDATE registry_oauth_identities
              SET provider_handle = ?3, email = ?4, email_verified = ?5, updated_at = unixepoch()
            WHERE provider = ?1 AND provider_subject = ?2`,
        )
        .bind(provider, identity.subject, identity.handle, identity.email, identity.emailVerified ? 1 : 0),
      database
        .prepare(
          `UPDATE registry_users
              SET handle = ?2, display_name = ?3, email = ?4, email_verified = ?5, updated_at = unixepoch()
            WHERE id = ?1`,
        )
        .bind(existing.id, identity.handle, identity.displayName, identity.email, identity.emailVerified ? 1 : 0),
    ]);
    return {
      ...existing,
      handle: identity.handle,
      display_name: identity.displayName,
      email: identity.email,
      email_verified: identity.emailVerified ? 1 : 0,
    };
  }
  const user: UserRow = {
    id: `usr_${randomToken(18)}`,
    handle: identity.handle,
    display_name: identity.displayName,
    email: identity.email,
    email_verified: identity.emailVerified ? 1 : 0,
  };
  await database.batch([
    database
      .prepare(
        `INSERT INTO registry_users(id, handle, display_name, email, email_verified)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(user.id, user.handle, user.display_name, user.email, user.email_verified),
    database
      .prepare(
        `INSERT INTO registry_oauth_identities(
           provider, provider_subject, user_id, provider_handle, email, email_verified
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
      .bind(provider, identity.subject, user.id, identity.handle, identity.email, identity.emailVerified ? 1 : 0),
  ]);
  return user;
}

export async function finishOAuth(request: Request, env: IdentityEnv, provider: Provider): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code || url.searchParams.has("error")) throw new HttpError(400, "OAuth authorization was not completed");
  const stateHash = await sha256Hex(state);
  const transaction = await env.REGISTRY_DB
    .prepare(
      `SELECT provider, code_verifier, nonce, device_code_sha256, expires_at
         FROM registry_oauth_requests WHERE state_sha256 = ?1`,
    )
    .bind(stateHash)
    .first<OAuthRequestRow>();
  if (!transaction || transaction.provider !== provider || transaction.expires_at <= now()) {
    throw new HttpError(400, "OAuth request is invalid or expired");
  }
  await env.REGISTRY_DB.prepare("DELETE FROM registry_oauth_requests WHERE state_sha256 = ?1").bind(stateHash).run();
  const tokens = await tokenExchange(provider, code, transaction.code_verifier, env);
  let identity: ProviderIdentity;
  if (provider === "github") {
    if (typeof tokens.access_token !== "string") throw new HttpError(502, "GitHub did not return an access token");
    identity = await githubIdentity(tokens.access_token);
  } else {
    if (typeof tokens.id_token !== "string" || !transaction.nonce) throw new HttpError(502, "Google did not return an identity token");
    identity = await googleIdentity(tokens.id_token, env, transaction.nonce);
  }
  const user = await upsertIdentity(env.REGISTRY_DB, provider, identity);
  if (transaction.device_code_sha256) {
    await env.REGISTRY_DB
      .prepare(
        `UPDATE registry_device_authorizations
            SET status = 'approved', user_id = ?2
          WHERE device_code_sha256 = ?1 AND status = 'pending' AND expires_at > ?3`,
      )
      .bind(transaction.device_code_sha256, user.id, now())
      .run();
  }
  const session = await createSession(env.REGISTRY_DB, user.id);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${packagesOrigin(env)}/account?connected=1`,
      "Set-Cookie": session.cookie,
      "Cache-Control": "no-store",
    },
  });
}

export async function devicePage(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  const code = normalizeUserCode(new URL(request.url).searchParams.get("user_code"));
  const device = code ? await findDeviceByUserCode(env.REGISTRY_DB, code) : null;
  const session = await currentSession(request, env.REGISTRY_DB);
  if (!code) {
    return page("Connect Longbow", `<h1>Connect Longbow</h1><p>Enter the code shown by <code>longbow login</code>.</p>
      <form method="get"><label for="code">Device code</label><input id="code" name="user_code" autocomplete="one-time-code" required>
      <button type="submit">Continue</button></form>`);
  }
  if (!device || device.expires_at <= now() || device.status !== "pending") {
    return page("Invalid code", "<h1>That code is invalid or expired</h1><p>Run <code>longbow login</code> again.</p>", 400);
  }
  if (session) {
    return page("Approve Longbow", `<h1>Approve Longbow</h1><p>Signed in as <strong>${escapeHtml(session.handle)}</strong>.</p>
      <p class="code">${escapeHtml(code)}</p><form method="post" action="/device/approve">
      <input type="hidden" name="user_code" value="${escapeHtml(code)}"><input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
      <button type="submit">Authorize Longbow</button></form>`);
  }
  const encoded = encodeURIComponent(code);
  return page("Sign in", `<h1>Sign in to Flecha Packages</h1><p>Approve device <span class="code">${escapeHtml(code)}</span> by signing in.</p>
    <a href="/auth/github/start?user_code=${encoded}">Continue with GitHub</a>
    <a class="secondary" href="/auth/google/start?user_code=${encoded}">Continue with Google</a>`);
}

export async function approveDevice(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  requireSameOrigin(request, env);
  const session = await currentSession(request, env.REGISTRY_DB);
  if (!session) throw new HttpError(401, "sign in is required");
  const form = await request.formData();
  if (form.get("csrf") !== session.csrf_token) throw new HttpError(403, "invalid CSRF token");
  const code = normalizeUserCode(form.get("user_code"));
  const device = await findDeviceByUserCode(env.REGISTRY_DB, code);
  if (!device || device.status !== "pending" || device.expires_at <= now()) throw new HttpError(400, "device code is invalid or expired");
  await env.REGISTRY_DB
    .prepare(
      `UPDATE registry_device_authorizations SET status = 'approved', user_id = ?2
        WHERE device_code_sha256 = ?1 AND status = 'pending'`,
    )
    .bind(device.device_code_sha256, session.id)
    .run();
  return page("Longbow authorized", `<h1>Longbow is connected</h1><p>You can return to your terminal.</p><p><a href="/account">Manage account</a></p>`);
}

export async function loginPage(request: Request): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  return page("Sign in", `<h1>Flecha Packages</h1><p>Sign in or create your registry account.</p>
    <a href="/auth/github/start">Continue with GitHub</a>
    <a class="secondary" href="/auth/google/start">Continue with Google</a>`);
}

export async function accountPage(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  const session = await currentSession(request, env.REGISTRY_DB);
  if (!session) return Response.redirect(`${packagesOrigin(env)}/login`, 302);
  const memberships = await env.REGISTRY_DB
    .prepare("SELECT owner, role FROM registry_owner_memberships WHERE user_id = ?1 ORDER BY owner")
    .bind(session.id)
    .all<MembershipRow>();
  const owners = memberships.results.length
    ? `<ul>${memberships.results.map((item) => `<li><strong>${escapeHtml(item.owner)}</strong> — ${escapeHtml(item.role)}</li>`).join("")}</ul>`
    : "<p class=\"muted\">No owners yet. Claim one to publish packages.</p>";
  return page("Account", `<h1>${escapeHtml(session.display_name || session.handle)}</h1><p class="muted">${escapeHtml(session.email || "No email shared")}</p>
    <h2>Package owners</h2>${owners}<form method="post" action="/account/owners">
    <label for="owner">Claim an owner name</label><input id="owner" name="owner" pattern="[a-z][a-z0-9-]{0,38}[a-z0-9]|[a-z]" required>
    <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}"><button type="submit">Claim owner</button></form>
    <form method="post" action="/auth/logout"><input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
    <p><button class="secondary" type="submit">Sign out</button></p></form>`);
}

export async function logoutBrowser(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  requireSameOrigin(request, env);
  const raw = cookie(request, "flecha_session");
  const session = await currentSession(request, env.REGISTRY_DB);
  if (!raw || !session) throw new HttpError(401, "sign in is required");
  const form = await request.formData();
  if (form.get("csrf") !== session.csrf_token) throw new HttpError(403, "invalid CSRF token");
  await env.REGISTRY_DB
    .prepare("DELETE FROM registry_browser_sessions WHERE session_sha256 = ?1")
    .bind(await sha256Hex(raw))
    .run();
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${packagesOrigin(env)}/login`,
      "Set-Cookie": "flecha_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0",
      "Cache-Control": "no-store",
    },
  });
}

export async function claimOwner(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  requireSameOrigin(request, env);
  const session = await currentSession(request, env.REGISTRY_DB);
  if (!session) throw new HttpError(401, "sign in is required");
  const form = await request.formData();
  if (form.get("csrf") !== session.csrf_token) throw new HttpError(403, "invalid CSRF token");
  const owner = String(form.get("owner") || "").toLowerCase();
  if (!validIdentity(owner, "package") || owner.length > 40) throw new HttpError(400, "invalid owner name");
  if (RESERVED_OWNERS.has(owner)) throw new HttpError(409, "that owner name is reserved");
  try {
    await env.REGISTRY_DB.batch([
      env.REGISTRY_DB
        .prepare("INSERT INTO registry_owners(slug, display_name, created_by) VALUES (?1, ?1, ?2)")
        .bind(owner, session.id),
      env.REGISTRY_DB
        .prepare("INSERT INTO registry_owner_memberships(owner, user_id, role) VALUES (?1, ?2, 'owner')")
        .bind(owner, session.id),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) throw new HttpError(409, "that owner name is already claimed");
    throw error;
  }
  return Response.redirect(`${packagesOrigin(env)}/account`, 303);
}

export async function whoAmI(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "GET") throw methodNotAllowed("GET");
  const token = await authenticateToken(request, env.REGISTRY_DB);
  if (!token.userId) return json({ subject: token.subject, owners: [], automation: true });
  const user = await env.REGISTRY_DB
    .prepare("SELECT id, handle, display_name, email, email_verified FROM registry_users WHERE id = ?1")
    .bind(token.userId)
    .first<UserRow>();
  if (!user) throw new HttpError(401, "token user no longer exists");
  const memberships = await env.REGISTRY_DB
    .prepare("SELECT owner, role FROM registry_owner_memberships WHERE user_id = ?1 ORDER BY owner")
    .bind(user.id)
    .all<MembershipRow>();
  return json({
    handle: user.handle,
    display_name: user.display_name,
    email: user.email,
    email_verified: user.email_verified === 1,
    owners: memberships.results,
  });
}

export async function revokeCurrentToken(request: Request, env: IdentityEnv): Promise<Response> {
  if (request.method !== "POST") throw methodNotAllowed("POST");
  const token = await authenticateToken(request, env.REGISTRY_DB);
  await env.REGISTRY_DB
    .prepare("UPDATE registry_tokens SET revoked_at = unixepoch() WHERE token_sha256 = ?1")
    .bind(token.hash)
    .run();
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
