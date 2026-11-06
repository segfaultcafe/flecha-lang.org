import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { curriculumLessons, curriculumPath } from '../src/data/curriculum.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = join(siteRoot, 'curriculum', 'fixtures');
const contentRoot = join(siteRoot, 'src', 'content', 'docs');

const failures = [];
const markedBlocks = new Map();
const normalize = (value) => value.replace(/\r\n/g, '\n').trimEnd();

for (const locale of ['en', 'pt-br']) {
	for (const lesson of curriculumLessons) {
		const base = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials', lesson.slug);
		const file = existsSync(`${base}.mdx`) ? `${base}.mdx` : `${base}.md`;
		if (!existsSync(file)) {
			failures.push(`missing ${locale} curriculum page: ${file}`);
			continue;
		}
		const markdown = readFileSync(file, 'utf8');
		for (const match of markdown.matchAll(/```(flecha|sh|text)([^\n]*)\n([\s\S]*?)```/g)) {
			const [, language, metadata, body] = match;
			const test = metadata.match(/\btest="([^"]+)"/)?.[1];
			if (!test) {
				failures.push(`${file}: executable ${language} block is missing test="..."`);
				continue;
			}
			const key = `${test}:${language}`;
			const values = markedBlocks.get(key) ?? new Set();
			values.add(normalize(body));
			markedBlocks.set(key, values);
		}
	}
}

const fixture = (...parts) => normalize(readFileSync(join(fixtureRoot, ...parts), 'utf8'));
const expectedBlocks = new Map([
	['hello-archer:flecha', new Set([fixture('hello-archer', 'src', 'main.fl')])],
	['hello-archer:sh', new Set([
		'longbow new hello-archer\ncd hello-archer',
		'longbow check\nlongbow run',
	])],
	['hello-archer:text', new Set(['Hello, Archer!'])],
	['archer-cli:flecha', new Set([fixture('archer-cli', 'src', 'main.fl')])],
	['archer-cli:sh', new Set([
		'longbow new archer-greet\ncd archer-greet',
		'longbow check\nlongbow run -- Fauna',
	])],
	['archer-cli:text', new Set(['Welcome, Fauna!'])],
	['package-dry-run:sh', new Set([
		'longbow new archer-words --lib\ncd archer-words',
		'longbow check\nlongbow test\nlongbow build\nlongbow publish --dry-run',
	])],
	['unsafe-first:flecha', new Set([
		fixture('unsafe-first', 'safe.fl'),
		fixture('unsafe-first', 'unsafe.fl'),
	])],
	['unsafe-first-run:sh', new Set([
		'flecha check curriculum/fixtures/unsafe-first/safe.fl\nflecha build curriculum/fixtures/unsafe-first/safe.fl -o build/safe-first\nbuild/safe-first\nflecha check curriculum/fixtures/unsafe-first/unsafe.fl\nflecha build curriculum/fixtures/unsafe-first/unsafe.fl -o build/unsafe-first\nbuild/unsafe-first',
	])],
	['unsafe-first-run:text', new Set(['42\n42'])],
]);

for (const [key, expected] of expectedBlocks) {
	const actual = markedBlocks.get(key);
	if (!actual || actual.size !== expected.size || [...expected].some((value) => !actual.has(value))) {
		failures.push(`${key}: marked documentation block differs from its curated fixture/expectation`);
	}
}
for (const key of markedBlocks.keys()) {
	if (!expectedBlocks.has(key)) failures.push(`${key}: no curated curriculum smoke expectation`);
}

const tutorialFiles = (locale) => {
	const root = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials');
	const output = [];
	const walk = (directory) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) walk(path);
			else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) output.push(path);
		}
	};
	walk(root);
	return output;
};

for (const locale of ['en', 'pt-br']) {
	const expected = new Set(curriculumLessons.map((lesson) => curriculumPath(lesson.slug, locale)));
	if (expected.size !== curriculumLessons.length) failures.push(`${locale}: duplicate curriculum route`);
	for (const file of tutorialFiles(locale)) {
		if (/\/(first-project|command-line-app|publish-package)\.md$/.test(file)) continue;
		if (file.includes(`${join('tutorials', 'arrowfall')}/`)) continue;
		const relative = file.slice(join(contentRoot, locale === 'pt-br' ? 'pt-br' : '').length)
			.replace(/\.mdx?$/, '/').replaceAll('\\', '/');
		const route = `${locale === 'pt-br' ? '/pt-br' : ''}${relative}`;
		if (!expected.has(route)) failures.push(`${locale}: tutorial page is outside centralized order: ${route}`);
	}
}

