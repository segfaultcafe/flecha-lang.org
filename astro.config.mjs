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
						{ label: 'Language specification', translations: { 'pt-br': 'Especificação da linguagem' }, slug: 'docs/specification' },
						{ autogenerate: { directory: 'docs/reference' } },
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
