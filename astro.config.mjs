// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { curriculumTracks } from './src/data/curriculum.mjs';

const flechaGrammar = JSON.parse(
	readFileSync(new URL('./src/data/flecha.tmLanguage.json', import.meta.url), 'utf8'),
);
const flechaSource = JSON.parse(
	readFileSync(new URL('./src/data/flecha-source.json', import.meta.url), 'utf8'),
);
const exampleCategories = [
	['language', 'Language and control flow', 'Linguagem e fluxo de controle'],
	['memory', 'Memory and ownership', 'Memória e propriedade'],
	['library', 'Standard library and compilation', 'Biblioteca padrão e compilação'],
	['applications', 'Complete applications', 'Aplicativos completos'],
	['diagnostics', 'Compiler diagnostics', 'Diagnósticos do compilador'],
	['other', 'Other examples', 'Outros exemplos'],
];
/** @type {{ slug: string; title: string; category: string }[]} */
const examplePages = Array.isArray(flechaSource.examplePages) ? flechaSource.examplePages : [];
const curriculumSidebar = curriculumTracks.map((track) => ({
	label: track.title,
	translations: { 'pt-br': track.titlePt },
	items: track.lessons.map((lesson) => ({
		label: lesson.title,
		translations: { 'pt-br': lesson.titlePt },
		slug: `tutorials/${lesson.slug}`,
	})),
}));
const exampleSidebarItems = exampleCategories.flatMap(([category, label, translation]) => {
	const pages = examplePages.filter((page) => page.category === category);
	if (!pages.length) return [];
	return [
		{
			label,
			translations: { 'pt-br': translation },
			items: pages.map(({ slug, title }) => ({
				label: title.replace(/ example$| diagnostics$/, ''),
				slug: `examples/${slug}`,
			})),
		},
	];
});

