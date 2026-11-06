import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const presentationComponents = [
	'src/components/ArrowfallCourseCard.astro',
	'src/components/ArrowfallLesson.astro',
	'src/components/CurriculumCards.astro',
	'src/components/MainPractice.astro',
];
const bannedPhrases = [
	'Validated practice checkpoint',
	'Checkpoint prático validado',
	'Make the concept do work',
	'Faça o conceito trabalhar',
	'Independent project tutorial',
	'Tutorial de projeto independente',
	'Start ARROWFALL',
	'Começar ARROWFALL',
	'Start this track',
	'Começar esta trilha',
];
const failures = [];

for (const relative of presentationComponents) {
	const body = readFileSync(resolve(root, relative), 'utf8');
	if (body.includes('<style>')) failures.push(`${relative}: tutorial presentation must not define local CSS`);
	for (const phrase of bannedPhrases) {
		if (body.includes(phrase)) failures.push(`${relative}: contains prohibited promotional phrase ${JSON.stringify(phrase)}`);
	}
}

const agents = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
for (const marker of ['Documentation editorial standard (Vulkan standard)', 'current state and the real', 'exact text compiled or checked by automation', 'Required review checklist']) {
	if (!agents.includes(marker)) failures.push(`AGENTS.md: missing normative editorial marker ${JSON.stringify(marker)}`);
}

if (failures.length) {
	console.error(`Editorial policy validation failed (${failures.length}):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log('Validated tutorial components against the Vulkan-standard editorial and visual policy.');
