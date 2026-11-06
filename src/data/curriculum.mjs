export const curriculumTracks = [
	{
		id: 'beginner',
		title: 'Beginner',
		titlePt: 'Iniciante',
		outcome: 'Build, run, and share a small Flecha command-line program.',
		outcomePt: 'Compile, execute e compartilhe um pequeno programa de linha de comando em Flecha.',
		prerequisite: 'No Flecha experience; install the v0.3.1 toolchain first.',
		prerequisitePt: 'Nenhuma experiência com Flecha; instale primeiro o toolchain v0.3.1.',
		scope: 'About 60–90 minutes',
		scopePt: 'Cerca de 60–90 minutos',
		lessons: [
			{ slug: 'beginner/hello-archer', title: 'Hello, Archer!', titlePt: 'Olá, Arqueiro!' },
			{ slug: 'beginner/command-line-app', title: 'Build a command-line application', titlePt: 'Crie um aplicativo de linha de comando' },
			{ slug: 'beginner/publish-package', title: 'Create and publish a package', titlePt: 'Crie e publique um pacote' },
		],
	},
	{
		id: 'basic',
		title: 'Basic',
		titlePt: 'Básico',
		outcome: 'Read and write ordinary Flecha programs with explicit errors and tests.',
		outcomePt: 'Leia e escreva programas Flecha comuns com erros explícitos e testes.',
		prerequisite: 'Complete the Beginner track.',
		prerequisitePt: 'Conclua a trilha Iniciante.',
		scope: 'About 3–4 hours',
		scopePt: 'Cerca de 3–4 horas',
		lessons: [
			{ slug: 'basic/modules-values-functions', title: 'Modules, values, and functions', titlePt: 'Módulos, valores e funções' },
			{ slug: 'basic/control-and-data', title: 'Control flow and compound data', titlePt: 'Fluxo de controle e dados compostos' },
			{ slug: 'basic/errors-and-tests', title: 'Errors and tests', titlePt: 'Erros e testes' },
			{ slug: 'basic/project', title: 'Project: a tested scorecard', titlePt: 'Projeto: placar com testes' },
		],
	},
	{
		id: 'intermediate',
		title: 'Intermediate',
		titlePt: 'Intermediário',
		outcome: 'Design multi-module applications that own resources and use the operating system safely.',
		outcomePt: 'Projete aplicativos com vários módulos que possuem recursos e usam o sistema operacional com segurança.',
		prerequisite: 'Comfort with Flecha values, control flow, errors, and tests.',
		prerequisitePt: 'Familiaridade com valores, fluxo de controle, erros e testes em Flecha.',
		scope: 'About 5–7 hours',
		scopePt: 'Cerca de 5–7 horas',
		lessons: [
			{ slug: 'intermediate/ownership-and-borrows', title: 'Ownership, moves, and checked borrows', titlePt: 'Propriedade, movimentos e empréstimos verificados' },
			{ slug: 'intermediate/collections-and-generics', title: 'Collections, allocation errors, and generics', titlePt: 'Coleções, erros de alocação e genéricos' },
			{ slug: 'intermediate/system-interfaces', title: 'Packages and system interfaces', titlePt: 'Pacotes e interfaces do sistema' },
			{ slug: 'intermediate/project', title: 'Project: qualify Workspace Guard', titlePt: 'Projeto: qualifique o Workspace Guard' },
		],
	},
	{
		id: 'advanced',
		title: 'Advanced',
		titlePt: 'Avançado',
		outcome: 'Qualify deterministic native software across package, ABI, performance, and failure boundaries.',
		outcomePt: 'Qualifique software nativo determinístico nos limites de pacotes, ABI, desempenho e falhas.',
		prerequisite: 'Complete the Intermediate track and be comfortable reading generated artifacts.',
		prerequisitePt: 'Conclua a trilha Intermediário e saiba inspecionar artefatos gerados.',
		scope: 'About 8–12 hours',
		scopePt: 'Cerca de 8–12 horas',
		lessons: [
			{ slug: 'advanced/contracts-and-builds', title: 'Ownership contracts and deterministic builds', titlePt: 'Contratos de propriedade e builds determinísticos' },
			{ slug: 'advanced/native-and-performance', title: 'Native boundaries and performance evidence', titlePt: 'Limites nativos e evidências de desempenho' },
			{ slug: 'advanced/failure-and-api-design', title: 'Failure handling and API design', titlePt: 'Tratamento de falhas e design de APIs' },
			{ slug: 'advanced/project', title: 'Project: qualify a deterministic ledger', titlePt: 'Projeto: qualifique um ledger determinístico' },
		],
	},
	{
		id: 'unsafe',
		title: 'Unsafe',
		titlePt: 'Unsafe',
		outcome: 'Contain, review, and test the smallest possible raw-memory or native boundary.',
		outcomePt: 'Contenha, revise e teste o menor limite possível de memória bruta ou código nativo.',
		prerequisite: 'Complete the Advanced track; use unsafe only when safe Flecha cannot express the boundary.',
		prerequisitePt: 'Conclua a trilha Avançado; use unsafe somente quando Flecha segura não puder expressar o limite.',
		scope: 'About 4–6 hours',
		scopePt: 'Cerca de 4–6 horas',
		lessons: [
			{ slug: 'unsafe/boundary', title: 'The unsafe boundary', titlePt: 'O limite unsafe' },
			{ slug: 'unsafe/raw-memory', title: 'Raw memory and the first unsafe program', titlePt: 'Memória bruta e o primeiro programa unsafe' },
			{ slug: 'unsafe/native-interop', title: 'FFI and native interop', titlePt: 'FFI e interoperabilidade nativa' },
			{ slug: 'unsafe/containment', title: 'Containment, review, and testing', titlePt: 'Contenção, revisão e testes' },
		],
	},
];

export const curriculumLessons = curriculumTracks.flatMap((track) =>
	track.lessons.map((lesson, lessonIndex) => ({ ...lesson, track: track.id, lessonIndex })),
);

export function curriculumPath(slug, locale = 'en') {
	return `${locale === 'pt-br' ? '/pt-br' : ''}/tutorials/${slug}/`;
}

export function findCurriculumLesson(pathname) {
	const canonical = pathname.replace(/^\/pt-br\//, '/').replace(/\/+$/, '/');
	return curriculumLessons.find((lesson) => canonical === `/tutorials/${lesson.slug}/`);
}
