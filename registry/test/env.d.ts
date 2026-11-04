declare namespace Cloudflare {
  interface Env {
    REGISTRY_DB: D1Database;
    PACKAGE_ARCHIVES: R2Bucket;
    AUTH_RATE_LIMITER: RateLimit;
    MUTATION_RATE_LIMITER: RateLimit;
    MAX_ARCHIVE_BYTES: string;
    TEST_MIGRATIONS: D1Migration[];
  }
}
