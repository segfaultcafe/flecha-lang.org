import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { arrowfallLessons } from '../src/data/arrowfall.mjs';
import { arrowfallPath } from '../src/data/arrowfall.mjs';
import { arrowfallNarrative } from '../src/data/arrowfall-narrative.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotRoot = join(siteRoot, 'curriculum', 'arrowfall');
const checkpointRoot = join(snapshotRoot, 'checkpoints');
const contentRoot = join(siteRoot, 'src', 'content', 'docs');
const publicFrameRoot = join(siteRoot, 'public', 'arrowfall', 'frames');
const manifest = JSON.parse(readFileSync(join(snapshotRoot, 'manifest.json'), 'utf8'));
const provenance = JSON.parse(readFileSync(join(snapshotRoot, 'provenance.json'), 'utf8'));
const failures = [];
const narrativeCounts = [];

const expectedCommit = '56bb003740c8a7ddc7ab8aa6215609768f49d85e';
const expectedRelease = '6dcea41dbdbee65773747b8474780977b6bb5fd0';
const normalize = (value) => value.replace(/\r\n/g, '\n').trimEnd();
const allFiles = (root) => {
	const files = [];
	const walk = (directory) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) walk(path);
			else files.push(path);
		}
	};
	walk(root);
	return files;
};

if (provenance.commit !== expectedCommit) failures.push(`snapshot commit is ${provenance.commit}, expected ${expectedCommit}`);
if (provenance.release_commit !== expectedRelease) failures.push(`release commit is ${provenance.release_commit}, expected ${expectedRelease}`);
if (provenance.flecha !== '0.3.0' || manifest.toolchain.version !== '0.3.0') failures.push('snapshot must use Flecha 0.3.0');
if (manifest.toolchain.tag_commit !== expectedRelease) failures.push('manifest release commit differs from provenance');
if (manifest.style.braces !== 'K&R expanded bodies'
	|| manifest.style.types !== 'PascalCase'
	|| manifest.style.member_functions !== 'camelCase'
	|| manifest.style.free_functions !== 'snake_case') {
	failures.push('manifest style contract changed');
}
if (manifest.deliverables.length !== 7 || arrowfallLessons.length !== 7) {
	failures.push('Arrowfall curriculum must have exactly seven cumulative checkpoints');
}

