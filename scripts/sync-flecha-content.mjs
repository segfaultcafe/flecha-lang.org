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
const changelogSource = join(sourceRoot, 'CHANGELOG.md');
const docsTarget = join(siteRoot, 'src/content/docs/docs/reference');
const examplesTarget = join(siteRoot, 'src/content/docs/examples');
const metadataTarget = join(siteRoot, 'src/data/flecha-source.json');

for (const required of [join(sourceRoot, 'SPEC.md'), changelogSource, docsSource, examplesSource]) {
	if (!existsSync(required)) throw new Error(`Missing Flecha source content: ${required}`);
}

const titleFromName = (name) =>
	name
		.replace(/\.[^.]+$/, '')
		.replaceAll('_', ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

const exampleOverrides = new Map([
	[
		'modules/src/main.fl',
		{
			slug: 'standard-library',
			title: 'Standard library modules',
			description:
				'Import and use Flecha standard-library algorithms with modules, generic functions, fixed arrays, and slices.',
		},
	],
	[
		'dynamic_array/src/main.fl',
		{
			slug: 'dynamic-array',
			title: 'Generic dynamic array',
			description:
				'Build and query a generic dynamic array using Flecha’s standard-library Array container.',
		},
	],
	[
		'llvm_poc.fl',
		{
			slug: 'llvm_poc',
			title: 'LLVM IR proof of concept',
			description: 'Inspect a small Flecha program used to exercise LLVM IR generation and execution.',
		},
	],
]);

const exampleCatalog = [
	{
		category: 'language',
		slugs: [
			'factorial',
			'stdout',
			'native_functions',
			'numeric_casts',
			'structures',
			'tuples',
			'const_declarations',
			'if_also',
			'while_also',
			'iteration',
			'loop_control',
			'fixed_arrays',
			'string_view',
			'error_values',
			'defer',
			'callables',
			'once',
		],
	},
	{
		category: 'memory',
		slugs: [
			'checked_references',
			'checked_slices',
			'ref_and_slice_returns',
			'ownership_contracts',
			'raw_allocation',
			'unsafe_pointers',
			'memory_tracking',
		],
	},
	{
		category: 'library',
		slugs: ['callback_algorithms', 'standard-library', 'dynamic-array', 'llvm_poc'],
	},
	{
		category: 'diagnostics',
		slugs: [
			'invalids',
			'diagnostics/checked_references',
			'diagnostics/checked_slices',
			'diagnostics/compound_types',
			'diagnostics/const_declarations',
			'diagnostics/fixed_arrays',
			'diagnostics/iteration',
			'diagnostics/unsafe_pointers',
		],
	},
];

const categoryForExample = new Map(
	exampleCatalog.flatMap(({ category, slugs }) => slugs.map((slug) => [slug, category])),
);
const orderForExample = new Map(
	exampleCatalog
		.flatMap(({ slugs }) => slugs)
		.map((slug, index) => [slug, index]),
);

function truncateDescription(text, limit = 158) {
	if (text.length <= limit) return text;
	const shortened = text.slice(0, limit + 1);
	const breakAt = shortened.lastIndexOf(' ');
	return `${shortened.slice(0, breakAt > 100 ? breakAt : limit).replace(/[,:;.-]+$/, '')}…`;
}

function descriptionFromMarkdown(markdown, fallback) {
	const prose = markdown
		.replace(/```[\s\S]*?```/g, '')
		.split(/\r?\n\s*\r?\n/)
		.map((paragraph) => paragraph.trim())
		.find(
			(paragraph) =>
				paragraph.length > 40 &&
				!paragraph.startsWith('#') &&
				!paragraph.startsWith(':::') &&
				!paragraph.startsWith('|') &&
				!paragraph.startsWith('- ') &&
				!paragraph.startsWith('* ') &&
				!paragraph.startsWith('<'),
		);
	if (!prose) return fallback;
	const plain = prose
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/[*_~]/g, '')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	const sentence = plain ? `${plain[0].toUpperCase()}${plain.slice(1)}` : fallback;
	return truncateDescription(sentence);
}

