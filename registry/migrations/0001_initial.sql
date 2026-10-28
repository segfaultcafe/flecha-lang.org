PRAGMA foreign_keys = ON;

CREATE TABLE registry_tokens (
    token_sha256 TEXT PRIMARY KEY
        CHECK (length(token_sha256) = 64),
    subject TEXT NOT NULL
        CHECK (length(subject) BETWEEN 1 AND 200),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER,
    revoked_at INTEGER
);

CREATE TABLE registry_token_scopes (
    token_sha256 TEXT NOT NULL,
    owner TEXT NOT NULL,
    package TEXT NOT NULL DEFAULT '*',
    can_publish INTEGER NOT NULL DEFAULT 0
        CHECK (can_publish IN (0, 1)),
    can_yank INTEGER NOT NULL DEFAULT 0
        CHECK (can_yank IN (0, 1)),
    PRIMARY KEY (token_sha256, owner, package),
    FOREIGN KEY (token_sha256)
        REFERENCES registry_tokens(token_sha256) ON DELETE CASCADE
);

CREATE INDEX registry_token_scopes_owner_package
    ON registry_token_scopes(owner, package);

CREATE TABLE registry_packages (
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (owner, name)
);

CREATE TABLE registry_releases (
    owner TEXT NOT NULL,
    package TEXT NOT NULL,
    version TEXT NOT NULL,
    version_key TEXT NOT NULL,
    checksum TEXT NOT NULL
        CHECK (length(checksum) = 71),
    archive_key TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'active'
        CHECK (state IN ('active', 'yanked')),
    published_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_by TEXT NOT NULL,
    yanked_at INTEGER,
    yanked_by TEXT,
    PRIMARY KEY (owner, package, version),
    UNIQUE (owner, package, version_key),
    FOREIGN KEY (owner, package)
        REFERENCES registry_packages(owner, name) ON DELETE RESTRICT
);

CREATE INDEX registry_releases_package
    ON registry_releases(owner, package, version);

CREATE INDEX registry_releases_archive_key
    ON registry_releases(archive_key);