for (const [index, lesson] of arrowfallLessons.entries()) {
	const deliverable = manifest.deliverables[index];
	if (!deliverable || deliverable.id !== lesson.id || deliverable.order !== index + 1) {
		failures.push(`manifest order differs at lesson ${index + 1}`);
		continue;
	}
	const expectedPredecessor = index ? arrowfallLessons[index - 1].id : null;
	if (deliverable.predecessor !== expectedPredecessor) failures.push(`${lesson.id}: wrong predecessor`);
	for (const field of ['title', 'titlePt', 'built', 'builtPt', 'limitation', 'limitationPt', 'desired', 'desiredPt', 'decision', 'decisionPt', 'concept', 'conceptPt', 'challenge', 'challengePt', 'next', 'nextPt']) {
		if (!lesson[field]?.trim()) failures.push(`${lesson.id}: missing bilingual lesson field ${field}`);
	}
	for (const field of ['changes', 'changesPt', 'references', 'referencesPt', 'snippets']) {
		if (!Array.isArray(lesson[field]) || !lesson[field].length) failures.push(`${lesson.id}: missing ${field}`);
	}
	const narrative = arrowfallNarrative[lesson.id];
	if (!narrative) {
		failures.push(`${lesson.id}: missing structured tutorial narrative`);
	} else {
		const requiredTerms = {
			'01-scene': { en: ['visual contract', 'stdoutln', 'invariant'], 'pt-br': ['contrato visual', 'stdoutln', 'invariante'] },
			'02-state': { en: ['source of truth', 'const reference', 'traverses'], 'pt-br': ['fonte de verdade', 'referência', 'percorre'] },
			'03-movement': { en: ['normalization', 'mutable checked reference', 'delta'], 'pt-br': ['normalização', 'referência mutável verificada', 'delta'] },
			'04-map': { en: ['row-major', 'checked slice', 'no-op'], 'pt-br': ['ordem por linhas', 'slice const verificado', 'no-op'] },
			'05-goblin': { en: ['DANGER_BEFORE', 'spentTurn', 'CLI', 'no-op'], 'pt-br': ['DANGER_BEFORE', 'spentTurn', 'CLI', 'no-op'] },
			'06-archery': { en: ['line-of-sight', 'arrowCount', 'goblinAlive'], 'pt-br': ['linha de visão', 'arrowCount', 'goblinAlive'] },
			'07-final': { en: ['sourceSeed', 'Generator', 'golden'], 'pt-br': ['sourceSeed', 'Generator', 'golden'] },
		}[lesson.id];
		for (const locale of ['en', 'pt-br']) {
			const text = narrative[locale];
			if (!text) {
				failures.push(`${lesson.id}: missing ${locale} narrative`);
				continue;
			}
			for (const [field, minimum] of [['context', 2], ['model', 3], ['run', 2], ['conclusion', 2]]) {
				if (!Array.isArray(text[field]) || text[field].length < minimum || text[field].some((paragraph) => !paragraph.trim())) {
					failures.push(`${lesson.id}: ${locale} ${field} lacks the required multi-paragraph technical narrative`);
				}
			}
			if (!Array.isArray(text.snippets) || text.snippets.length !== lesson.snippets.length) {
				failures.push(`${lesson.id}: ${locale} narrative must explain every published excerpt`);
			} else {
				for (const [snippetIndex, explanation] of text.snippets.entries()) {
					if (!Array.isArray(explanation.before) || explanation.before.length < 1
						|| !Array.isArray(explanation.after) || explanation.after.length < 2) {
						failures.push(`${lesson.id}: ${locale} excerpt ${snippetIndex + 1} needs context before and consequences after the code`);
					}
				}
			}
			const fullText = [...text.context, ...text.model, ...text.run, ...text.conclusion,
				...text.snippets.flatMap((snippet) => [...snippet.before, ...snippet.after])].join('\n');
			for (const term of requiredTerms[locale]) {
				if (!fullText.includes(term)) failures.push(`${lesson.id}: ${locale} narrative does not explain required concept ${JSON.stringify(term)}`);
			}
			const paragraphs = text.context.length + text.model.length + text.run.length + text.conclusion.length
				+ text.snippets.reduce((total, snippet) => total + snippet.before.length + snippet.after.length, 0);
			narrativeCounts.push(`${lesson.id} ${locale}: ${paragraphs} paragraphs, ${lesson.snippets.length} excerpts`);
		}
	}

	const checkpoint = join(checkpointRoot, lesson.id);
	for (const required of ['README.md', 'longbow.toml', 'longbow.lock', 'tests/input.txt', 'tests/output.txt', 'tests/frame.txt', 'tests/frame.svg']) {
		if (!existsSync(join(checkpoint, required))) failures.push(`${lesson.id}: missing ${required}`);
	}
	if (!existsSync(join(snapshotRoot, 'diffs', `${lesson.id}.patch`))) failures.push(`${lesson.id}: missing exact predecessor diff`);
	for (const snippet of lesson.snippets) {
		const path = join(checkpoint, snippet.file);
		if (!existsSync(path)) {
			failures.push(`${lesson.id}: snippet source does not exist: ${snippet.file}`);
			continue;
		}
		const lines = readFileSync(path, 'utf8').split('\n').length;
		if (snippet.start < 1 || snippet.end < snippet.start || snippet.end > lines) {
			failures.push(`${lesson.id}: invalid snippet range ${snippet.file}:${snippet.start}-${snippet.end}`);
		}
		if (!snippet.label?.trim() || !snippet.labelPt?.trim()) failures.push(`${lesson.id}: snippet label lacks EN/PT parity`);
	}
	const sourceFrame = readFileSync(join(checkpoint, 'tests', 'frame.svg'));
	const publicFrame = join(publicFrameRoot, `${lesson.id}.svg`);
	if (!existsSync(publicFrame) || !sourceFrame.equals(readFileSync(publicFrame))) {
		failures.push(`${lesson.id}: published SVG is not byte-equivalent to the qualified frame`);
	}

	const rootPath = `tutorial/checkpoints/${lesson.id}`;
	const expectedCommands = [
		`longbow check ${rootPath}`,
		`longbow test ${rootPath}`,
		`longbow build ${rootPath}`,
		lesson.id === '07-final'
			? `longbow run ${rootPath} -- --no-clear --seed 20261105 < ${rootPath}/tests/input.txt`
			: `longbow run ${rootPath} < ${rootPath}/tests/input.txt`,
	];
	if (lesson.id === '07-final') expectedCommands.push(`LONGBOW=longbow ${rootPath}/scripts/check-golden.sh`);
	if (JSON.stringify(deliverable.commands) !== JSON.stringify(expectedCommands)) {
		failures.push(`${lesson.id}: documented command sequence differs from the qualified manifest`);
	}
}

