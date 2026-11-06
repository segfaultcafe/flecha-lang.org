import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arrowfallLessons, arrowfallPath } from '../src/data/arrowfall.mjs';
import { mainPractice } from '../src/data/main-practice.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const failures = [];
const normalize = (value) => value.replace(/\r\n/g, '\n').trimEnd();
const decode = (value) => value
	.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
	.replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
	.replaceAll('&quot;', '"')
	.replaceAll('&#39;', "'")
	.replaceAll('&lt;', '<')
	.replaceAll('&gt;', '>')
	.replaceAll('&amp;', '&')
	.replaceAll('\x7f', '\n');
const codeByTitle = (html) => {
	const blocks = new Map();
	for (const figure of html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)) {
		const title = figure[0].match(/<span class="title">([\s\S]*?)<\/span>/)?.[1];
		const code = figure[0].match(/data-code="([^"]*)"/)?.[1];
		if (title !== undefined && code !== undefined) blocks.set(decode(title), normalize(decode(code)));
	}
	return blocks;
};
const filesUnder = (directory) => readdirSync(directory, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile())
	.map((entry) => relative(directory, join(entry.parentPath, entry.name)))
	.sort();
const assertBlock = (route, blocks, title, expected) => {
	const actual = blocks.get(title);
	if (actual === undefined) failures.push(`${route}: missing rendered code block ${JSON.stringify(title)}`);
	else if (actual !== normalize(expected)) failures.push(`${route}: rendered block ${JSON.stringify(title)} is not byte-equivalent to its committed source`);
};

const mainRoutes = {
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

for (const locale of ['en', 'pt-br']) {
	for (const [id, practice] of Object.entries(mainPractice)) {
		const route = `${locale === 'pt-br' ? '/pt-br' : ''}/tutorials/${mainRoutes[id]}/`;
		const htmlPath = join(dist, route, 'index.html');
		if (!existsSync(htmlPath)) {
			failures.push(`${route}: missing built page`);
			continue;
		}
		const blocks = codeByTitle(readFileSync(htmlPath, 'utf8'));
		const source = readFileSync(join(root, practice.source), 'utf8');
		if (practice.kind === 'single') {
			assertBlock(route, blocks, practice.source, source);
		} else {
			const excerpt = source.split('\n').slice(practice.start - 1, practice.end).join('\n');
			assertBlock(route, blocks, `${practice.source} (excerpt)`, excerpt);
			const projectRoot = dirname(dirname(practice.source));
			const sourceRoot = join(root, projectRoot, 'src');
			const files = ['longbow.toml', 'longbow.lock', ...filesUnder(sourceRoot).map((file) => join('src', file))]
				.filter((file) => existsSync(join(root, projectRoot, file)));
			for (const file of files) assertBlock(route, blocks, file, readFileSync(join(root, projectRoot, file), 'utf8'));
		}
		assertBlock(route, blocks, locale === 'pt-br' ? 'Comandos' : 'Commands', practice.commands.join('\n'));
		const output = practice.expectedStdout || (locale === 'pt-br' ? '(stdout vazio)' : '(empty stdout)');
		assertBlock(route, blocks, locale === 'pt-br' ? 'Saída esperada' : 'Expected output', `${output}\n${locale === 'pt-br' ? 'status de saída' : 'exit status'}: ${practice.expectedStatus}`);
	}
}

const arrowfallRoot = join(root, 'curriculum', 'arrowfall', 'checkpoints');
for (const locale of ['en', 'pt-br']) {
	for (const lesson of arrowfallLessons) {
		const route = arrowfallPath(lesson.slug, locale);
		const htmlPath = join(dist, route, 'index.html');
		if (!existsSync(htmlPath)) {
			failures.push(`${route}: missing built page`);
			continue;
		}
		const blocks = codeByTitle(readFileSync(htmlPath, 'utf8'));
		const checkpoint = join(arrowfallRoot, lesson.id);
		for (const snippet of lesson.snippets) {
			const source = readFileSync(join(checkpoint, snippet.file), 'utf8');
			const excerpt = source.split('\n').slice(snippet.start - 1, snippet.end).join('\n');
			assertBlock(route, blocks, `${snippet.file}:${snippet.start}-${snippet.end} (excerpt)`, excerpt);
		}
		const sourceFiles = ['longbow.toml', 'longbow.lock', ...filesUnder(join(checkpoint, 'src')).map((file) => join('src', file))];
		const scripts = join(checkpoint, 'scripts');
		if (existsSync(scripts)) sourceFiles.push(...filesUnder(scripts).map((file) => join('scripts', file)));
		for (const file of sourceFiles) assertBlock(route, blocks, file, readFileSync(join(checkpoint, file), 'utf8'));
		const deliverable = JSON.parse(readFileSync(join(root, 'curriculum', 'arrowfall', 'manifest.json'), 'utf8')).deliverables.find((item) => item.id === lesson.id);
		assertBlock(route, blocks, locale === 'pt-br' ? 'Comandos de verificação' : 'Verification commands', deliverable.commands.join('\n'));
		assertBlock(route, blocks, locale === 'pt-br' ? 'Stdout esperada' : 'Expected stdout', readFileSync(join(checkpoint, 'tests', 'output.txt'), 'utf8'));
	}
}

if (failures.length) {
	console.error(`Published-code validation failed (${failures.length}):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log('Validated byte-equivalence between rendered EN/PT code blocks and all compiled main-track and Arrowfall sources/excerpts.');
