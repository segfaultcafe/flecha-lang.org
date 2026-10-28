declare namespace Cloudflare {
  interface Env {
    REGISTRY_DB: D1Database;
    PACKAGE_ARCHIVES: R2Bucket;
    MAX_ARCHIVE_BYTES: string;
    TEST_MIGRATIONS: D1Migration[];
  }
}
