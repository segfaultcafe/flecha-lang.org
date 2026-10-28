import { applyD1Migrations, env } from "cloudflare:test";

await applyD1Migrations(env.REGISTRY_DB, env.TEST_MIGRATIONS);