if (failures.length) {
	console.error(`Curriculum source validation failed (${failures.length}):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

const toolchainArg = process.argv.indexOf('--toolchain');
if (toolchainArg === -1) {
	console.log(`Validated ${curriculumLessons.length} curriculum routes in EN/PT and all marked snippets.`);
	process.exit(0);
}
const toolchain = resolve(process.argv[toolchainArg + 1] ?? '');
const flecha = join(toolchain, 'bin', 'flecha');
const longbow = join(toolchain, 'bin', 'longbow');
if (!existsSync(flecha) || !existsSync(longbow)) throw new Error(`Invalid toolchain directory: ${toolchain}`);

const run = (command, args, options = {}) => {
	const result = spawnSync(command, args, { encoding: 'utf8', ...options });
	const expectedStatus = options.expectedStatus ?? 0;
	if (result.error) throw result.error;
	if (result.status !== expectedStatus) {
		throw new Error(`${basename(command)} ${args.join(' ')} returned ${result.status}, expected ${expectedStatus}\n${result.stdout}${result.stderr}`);
	}
	return { stdout: normalize(result.stdout), stderr: normalize(result.stderr) };
};
const assertOutput = (label, actual, expected) => {
	if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
};

assertOutput('flecha version', run(flecha, ['--version']).stdout, 'flecha 0.3.0');
assertOutput('longbow version', run(longbow, ['--version']).stdout, 'longbow 0.3.0');

const workRoot = mkdtempSync(join(tmpdir(), 'flecha-curriculum-'));
try {
	run(longbow, ['new', 'hello-archer'], { cwd: workRoot });
	const hello = join(workRoot, 'hello-archer');
	cpSync(join(fixtureRoot, 'hello-archer', 'src', 'main.fl'), join(hello, 'src', 'main.fl'));
	run(longbow, ['check'], { cwd: hello });
	assertOutput('hello-archer stdout', run(longbow, ['run'], { cwd: hello }).stdout, 'Hello, Archer!');

	run(longbow, ['new', 'archer-greet'], { cwd: workRoot });
	const cli = join(workRoot, 'archer-greet');
	cpSync(join(fixtureRoot, 'archer-cli', 'src', 'main.fl'), join(cli, 'src', 'main.fl'));
	run(longbow, ['check'], { cwd: cli });
	assertOutput('archer-cli stdout', run(longbow, ['run', '--', 'Fauna'], { cwd: cli }).stdout, 'Welcome, Fauna!');
	const usage = run(longbow, ['run'], { cwd: cli, expectedStatus: 2 });
	assertOutput('archer-cli empty stdout', usage.stdout, '');
	assertOutput('archer-cli usage stderr', usage.stderr, 'usage: archer-greet <name>');

	run(longbow, ['new', 'archer-words', '--lib'], { cwd: workRoot });
	const packageFixture = join(workRoot, 'archer-words');
	cpSync(join(fixtureRoot, 'package-dry-run'), packageFixture, { recursive: true, force: true });
	for (const command of ['check', 'test', 'build']) run(longbow, [command], { cwd: packageFixture });
	const publication = run(longbow, ['publish', '--dry-run'], { cwd: packageFixture }).stdout;
	if (!publication.startsWith('flecha-docs/archer-words@0.1.0\n') || !publication.includes('\nsha256:')) {
		throw new Error(`package dry run produced unexpected output:\n${publication}`);
	}

	for (const source of ['safe', 'unsafe']) {
		const input = join(fixtureRoot, 'unsafe-first', `${source}.fl`);
		const output = join(workRoot, source);
		run(flecha, ['check', input]);
		run(flecha, ['build', input, '-o', output]);
		assertOutput(`${source} raw-memory stdout`, run(output, []).stdout, '42');
	}
} finally {
	rmSync(workRoot, { recursive: true, force: true });
}

console.log(`Qualified all marked curriculum snippets with Flecha and Longbow 0.3.0.`);
