import { HttpError } from "./errors";
import { sha256Hex } from "./validation";

export type RegistryPermission = "publish" | "yank";

interface TokenRow {
  subject: string;
  expires_at: number | null;
  revoked_at: number | null;
}

interface ScopeRow {
  can_publish: number;
  can_yank: number;
}

export async function authorize(
  request: Request,
  database: D1Database,
  owner: string,
  packageName: string,
  permission: RegistryPermission,
): Promise<string> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length <= "Bearer ".length) {
    throw new HttpError(401, "a bearer token is required", {
      "WWW-Authenticate": 'Bearer realm="flecha-registry"',
    });
  }
  const token = authorization.slice("Bearer ".length);
  if (token.length > 512 || /[\u0000-\u001f\u007f]/.test(token)) {
    throw new HttpError(401, "invalid bearer token", {
      "WWW-Authenticate": 'Bearer realm="flecha-registry"',
    });
  }

  const tokenHash = await sha256Hex(token);
  const tokenRow = await database
    .prepare(
      `SELECT subject, expires_at, revoked_at
         FROM registry_tokens
        WHERE token_sha256 = ?1`,
    )
    .bind(tokenHash)
    .first<TokenRow>();
  const now = Math.floor(Date.now() / 1000);
  if (!tokenRow || tokenRow.revoked_at !== null || (tokenRow.expires_at !== null && tokenRow.expires_at <= now)) {
    throw new HttpError(401, "invalid or expired bearer token", {
      "WWW-Authenticate": 'Bearer realm="flecha-registry", error="invalid_token"',
    });
  }

  const scope = await database
    .prepare(
      `SELECT can_publish, can_yank
         FROM registry_token_scopes
        WHERE token_sha256 = ?1
          AND owner = ?2
          AND package IN (?3, '*')
        ORDER BY CASE WHEN package = ?3 THEN 0 ELSE 1 END
        LIMIT 1`,
    )
    .bind(tokenHash, owner, packageName)
    .first<ScopeRow>();
  if (!scope || (permission === "publish" ? scope.can_publish !== 1 : scope.can_yank !== 1)) {
    throw new HttpError(403, `token cannot ${permission} ${owner}/${packageName}`);
  }
  return tokenRow.subject;
}
