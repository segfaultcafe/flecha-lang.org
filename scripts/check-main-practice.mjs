import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mainPractice } from '../src/data/main-practice.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = join(siteRoot, 'src', 'content', 'docs');
const evidenceRoot = join(siteRoot, 'curriculum', 'main-evidence');
const failures = [];
const normalize = (value) => value.replace(/\r\n/g, '\n').trimEnd();
const routes = {
	'basic-modules': 'basic/modules-values-functions',
	'basic-control': 'basic/control-and-data',
	'basic-errors': 'basic/errors-and-tests',
	'basic-project': 'basic/project',
	'intermediate-ownership': 'intermediate/ownership-and-borrows',
	'intermediate-collections': 'intermediate/collections-and-generics',
	'intermediate-systems': 'intermediate/system-interfaces',
	'intermediate-project': 'intermediate/project',
	'advanced-contracts': 'advanced/contracts-and-builds',
	'advanced-native': 'advanced/native-and-performance',
	'advanced-failure': 'advanced/failure-and-api-design',
	'advanced-project': 'advanced/project',
	'unsafe-boundary': 'unsafe/boundary',
	'unsafe-native': 'unsafe/native-interop',
	'unsafe-containment': 'unsafe/containment',
};

const provenance = JSON.parse(readFileSync(join(evidenceRoot, 'provenance.json'), 'utf8'));
if (provenance.commit !== 'fc9576f22289b15abc5ad1ebf85eb1cdf541fac4' || provenance.toolchain !== '0.3.0') {
	failures.push('main practice provenance must name protected Flecha master fc9576f and toolchain 0.3.0');
}
for (const [id, practice] of Object.entries(mainPractice)) {
	if (!routes[id]) failures.push(`${id}: no main curriculum route`);
	if (!practice.goal?.trim() || !practice.goalPt?.trim()) failures.push(`${id}: missing EN/PT practice goal`);
	if (!Array.isArray(practice.commands) || practice.commands.length < 2) failures.push(`${id}: missing concrete command sequence`);
	if (typeof practice.expectedStdout !== 'string' || !Number.isInteger(practice.expectedStatus)) failures.push(`${id}: missing exact result`);
	const source = join(siteRoot, practice.source);
	if (!existsSync(source)) {
		failures.push(`${id}: missing evidence source ${practice.source}`);
	} else {
		const lines = readFileSync(source, 'utf8').split('\n').length;
		if (practice.start < 1 || practice.end < practice.start || practice.end > lines) failures.push(`${id}: invalid source range`);
	}
	for (const locale of ['en', 'pt-br']) {
		const file = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials', `${routes[id]}.mdx`);
		if (!existsSync(file)) failures.push(`${id}: missing ${locale} MDX practice page`);
		else if (!readFileSync(file, 'utf8').includes(`<MainPractice id="${id}" locale="${locale}" />`)) {
			failures.push(`${id}: ${locale} page does not render its validated practice`);
		}
	}
}
const unsafePages = ['src/content/docs/tutorials/unsafe/raw-memory.md', 'src/content/docs/pt-br/tutorials/unsafe/raw-memory.md'];
for (const relative of unsafePages) {
	const body = readFileSync(join(siteRoot, relative), 'utf8');
	for (const marker of ['```flecha', '```sh', '```text']) if (!body.includes(marker)) failures.push(`${relative}: missing ${marker} evidence`);
}
const walk = (directory) => {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'target') failures.push(`generated target directory leaked into evidence: ${path}`);
			else walk(path);
		}
	}
};
walk(evidenceRoot);

if (failures.length) {
	console.error(`Main curriculum practice validation failed (${failures.length}):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

const toolchainArg = process.argv.indexOf('--toolchain');
if (toolchainArg === -1) {
	console.log('Validated concrete code, commands, results, provenance, and EN/PT parity for 15 main-track practice checkpoints.');
	process.exit(0);
}
const toolchain = resolve(process.argv[toolchainArg + 1] ?? '');
const flecha = join(toolchain, 'bin', 'flecha');
const longbow = join(toolchain, 'bin', 'longbow');
if (!existsSync(flecha) || !existsSync(longbow)) throw new Error(`Invalid toolchain directory: ${toolchain}`);

const run = (command, args, { expectedStatus = 0, ...options } = {}) => {
	const result = spawnSync(command, args, { encoding: 'utf8', timeout: 90_000, ...options });
	if (result.error) throw result.error;
	if (result.status !== expectedStatus) throw new Error(`${basename(command)} ${args.join(' ')} returned ${result.status}\n${result.stdout}${result.stderr}`);
	return normalize(result.stdout);
};
const assertOutput = (label, actual, expected) => {
	if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
};

const workRoot = mkdtempSync(join(tmpdir(), 'main-practice-'));
try {
	cpSync(evidenceRoot, join(workRoot, 'main-evidence'), { recursive: true });
	cpSync(join(siteRoot, 'curriculum', 'fixtures', 'package-dry-run'), join(workRoot, 'package-dry-run'), { recursive: true });
	const singles = new Map(Object.values(mainPractice).filter((practice) => practice.kind === 'single').map((practice) => [practice.source, practice]));
	for (const practice of singles.values()) {
		const source = join(siteRoot, practice.source);
		const output = join(workRoot, basename(source, '.fl'));
		run(flecha, ['check', source]);
		run(flecha, ['build', source, '-o', output]);
		const stdout = run(output, [], { expectedStatus: practice.expectedStatus });
		assertOutput(practice.id, stdout, practice.expectedStdout);
		console.log(`${practice.id}: check, build, run, stdout, and exit status OK`);
	}

	const packagePath = join(workRoot, 'package-dry-run');
	run(longbow, ['check', packagePath]);
	const packageTests = run(longbow, ['test', packagePath]);
	run(longbow, ['build', packagePath]);
	assertOutput('basic-project', packageTests, mainPractice['basic-project'].expectedStdout);

	const workspace = join(workRoot, 'main-evidence', 'projects', 'workspace_guard');
	run(longbow, ['check', workspace]);
	run(longbow, ['test', workspace]);
	run(longbow, ['build', workspace]);
	const workspaceHelp = run(longbow, ['run', workspace, '--', 'help']);
	assertOutput('workspace help', workspaceHelp, mainPractice['intermediate-project'].expectedStdout);

	const ledger = join(workRoot, 'main-evidence', 'projects', 'ledger');
	run(longbow, ['check', ledger]);
	const ledgerTests = run(longbow, ['test', ledger]);
	run(longbow, ['build', ledger]);
	const ledgerHelp = run(longbow, ['run', ledger, '--', 'help']);
	assertOutput('ledger failure/API help', ledgerHelp, mainPractice['advanced-failure'].expectedStdout);
	assertOutput('ledger qualification', `${ledgerTests}\n${ledgerHelp}`, mainPractice['advanced-project'].expectedStdout);
} finally {
	rmSync(workRoot, { recursive: true, force: true });
}

console.log('Qualified all main-track practice programs with official Flecha/Longbow 0.3.0.');
