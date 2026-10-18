import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

if (missing.length) {
	console.error(`Found ${missing.length} missing internal link(s):`);
	for (const link of [...new Set(missing)]) console.error(`- ${link}`);
	process.exitCode = 1;
} else {
	console.log(`Checked ${htmlFiles.length} HTML pages: all internal links resolve.`);
}
