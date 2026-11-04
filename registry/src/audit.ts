export interface AuditEvent {
  action: "owner.claim" | "package.publish" | "package.yank" | "token.issue" | "token.revoke";
  actor: string;
  owner?: string;
  packageName?: string;
  version?: string;
  details?: Record<string, string | number | boolean | null>;
}

export function insertAuditEvent(database: D1Database, event: AuditEvent): D1PreparedStatement {
  return database
    .prepare(
      `INSERT INTO registry_audit_events(
         action, actor, owner, package, version, details
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      event.action,
      event.actor,
      event.owner ?? null,
      event.packageName ?? null,
      event.version ?? null,
      JSON.stringify(event.details ?? {}),
    );
}
