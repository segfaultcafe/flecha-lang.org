import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { curriculumLessons, curriculumPath } from '../src/data/curriculum.mjs';

const outputRoot = new URL('../dist/', import.meta.url).pathname;

if (!existsSync(outputRoot)) {
	throw new Error('Missing dist/. Run `npm run build` before checking links.');
}

const files = [];
function walk(directory) {
	for (const name of readdirSync(directory)) {
		const path = join(directory, name);
		if (statSync(path).isDirectory()) walk(path);
		else files.push(path);
	}
}
walk(outputRoot);

const missing = [];
const navigationErrors = [];
const htmlFiles = files.filter((file) => file.endsWith('.html'));

for (const sourceFile of htmlFiles) {
	const html = readFileSync(sourceFile, 'utf8');
	for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
		const href = match[1].split(/[?#]/)[0];
		if (href.startsWith('/_') || href.startsWith('/pagefind/')) continue;

		const candidates = [
			join(outputRoot, href, 'index.html'),
			join(outputRoot, href),
			join(outputRoot, `${href.replace(/\/$/, '')}.html`),
		];
		if (!candidates.some(existsSync)) {
			missing.push(`${href} (linked from ${sourceFile.slice(outputRoot.length)})`);
		}
	}
}

const normalizeHref = (href) => new URL(href, 'https://flecha-lang.org').pathname.replace(/\/+$/, '/');
const curriculumRoutes = new Set();
for (const locale of ['en', 'pt-br']) {
	for (const [index, lesson] of curriculumLessons.entries()) {
		const route = curriculumPath(lesson.slug, locale);
		curriculumRoutes.add(route);
		const file = join(outputRoot, route, 'index.html');
		if (!existsSync(file)) {
			navigationErrors.push(`${route}: missing built curriculum page`);
			continue;
		}
		const html = readFileSync(file, 'utf8');
		const prev = html.match(/<a\s+href="([^"]+)"[^>]*\srel="prev"[^>]*>/)?.[1];
		const next = html.match(/<a\s+href="([^"]+)"[^>]*\srel="next"[^>]*>/)?.[1];
		const expectedPrev = index > 0 ? curriculumPath(curriculumLessons[index - 1].slug, locale) : undefined;
		const expectedNext = index < curriculumLessons.length - 1 ? curriculumPath(curriculumLessons[index + 1].slug, locale) : undefined;
		if ((prev && normalizeHref(prev)) !== expectedPrev) {
			navigationErrors.push(`${route}: Previous is ${prev ?? 'missing'}, expected ${expectedPrev ?? 'none'}`);
		}
		if ((next && normalizeHref(next)) !== expectedNext) {
			navigationErrors.push(`${route}: Next is ${next ?? 'missing'}, expected ${expectedNext ?? 'none'}`);
		}

		const nextHeadingIds = locale === 'pt-br'
			? ['o-que-aprender-a-seguir', 'trilha-concluida']
			: ['what-to-learn-next', 'track-complete'];
		const heading = Math.max(...nextHeadingIds.map((id) => html.indexOf(`id="${id}"`)));
		if (heading >= 0) {
			const contentStart = html.indexOf('</div>', heading);
			const nextHeading = html.indexOf('<div class="sl-heading-wrapper level-h2">', contentStart + 6);
			const footer = html.indexOf('<footer', contentStart + 6);
			const candidates = [nextHeading, footer].filter((position) => position >= 0);
			const contentEnd = candidates.length ? Math.min(...candidates) : undefined;
			const section = contentStart >= 0 ? html.slice(contentStart + 6, contentEnd) : '';
			const recommended = section.match(/<a href="([^"]+)"/)?.[1];
			if (!expectedNext) navigationErrors.push(`${route}: has an onward-learning section but no curriculum Next`);
			else if (!recommended || normalizeHref(recommended) !== expectedNext) {
				navigationErrors.push(`${route}: first next-learning link is ${recommended ?? 'missing'}, expected ${expectedNext}`);
			}
		}
	}
}

for (const sourceFile of htmlFiles) {
	const route = `/${sourceFile.slice(outputRoot.length).replace(/index\.html$/, '').replaceAll('\\', '/')}`.replace(/\/+/g, '/');
	if (curriculumRoutes.has(route)) continue;
	const html = readFileSync(sourceFile, 'utf8');
	if (html.includes('data-curriculum-pagination')) {
		navigationErrors.push(`${route}: standalone page unexpectedly renders curriculum pagination`);
	}
}

if (missing.length) {
	console.error(`Found ${missing.length} missing internal link(s):`);
	for (const link of [...new Set(missing)]) console.error(`- ${link}`);
	process.exitCode = 1;
} else {
	console.log(`Checked ${htmlFiles.length} HTML pages: all internal links resolve.`);
}

if (navigationErrors.length) {
	console.error(`Found ${navigationErrors.length} curriculum navigation error(s):`);
	for (const error of navigationErrors) console.error(`- ${error}`);
	process.exitCode = 1;
} else {
	console.log(`Validated exact EN/PT Previous/Next order for ${curriculumLessons.length} curriculum lessons; standalone pages have no curriculum paginator.`);
}