function exampleMetadata(sourcePath) {
	const override = exampleOverrides.get(sourcePath);
	if (override) return override;

	const diagnostic = sourcePath.startsWith('diagnostics/');
	const basenameWithoutExtension = basename(sourcePath, '.fl');
	const subject = titleFromName(basenameWithoutExtension);
	return {
		slug: sourcePath.slice(0, -3),
		title: diagnostic ? `${subject} diagnostics` : `${subject} example`,
		description: diagnostic
			? `See the Flecha compiler diagnostics produced by invalid ${subject.toLowerCase()} programs.`
			: `Learn ${subject.toLowerCase()} in Flecha with a complete source example you can inspect and run.`,
	};
}

function splitTitle(markdown, fallback) {
	const match = markdown.match(/^#\s+(.+)\r?\n+/);
	return {
		title: match?.[1]?.trim() ?? fallback,
		body: match ? markdown.slice(match[0].length) : markdown,
	};
}

function rewriteLinks(markdown) {
	return markdown
		.replaceAll(
			/\]\(\.\.\/examples\/modules\/src\/main\.fl(#[^)]+)?\)/gi,
			'](/examples/standard-library/$1)',
		)
		.replaceAll(
			/\]\(\.\.\/examples\/dynamic_array\/src\/main\.fl(#[^)]+)?\)/gi,
			'](/examples/dynamic-array/$1)',
		)
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

function writeMarkdownBodyPage(targetFile, { title, body, sourcePath, description }) {
	const pageDescription =
		description ??
		descriptionFromMarkdown(
			body,
			`Reference documentation for ${title} in the Flecha programming language.`,
		);
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(pageDescription)}`,
		`editUrl: https://github.com/segfaultcafe/flecha/edit/master/${sourcePath}`,
		'---',
		'',
	].join('\n');
	writeFileSync(targetFile, `${frontmatter}${rewriteLinks(body).trimEnd()}\n`, 'utf8');
}

function writeMarkdownPage(sourceFile, targetFile, sourcePath) {
	const raw = readFileSync(sourceFile, 'utf8');
	const { title, body } = splitTitle(raw, titleFromName(basename(sourceFile)));
	writeMarkdownBodyPage(targetFile, { title, body, sourcePath });
}

function releaseBody(changelog, version) {
	const heading = `## ${version}`;
	const start = changelog.indexOf(heading);
	if (start < 0) throw new Error(`Missing ${heading} in CHANGELOG.md`);
	const bodyStart = changelog.indexOf('\n', start) + 1;
	const nextHeading = changelog.indexOf('\n## ', bodyStart);
	return changelog.slice(bodyStart, nextHeading < 0 ? undefined : nextHeading).trim();
}

function exampleLink({ slug, title }) {
	return `- [${title.replace(/ example$| diagnostics$/, '')}](/examples/${slug}/)`;
}

function writeExamplesOverview(examplePages, locale = 'en') {
	const pagesBySlug = new Map(examplePages.map((page) => [page.slug, page]));
	const used = new Set();
	const groupLabels =
		locale === 'pt-br'
			? {
					language: 'Linguagem e fluxo de controle',
					memory: 'Memória e propriedade',
					library: 'Biblioteca padrão e compilação',
					diagnostics: 'Diagnósticos do compilador',
					other: 'Outros exemplos',
				}
			: {
					language: 'Language and control flow',
					memory: 'Memory and ownership',
					library: 'Standard library and compilation',
					diagnostics: 'Compiler diagnostics',
					other: 'Other examples',
				};
	const groups = exampleCatalog.map(({ category, slugs }) => ({
		category,
		pages: slugs.flatMap((slug) => {
			const page = pagesBySlug.get(slug);
			if (!page) return [];
			used.add(slug);
			return [page];
		}),
	}));
	const uncategorized = examplePages.filter(({ slug }) => !used.has(slug));
	if (uncategorized.length) groups.push({ category: 'other', pages: uncategorized });

	const catalog = groups
		.filter(({ pages }) => pages.length)
		.map(
			({ category, pages }) =>
				`## ${groupLabels[category]}\n\n${pages.map(exampleLink).join('\n')}`,
		)
		.join('\n\n');
	const count = examplePages.length;
	const translated = locale === 'pt-br';
	const page = `---
title: ${translated ? 'Exemplos' : 'Examples'}
description: ${translated ? 'Catálogo completo de programas Flecha sincronizados do repositório do compilador.' : 'Complete catalog of runnable Flecha programs synced from the compiler repository.'}
---

${translated ? `Estes ${count} exemplos vêm diretamente de` : `These ${count} examples come directly from`} [\`segfaultcafe/flecha\`](https://github.com/segfaultcafe/flecha/tree/master/examples). ${translated ? 'O código e os identificadores permanecem iguais ao original; as páginas individuais estão em inglês.' : 'They cover the current language, runtime, standard library, and compiler diagnostics.'}

${catalog}

## ${translated ? 'Executar um exemplo' : 'Run an example'}

\`\`\`sh
build/flecha check examples/factorial.fl
build/flecha build examples/factorial.fl -o build/factorial
./build/factorial
\`\`\`
`;
	const target = join(siteRoot, `src/content/docs/${translated ? 'pt-br/' : ''}examples.md`);
	writeFileSync(target, page, 'utf8');
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

const changelog = readFileSync(changelogSource, 'utf8');
writeMarkdownBodyPage(join(docsTarget, 'changelog.md'), {
	title: 'Changelog and release history',
	body: splitTitle(changelog, 'Changelog').body,
	sourcePath: 'CHANGELOG.md',
	description: 'Current Flecha development changes and the complete tagged release history.',
});
for (const version of ['0.1.2', '0.1.3', '0.2.0']) {
	writeMarkdownBodyPage(join(docsTarget, `release_${version.replaceAll('.', '_')}.md`), {
		title: `Flecha ${version}`,
		body: releaseBody(changelog, version),
		sourcePath: 'CHANGELOG.md',
	});
}

const examples = listFiles(examplesSource, '.fl');
const examplePages = examples.map((sourcePath) => {
	const metadata = exampleMetadata(sourcePath);
	return {
		...metadata,
		sourcePath,
		category: categoryForExample.get(metadata.slug) ?? 'other',
	};
}).sort(
	(left, right) =>
		(orderForExample.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
			(orderForExample.get(right.slug) ?? Number.MAX_SAFE_INTEGER) ||
		left.slug.localeCompare(right.slug),
);
for (const { sourcePath, slug, title, description } of examplePages) {
	const code = readFileSync(join(examplesSource, sourcePath), 'utf8').trimEnd();
	const page = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\neditUrl: https://github.com/segfaultcafe/flecha/edit/master/examples/${sourcePath}\n---\n\n[View source on GitHub](https://github.com/segfaultcafe/flecha/blob/master/examples/${sourcePath})\n\n\`\`\`flecha title="${sourcePath}"\n${code}\n\`\`\`\n`;
	const target = join(examplesTarget, `${slug}.md`);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, page, 'utf8');
}

writeExamplesOverview(examplePages);
writeExamplesOverview(examplePages, 'pt-br');

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
		{
			repository: 'segfaultcafe/flecha',
			commit,
			syncedAt,
			docs: docs.length + 4,
			examples: examples.length,
			examplePages: examplePages.map(({ slug, title, category }) => ({ slug, title, category })),
		},
		null,
		2,
	) + '\n',
	'utf8',
);

cpSync(
	join(sourceRoot, 'editors/vscode/syntaxes/flecha.tmLanguage.json'),
	join(siteRoot, 'src/data/flecha.tmLanguage.json'),
);

console.log(`Synced ${docs.length + 4} docs and ${examples.length} examples from ${commit.slice(0, 12)}.`);
