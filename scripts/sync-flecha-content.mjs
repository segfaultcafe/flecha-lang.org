import { execFileSync } from 'node:child_process';
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoot = resolve(
	process.env.FLECHA_SOURCE_DIR ?? process.argv[2] ?? join(siteRoot, '..', 'flecha'),
);
const docsSource = join(sourceRoot, 'docs');
const examplesSource = join(sourceRoot, 'examples');
const docsTarget = join(siteRoot, 'src/content/docs/docs/reference');
const examplesTarget = join(siteRoot, 'src/content/docs/examples');
const metadataTarget = join(siteRoot, 'src/data/flecha-source.json');

for (const required of [join(sourceRoot, 'SPEC.md'), docsSource, examplesSource]) {
	if (!existsSync(required)) throw new Error(`Missing Flecha source content: ${required}`);
}

const titleFromName = (name) =>
	name
		.replace(/\.[^.]+$/, '')
		.replaceAll('_', ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

function splitTitle(markdown, fallback) {
	const match = markdown.match(/^#\s+(.+)\r?\n+/);
	return {
		title: match?.[1]?.trim() ?? fallback,
		body: match ? markdown.slice(match[0].length) : markdown,
	};
}

function rewriteLinks(markdown) {
	return markdown
		.replaceAll(/\]\(\.\.\/examples\/([a-z0-9_/-]+)\.fl(#[^)]+)?\)/gi, '](/examples/$1/$2)')
		.replaceAll(/\]\(docs\/([a-z0-9_/-]+)\.md(#[^)]+)?\)/gi, '](/docs/reference/$1/$2)')
		.replaceAll(/\]\((?:\.\/)?([a-z0-9_/-]+)\.md(#[^)]+)?\)/gi, '](/docs/reference/$1/$2)')
		.replaceAll(/\]\(\.\.\/SPEC\.md(#[^)]+)?\)/gi, '](/docs/specification/$1)')
		.replaceAll(
			/\]\(\.\.\/README\.md(#[^)]+)?\)/gi,
			'](https://github.com/segfaultcafe/flecha/blob/master/README.md$1)',
		)
		.replaceAll(
			/\]\(\.\.\/CODE_STYLE\.md(#[^)]+)?\)/gi,
			'](https://github.com/segfaultcafe/flecha/blob/master/CODE_STYLE.md$1)',
		);
}

function listFiles(root, suffix) {
	const result = [];
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		const relativeName = entry.name;
		if (entry.isDirectory()) {
			for (const nested of listFiles(join(root, entry.name), suffix)) {
				result.push(join(relativeName, nested));
			}
		} else if (entry.isFile() && entry.name.endsWith(suffix)) {
			result.push(relativeName);
		}
	}
	return result.sort();
}

function writeMarkdownPage(sourceFile, targetFile, sourcePath) {
	const raw = readFileSync(sourceFile, 'utf8');
	const { title, body } = splitTitle(raw, titleFromName(basename(sourceFile)));
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`editUrl: https://github.com/segfaultcafe/flecha/edit/master/${sourcePath}`,
		'---',
		'',
	].join('\n');
	writeFileSync(targetFile, frontmatter + rewriteLinks(body), 'utf8');
}

rmSync(docsTarget, { recursive: true, force: true });
rmSync(examplesTarget, { recursive: true, force: true });
mkdirSync(docsTarget, { recursive: true });
mkdirSync(examplesTarget, { recursive: true });

const docs = readdirSync(docsSource).filter((name) => name.endsWith('.md')).sort();
for (const name of docs) {
	writeMarkdownPage(join(docsSource, name), join(docsTarget, name), `docs/${name}`);
}

writeMarkdownPage(
	join(sourceRoot, 'SPEC.md'),
	join(siteRoot, 'src/content/docs/docs/specification.md'),
	'SPEC.md',
);

const examples = listFiles(examplesSource, '.fl');
for (const sourcePath of examples) {
	const slug = sourcePath.slice(0, -3);
	const title = sourcePath.split('/').map(titleFromName).join(' · ');
	const code = readFileSync(join(examplesSource, sourcePath), 'utf8').trimEnd();
	const page = `---\ntitle: ${JSON.stringify(title)}\ndescription: A Flecha source example from the compiler repository.\neditUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/${sourcePath}\n---\n\n[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/${sourcePath})\n\n\`\`\`flecha title="${sourcePath}"\n${code}\n\`\`\`\n`;
	const target = join(examplesTarget, `${slug}.md`);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, page, 'utf8');
}

let commit = process.env.FLECHA_SOURCE_COMMIT;
if (!commit) {
	try {
		commit = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	} catch (error) {
		// Some constrained runners report EPERM after returning successful stdout.
		commit = String(error?.stdout ?? '').trim();
		if (!commit) throw error;
	}
}
const syncedAt = new Date().toISOString();
mkdirSync(resolve(metadataTarget, '..'), { recursive: true });
writeFileSync(
	metadataTarget,
	JSON.stringify(
		{ repository: 'segfaultcafe/flecha', commit, syncedAt, docs: docs.length + 1, examples: examples.length },
		null,
		2,
	) + '\n',
	'utf8',
);

cpSync(
	join(sourceRoot, 'editors/vscode/syntaxes/flecha.tmLanguage.json'),
	join(siteRoot, 'src/data/flecha.tmLanguage.json'),
);

console.log(`Synced ${docs.length + 1} docs and ${examples.length} examples from ${commit.slice(0, 12)}.`);
