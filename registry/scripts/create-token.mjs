import { createHash, randomBytes } from 'node:crypto';
import { chmodSync, writeFileSync } from 'node:fs';

const values = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index];
  const value = process.argv[index + 1];
  if (!name?.startsWith('--') || value === undefined) {
    throw new Error(`invalid argument near ${name ?? '<end>'}`);
  }
  values.set(name.slice(2), value);
}

const owner = values.get('owner');
const packageName = values.get('package') ?? '*';
const subject = values.get('subject');
const permissions = new Set((values.get('permissions') ?? 'publish,yank').split(','));
const sqlFile = values.get('sql');
const expiresAt = values.get('expires-at');

if (!owner || !/^[a-z][a-z0-9_-]*$/.test(owner)) {
  throw new Error('--owner must be a lowercase registry owner');
}
if (packageName !== '*' && !/^[a-z][a-z0-9_-]*$/.test(packageName)) {
  throw new Error('--package must be * or a lowercase package name');
}
if (!subject || subject.length > 200 || /[\u0000-\u001f\u007f]/.test(subject)) {
  throw new Error('--subject is required and must be at most 200 printable characters');
}
if (
  permissions.size === 0 ||
  [...permissions].some((permission) => permission !== 'publish' && permission !== 'yank')
) {
  throw new Error('--permissions must be publish, yank, or publish,yank');
}
if (expiresAt !== undefined && (!/^[0-9]+$/.test(expiresAt) || Number(expiresAt) <= Date.now() / 1000)) {
  throw new Error('--expires-at must be a future Unix timestamp');
}

const quote = (value) => `'${value.replaceAll("'", "''")}'`;
const token = `flp_${randomBytes(32).toString('base64url')}`;
const tokenHash = createHash('sha256').update(token).digest('hex');
const expiry = expiresAt ?? 'NULL';
const sql = `PRAGMA foreign_keys = ON;
INSERT INTO registry_tokens(token_sha256, subject, expires_at)
VALUES (${quote(tokenHash)}, ${quote(subject)}, ${expiry});
INSERT INTO registry_token_scopes(token_sha256, owner, package, can_publish, can_yank)
VALUES (${quote(tokenHash)}, ${quote(owner)}, ${quote(packageName)}, ${permissions.has('publish') ? 1 : 0}, ${permissions.has('yank') ? 1 : 0});
`;

if (sqlFile) {
  writeFileSync(sqlFile, sql, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  chmodSync(sqlFile, 0o600);
  console.log(`Wrote hash-only provisioning SQL to ${sqlFile}`);
} else {
  console.log('\nHash-only provisioning SQL:\n');
  console.log(sql);
}
console.log('\nLongbow token (shown once; store it securely):\n');
console.log(token);