export default defineConfig({
	site: 'https://flecha-lang.org',
	redirects: {
		'/examples/modules/src/main/': '/examples/standard-library/',
		'/examples/dynamic_array/src/main/': '/examples/dynamic-array/',
		'/tutorials/first-project/': '/tutorials/beginner/hello-archer/',
		'/tutorials/command-line-app/': '/tutorials/beginner/command-line-app/',
		'/tutorials/publish-package/': '/tutorials/beginner/publish-package/',
		'/pt-br/tutorials/first-project/': '/pt-br/tutorials/beginner/hello-archer/',
		'/pt-br/tutorials/command-line-app/': '/pt-br/tutorials/beginner/command-line-app/',
		'/pt-br/tutorials/publish-package/': '/pt-br/tutorials/beginner/publish-package/',
	},
	integrations: [
		sitemap({
			filter: (page) => {
				const pathname = new URL(page).pathname;
				if (!pathname.startsWith('/pt-br/')) return true;
				return pathname.startsWith('/pt-br/tutorials/') || new Set([
					'/pt-br/',
					'/pt-br/install/',
					'/pt-br/learn/',
					'/pt-br/docs/',
					'/pt-br/examples/',
					'/pt-br/vision/',
					'/pt-br/releases/',
				]).has(pathname);
			},
		}),
		starlight({
			title: 'Flecha',
			description:
				'A statically typed systems programming language for explicit memory, predictable execution, and native targets.',
			favicon: '/favicon.svg',
			customCss: ['./src/styles/custom.css'],
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				Pagination: './src/components/CurriculumPagination.astro',
			},
			pagination: false,
			locales: {
				root: { label: 'English', lang: 'en' },
				'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
			},
			defaultLocale: 'root',
			head: [
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#081712' } },
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: 'https://flecha-lang.org/flecha-social.png' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:alt', content: 'The yellow Flecha arrow on a dark green field' },
				},
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1254' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '1254' } },
				{
					tag: 'meta',
					attrs: { name: 'twitter:image', content: 'https://flecha-lang.org/flecha-social.png' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:image:alt', content: 'The yellow Flecha arrow on a dark green field' },
				},
			],
			social: [
				{
					icon: 'github',
					label: 'Flecha on GitHub',
					href: 'https://github.com/segfaultcafe/flecha',
				},
			],
			sidebar: [
				{ label: 'Install', translations: { 'pt-br': 'Instalar' }, slug: 'install' },
				{ label: 'Learn', translations: { 'pt-br': 'Aprender' }, slug: 'learn' },
				{
					label: 'Documentation',
					translations: { 'pt-br': 'Documentação' },
					items: [
						{ label: 'Docs overview', translations: { 'pt-br': 'Visão geral' }, slug: 'docs' },
						{
							label: 'Start here',
							translations: { 'pt-br': 'Comece aqui' },
							items: [
								{ label: 'Language specification', translations: { 'pt-br': 'Especificação da linguagem' }, slug: 'docs/specification' },
								{ label: 'Flecha compiler', translations: { 'pt-br': 'Compilador Flecha' }, slug: 'docs/reference/compiler' },
								{ label: 'Supported toolchains', translations: { 'pt-br': 'Toolchains compatíveis' }, slug: 'docs/reference/toolchains' },
								{ label: 'Modules and imports', translations: { 'pt-br': 'Módulos e imports' }, slug: 'docs/reference/modules' },
								{ label: 'Longbow', slug: 'docs/reference/longbow' },
								{ label: 'Package ecosystem', slug: 'docs/reference/package_ecosystem' },
								{ label: 'v0.3 standard-library API', slug: 'docs/reference/standard_library' },
							],
						},
						{
							label: 'Tutorials',
							translations: { 'pt-br': 'Tutoriais' },
							items: curriculumSidebar,
						},
						{
							label: 'Language features',
							translations: { 'pt-br': 'Recursos da linguagem' },
							items: [
								{ label: 'Structures and lifecycle methods', slug: 'docs/reference/structures' },
								{ label: 'Tuples, multiple results, and destructuring', slug: 'docs/reference/tuples' },
								{ label: 'Enums', slug: 'docs/reference/enums' },
								{ label: 'Fixed arrays', slug: 'docs/reference/fixed_arrays' },
								{ label: 'Runtime arrays and containers', slug: 'docs/reference/dynamic_arrays' },
								{ label: 'Strings', slug: 'docs/reference/string' },
								{ label: 'Error values', slug: 'docs/reference/error_values' },
								{ label: 'Array ranges and counted loops', slug: 'docs/reference/iteration' },
								{ label: 'Enum matching', slug: 'docs/reference/match' },
								{ label: 'Deferred calls', slug: 'docs/reference/defer' },
								{ label: 'Generics', slug: 'docs/reference/generics' },
								{ label: 'External functions', slug: 'docs/reference/extern' },
								{ label: 'Const declarations and compound types', slug: 'docs/reference/const_types' },
								{ label: 'Built-in and library API style', slug: 'docs/reference/library_api_style' },
								{ label: 'Decorations', slug: 'docs/reference/decorations' },
								{ label: 'Function overloading', slug: 'docs/reference/function_overloading' },
								{ label: 'Type sets', slug: 'docs/reference/type_sets' },
								{ label: 'Crashable functions', slug: 'docs/reference/crashable_functions' },
							],
						},
						{
							label: 'Memory and ownership',
							translations: { 'pt-br': 'Memória e propriedade' },
							items: [
								{ label: 'Checked stack references', slug: 'docs/reference/checked_references' },
								{ label: 'Checked slices', slug: 'docs/reference/checked_slices' },
								{ label: 'Raw-pointer ownership contracts', slug: 'docs/reference/ownership_contracts' },
								{ label: 'Definite assignment', slug: 'docs/reference/definite_assignment' },
								{ label: 'Raw allocation: new and free', slug: 'docs/reference/raw_allocation' },
								{ label: 'Unsafe contexts and raw pointers', slug: 'docs/reference/unsafe_pointers' },
								{ label: 'Reference and slice returns', slug: 'docs/reference/ref_and_slice_returns' },
								{ label: 'Memory model and remaining proposals', slug: 'docs/reference/memory_model' },
								{ label: 'Memory implementation history', slug: 'docs/reference/memory_implementation_plan' },
							],
						},
						{
							label: 'Tooling and standard library',
							translations: { 'pt-br': 'Ferramentas e biblioteca padrão' },
							items: [
								{ label: 'Editor installation', slug: 'docs/reference/editors' },
								{ label: 'Filesystem', slug: 'docs/reference/filesystem' },
								{ label: 'Paths', slug: 'docs/reference/path' },
								{ label: 'Bytes', slug: 'docs/reference/bytes' },
								{ label: 'Collections', slug: 'docs/reference/collections' },
								{ label: 'Text', slug: 'docs/reference/text' },
								{ label: 'Formatting', slug: 'docs/reference/formatting' },
								{ label: 'Encoding', slug: 'docs/reference/encoding' },
								{ label: 'Hashing', slug: 'docs/reference/hashing' },
								{ label: 'Cryptography', slug: 'docs/reference/cryptography' },
								{ label: 'Memory helpers', slug: 'docs/reference/memory' },
								{ label: 'Math', slug: 'docs/reference/math' },
								{ label: 'Networking', slug: 'docs/reference/network' },
								{ label: 'OS arguments and environment', slug: 'docs/reference/os' },
								{ label: 'Child processes', slug: 'docs/reference/process' },
								{ label: 'Randomness', slug: 'docs/reference/random' },
								{ label: 'Time', slug: 'docs/reference/time' },
								{ label: 'Testing', slug: 'docs/reference/testing' },
								{ label: 'Standard-library development', slug: 'docs/reference/std_development' },
								{ label: 'Docker sandbox', slug: 'docs/reference/sandbox' },
							],
						},
						{
							label: 'Compiler internals',
							translations: { 'pt-br': 'Internos do compilador' },
							items: [
								{ label: 'Semantic analysis', slug: 'docs/reference/semantic_analysis' },
								{ label: 'Typed lowering IR', slug: 'docs/reference/typed_lowering_ir' },
								{ label: 'LLVM code generation', slug: 'docs/reference/llvm_codegen' },
								{ label: 'Native code generation', slug: 'docs/reference/native_codegen' },
								{ label: 'Flecha runtime ABI', slug: 'docs/reference/runtime_abi' },
							],
						},
						{
							label: 'Project history',
							translations: { 'pt-br': 'Histórico do projeto' },
							items: [
								{ label: 'Changelog and current development', slug: 'docs/reference/changelog' },
								{ label: 'Flecha 0.3 milestone', slug: 'docs/reference/release_0_3' },
								{ label: 'Tagged releases', slug: 'releases' },
							],
						},
					],
				},
				{
					label: 'Examples',
					translations: { 'pt-br': 'Exemplos' },
					items: [
						{ label: 'Examples overview', translations: { 'pt-br': 'Visão geral' }, slug: 'examples' },
						...(exampleSidebarItems.length
							? exampleSidebarItems
							: [{ autogenerate: { directory: 'examples' } }]),
					],
				},
				{ label: 'Vision (and beyond)', translations: { 'pt-br': 'Visão (e além)' }, slug: 'vision' },
				{ label: 'Releases', translations: { 'pt-br': 'Versões' }, slug: 'releases' },
			],
			expressiveCode: {
				shiki: { langs: [{ ...flechaGrammar, name: 'flecha', aliases: ['fl'] }] },
			},
		}),
	],
});
