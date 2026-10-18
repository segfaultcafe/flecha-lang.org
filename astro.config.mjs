// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const flechaGrammar = JSON.parse(
	readFileSync(new URL('./src/data/flecha.tmLanguage.json', import.meta.url), 'utf8'),
);

export default defineConfig({
	site: 'https://flecha-lang.org',
	integrations: [
		starlight({
			title: 'Flecha',
			description:
				'A statically typed systems programming language for explicit memory, predictable execution, and native targets.',
			favicon: '/favicon.svg',
			customCss: ['./src/styles/custom.css'],
			components: { Header: './src/components/Header.astro' },
			locales: {
				root: { label: 'English', lang: 'en' },
				'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
			},
			defaultLocale: 'root',
			head: [{ tag: 'meta', attrs: { name: 'theme-color', content: '#081712' } }],
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
							],
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
								{ label: 'Flecha 0.1 release contract', slug: 'docs/reference/release_0_1' },
								{ label: 'Flecha 0.1.1 stabilization milestone', slug: 'docs/reference/release_0_1_1' },
								{ label: 'Flecha 0.2.0 milestone', slug: 'docs/reference/release_0_2' },
							],
						},
					],
				},
				{
					label: 'Examples',
					translations: { 'pt-br': 'Exemplos' },
					items: [
						{ label: 'Examples overview', translations: { 'pt-br': 'Visão geral' }, slug: 'examples' },
						{ autogenerate: { directory: 'examples' } },
					],
				},
				{ label: 'Releases', translations: { 'pt-br': 'Versões' }, slug: 'releases' },
			],
			expressiveCode: {
				shiki: { langs: [{ ...flechaGrammar, name: 'flecha', aliases: ['fl'] }] },
			},
		}),
	],
});