for (const file of allFiles(snapshotRoot)) {
	if (file.split('/').includes('target')) failures.push(`generated target directory leaked into snapshot: ${file}`);
}

const tutorialFiles = (locale) => {
	const root = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials');
	return allFiles(root).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
};
for (const locale of ['en', 'pt-br']) {
	const expected = new Set(arrowfallLessons.map((lesson) => arrowfallPath(lesson.slug, locale)));
	if (expected.size !== arrowfallLessons.length) failures.push(`${locale}: duplicate Arrowfall route`);
	for (const lesson of arrowfallLessons) {
		const file = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials', `${lesson.slug}.mdx`);
		if (!existsSync(file)) {
			failures.push(`missing ${locale} curriculum page: ${file}`);
			continue;
		}
		const body = readFileSync(file, 'utf8');
		if (!body.includes(`<ArrowfallLesson id="${lesson.id}" locale="${locale}" />`)) {
			failures.push(`${file}: wrapper does not render the canonical ${lesson.id} lesson`);
		}
	}
	const arrowfallRoot = join(contentRoot, locale === 'pt-br' ? 'pt-br' : '', 'tutorials', 'arrowfall');
	for (const file of tutorialFiles(locale).filter((path) => path.startsWith(arrowfallRoot))) {
		const relativePath = relative(join(contentRoot, locale === 'pt-br' ? 'pt-br' : ''), file).replace(/\.mdx?$/, '/').replaceAll('\\', '/');
		const route = `${locale === 'pt-br' ? '/pt-br' : ''}/${relativePath}`;
		if (!expected.has(route)) failures.push(`${locale}: Arrowfall page is outside its centralized order: ${route}`);
	}
}

if (failures.length) {
	console.error(`Arrowfall curriculum source validation failed (${failures.length}):`);
	for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
	process.exit(1);
}

console.log('Arrowfall narrative coverage:');
for (const count of narrativeCounts) console.log(`- ${count}`);

const toolchainArg = process.argv.indexOf('--toolchain');
if (toolchainArg === -1) {
	console.log('Validated seven frozen Arrowfall checkpoints, exact frames/commands/snippet ranges, and EN/PT routes.');
	process.exit(0);
}

const toolchain = resolve(process.argv[toolchainArg + 1] ?? '');
const flecha = join(toolchain, 'bin', 'flecha');
const longbow = join(toolchain, 'bin', 'longbow');
if (!existsSync(flecha) || !existsSync(longbow)) throw new Error(`Invalid toolchain directory: ${toolchain}`);

const run = (command, args, { expectedStatus = 0, ...options } = {}) => {
	const result = spawnSync(command, args, { encoding: 'utf8', timeout: 90_000, ...options });
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

const workRoot = mkdtempSync(join(tmpdir(), 'arrowfall-curriculum-'));
try {
	cpSync(snapshotRoot, join(workRoot, 'tutorial'), { recursive: true });
	for (const deliverable of manifest.deliverables) {
		const project = deliverable.path;
		run(longbow, ['check', project], { cwd: workRoot });
		run(longbow, ['test', project], { cwd: workRoot });
		run(longbow, ['build', project], { cwd: workRoot });
		const args = ['run', project];
		if (deliverable.id === '07-final') args.push('--', '--no-clear', '--seed', '20261105');
		const input = readFileSync(join(workRoot, deliverable.input));
		const actual = run(longbow, args, { cwd: workRoot, input }).stdout;
		const expected = normalize(readFileSync(join(workRoot, deliverable.output), 'utf8'));
		assertOutput(`${deliverable.id} stdout`, actual, expected);
		console.log(`${deliverable.id}: check, test, build, run, and exact stdout OK`);
	}
	const golden = join(workRoot, 'tutorial', 'checkpoints', '07-final', 'scripts', 'check-golden.sh');
	run(golden, [], { cwd: workRoot, env: { ...process.env, LONGBOW: longbow } });
} finally {
	rmSync(workRoot, { recursive: true, force: true });
}

console.log('Qualified all seven cumulative Arrowfall checkpoints and final golden campaign with official Flecha/Longbow 0.3.0.');
