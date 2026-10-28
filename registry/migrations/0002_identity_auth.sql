PRAGMA foreign_keys = ON;

CREATE TABLE registry_users (
    id TEXT PRIMARY KEY,
    handle TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0
        CHECK (email_verified IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE registry_oauth_identities (
    provider TEXT NOT NULL
        CHECK (provider IN ('github', 'google')),
    provider_subject TEXT NOT NULL,
    user_id TEXT NOT NULL,
    provider_handle TEXT,
    email TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0
        CHECK (email_verified IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (provider, provider_subject),
    FOREIGN KEY (user_id)
        REFERENCES registry_users(id) ON DELETE CASCADE
);

CREATE INDEX registry_oauth_identities_user
    ON registry_oauth_identities(user_id);

CREATE TABLE registry_owners (
    slug TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (created_by)
        REFERENCES registry_users(id) ON DELETE RESTRICT
);

CREATE TABLE registry_owner_memberships (
    owner TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('owner', 'admin', 'publisher')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (owner, user_id),
    FOREIGN KEY (owner)
        REFERENCES registry_owners(slug) ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES registry_users(id) ON DELETE CASCADE
);

CREATE INDEX registry_owner_memberships_user
    ON registry_owner_memberships(user_id, owner);

CREATE TABLE registry_browser_sessions (
    session_sha256 TEXT PRIMARY KEY
        CHECK (length(session_sha256) = 64),
    user_id TEXT NOT NULL,
    csrf_token TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id)
        REFERENCES registry_users(id) ON DELETE CASCADE
);

CREATE INDEX registry_browser_sessions_user
    ON registry_browser_sessions(user_id);

CREATE TABLE registry_device_authorizations (
    device_code_sha256 TEXT PRIMARY KEY
        CHECK (length(device_code_sha256) = 64),
    user_code_sha256 TEXT NOT NULL UNIQUE
        CHECK (length(user_code_sha256) = 64),
    client_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'denied', 'consumed')),
    user_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 5,
    last_polled_at INTEGER,
    FOREIGN KEY (user_id)
        REFERENCES registry_users(id) ON DELETE CASCADE
);

CREATE INDEX registry_device_authorizations_expiry
    ON registry_device_authorizations(expires_at);

CREATE TABLE registry_oauth_requests (
    state_sha256 TEXT PRIMARY KEY
        CHECK (length(state_sha256) = 64),
    provider TEXT NOT NULL
        CHECK (provider IN ('github', 'google')),
    code_verifier TEXT NOT NULL,
    nonce TEXT,
    device_code_sha256 TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (device_code_sha256)
        REFERENCES registry_device_authorizations(device_code_sha256)
        ON DELETE CASCADE
);

CREATE INDEX registry_oauth_requests_expiry
    ON registry_oauth_requests(expires_at);

ALTER TABLE registry_tokens ADD COLUMN user_id TEXT;
ALTER TABLE registry_tokens ADD COLUMN label TEXT;
ALTER TABLE registry_tokens ADD COLUMN last_used_at INTEGER;

CREATE INDEX registry_tokens_user
    ON registry_tokens(user_id);
