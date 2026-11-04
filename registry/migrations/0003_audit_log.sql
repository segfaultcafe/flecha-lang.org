PRAGMA foreign_keys = ON;

CREATE TABLE registry_audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occurred_at INTEGER NOT NULL DEFAULT (unixepoch()),
    action TEXT NOT NULL
        CHECK (action IN (
            'owner.claim',
            'package.publish',
            'package.yank',
            'token.issue',
            'token.revoke'
        )),
    actor TEXT NOT NULL
        CHECK (length(actor) BETWEEN 1 AND 200),
    owner TEXT,
    package TEXT,
    version TEXT,
    details TEXT NOT NULL DEFAULT '{}'
        CHECK (json_valid(details))
);

CREATE INDEX registry_audit_events_occurred_at
    ON registry_audit_events(occurred_at, id);

CREATE INDEX registry_audit_events_package
    ON registry_audit_events(owner, package, version, occurred_at);

CREATE TRIGGER registry_audit_events_no_update
BEFORE UPDATE ON registry_audit_events
BEGIN
    SELECT RAISE(ABORT, 'registry audit events are append-only');
END;

CREATE TRIGGER registry_audit_events_no_delete
BEFORE DELETE ON registry_audit_events
BEGIN
    SELECT RAISE(ABORT, 'registry audit events are append-only');
END;
