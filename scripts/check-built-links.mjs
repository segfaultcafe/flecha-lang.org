import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { arrowfallLessons, arrowfallPath } from '../src/data/arrowfall.mjs';
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
const tutorialSeries = [
	{ name: 'main', lessons: curriculumLessons, path: curriculumPath },
	{ name: 'arrowfall', lessons: arrowfallLessons, path: arrowfallPath },
];
for (const locale of ['en', 'pt-br']) {
	for (const series of tutorialSeries) {
	for (const [index, lesson] of series.lessons.entries()) {
		const route = series.path(lesson.slug, locale);
		curriculumRoutes.add(route);
		const file = join(outputRoot, route, 'index.html');
		if (!existsSync(file)) {
			navigationErrors.push(`${route}: missing built curriculum page`);
			continue;
		}
		const html = readFileSync(file, 'utf8');
		if (series.name === 'arrowfall') {
			for (const marker of [
				`data-arrowfall-lesson="${lesson.id}"`,
				'id="run-the-current-checkpoint"',
				'id="observed-limitation"',
				'id="implement"',
				'id="run-and-compare"',
				`src="/arrowfall/frames/${lesson.id}.svg"`,
				locale === 'pt-br' ? 'Stdout esperada' : 'Expected stdout',
			]) {
				if (!html.includes(marker)) navigationErrors.push(`${route}: missing required project-led lesson marker ${marker}`);
			}
		}
		const prev = html.match(/<a\s+href="([^"]+)"[^>]*\srel="prev"[^>]*>/)?.[1];
		const next = html.match(/<a\s+href="([^"]+)"[^>]*\srel="next"[^>]*>/)?.[1];
		const expectedPrev = index > 0 ? series.path(series.lessons[index - 1].slug, locale) : undefined;
		const expectedNext = index < series.lessons.length - 1 ? series.path(series.lessons[index + 1].slug, locale) : undefined;
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
			const headingEnds = [html.indexOf('</h2>', heading), html.indexOf('</div>', heading)]
				.filter((position) => position >= 0);
			const contentStart = Math.min(...headingEnds);
			const nextHeading = [
				html.indexOf('<h2', contentStart + 5),
				html.indexOf('<div class="sl-heading-wrapper level-h2">', contentStart + 5),
			].filter((position) => position >= 0);
			const footer = html.indexOf('<footer', contentStart + 5);
			const candidates = [...nextHeading, footer].filter((position) => position >= 0);
			const contentEnd = candidates.length ? Math.min(...candidates) : undefined;
			const section = Number.isFinite(contentStart) ? html.slice(contentStart + 5, contentEnd) : '';
			const recommended = section.match(/<a href="([^"]+)"/)?.[1];
			if (!expectedNext) navigationErrors.push(`${route}: has an onward-learning section but no curriculum Next`);
			else if (!recommended || normalizeHref(recommended) !== expectedNext) {
				navigationErrors.push(`${route}: first next-learning link is ${recommended ?? 'missing'}, expected ${expectedNext}`);
			}
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
	console.log(`Validated separate EN/PT Previous/Next order for ${curriculumLessons.length} main lessons and ${arrowfallLessons.length} Arrowfall lessons; standalone pages have no tutorial paginator.`);
}
