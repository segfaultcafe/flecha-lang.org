import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const script of ['check-curriculum.mjs', 'check-main-practice.mjs', 'check-arrowfall.mjs']) {
	const result = spawnSync(process.execPath, [join(root, 'scripts', script), ...process.argv.slice(2)], {
		cwd: root,
		encoding: 'utf8',
		stdio: 'inherit',
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
