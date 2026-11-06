const single = (id, source, start, end, goal, goalPt, expectedStdout, expectedStatus, href) => ({
	id, kind: 'single', source: `curriculum/main-evidence/single/${source}.fl`, start, end,
	goal, goalPt, expectedStdout, expectedStatus, href,
	commands: [
		`flecha check curriculum/main-evidence/single/${source}.fl`,
		`flecha build curriculum/main-evidence/single/${source}.fl -o build/${source}`,
		`build/${source}`,
	],
});

const workspaceOutput = `workspace_guard - deterministic workspace snapshots

usage:
  workspace_guard snapshot <root> <manifest>
  workspace_guard snapshot <manifest>  # root from FLECHA_GUARD_ROOT
  workspace_guard verify <root> <manifest>
  workspace_guard verify <manifest>    # root from FLECHA_GUARD_ROOT
  workspace_guard diff <old-manifest> <new-manifest>
  workspace_guard run <root> <manifest> -- <program> [arguments...]`;
const ledgerOutput = `codec_test.fl ...................................... OK [6/6] tests passed
ledger - deterministic append-only SHA-256 chain

usage:
  ledger create <file>
  ledger append <file> <payload>
  ledger verify <file>
  ledger list <file>`;

export const mainPractice = {
	'basic-modules': single('basic-modules', 'structures', 3, 20,
		'Build one structure through its lifecycle method, then call behavior through an explicit receiver.',
		'Construa uma estrutura pelo método de ciclo de vida e chame comportamento por um receptor explícito.', '', 42, '/examples/structures/'),
	'basic-control': single('basic-control', 'fixed_arrays', 4, 30,
		'Sort a fixed array with bounded loops, mutation through a checked reference, and visible output.',
		'Ordene um array fixo com loops limitados, mutação por referência verificada e saída visível.', '1\n2\n3\n4\n5', 0, '/examples/fixed_arrays/'),
	'basic-errors': single('basic-errors', 'error_values', 1, 27,
		'Make division failure explicit, widen a named error deliberately, and print only the successful result.',
		'Torne a falha de divisão explícita, amplie um erro nomeado deliberadamente e imprima só o sucesso.', '42', 0, '/examples/error_values/'),
	'basic-project': {
		id: 'basic-project', kind: 'package', source: 'curriculum/fixtures/package-dry-run/src/archer_words_test.fl', start: 1, end: 11,
		goal: 'Turn one public function into a tested package and exercise the same build boundary used by publication.',
		goalPt: 'Transforme uma função pública em pacote testado e exercite a mesma fronteira usada pela publicação.',
		commands: ['longbow check curriculum/fixtures/package-dry-run', 'longbow test curriculum/fixtures/package-dry-run', 'longbow build curriculum/fixtures/package-dry-run'],
		expectedStdout: 'archer_words_test.fl ............................... OK [1/1] tests passed', expectedStatus: 0,
		href: '/docs/reference/package_qualification/',
	},
	'intermediate-ownership': single('intermediate-ownership', 'checked_references', 4, 30,
		'Follow one value through mutable reborrowing, a moved handle, and shared read-only handles.',
		'Acompanhe um valor por reempréstimo mutável, handle movido e handles compartilhados somente leitura.', '6', 6, '/examples/checked_references/'),
	'intermediate-collections': single('intermediate-collections', 'callables', 1, 23,
		'Compose typed callables, a generic relay, and captured values without erasing their contracts.',
		'Componha callables tipados, relay genérico e valores capturados sem apagar seus contratos.', '', 42, '/examples/callables/'),
	'intermediate-systems': {
		id: 'intermediate-systems', kind: 'workspace', source: 'curriculum/main-evidence/projects/workspace_guard/src/main.fl', start: 1, end: 45,
		goal: 'Keep argument capture and environment/process failures at the CLI boundary of a multi-module package.',
		goalPt: 'Mantenha captura de argumentos e falhas de ambiente/processo na fronteira CLI de um pacote multimódulo.',
		commands: ['longbow check curriculum/main-evidence/projects/workspace_guard', 'longbow build curriculum/main-evidence/projects/workspace_guard', 'longbow run curriculum/main-evidence/projects/workspace_guard -- help'],
		expectedStdout: workspaceOutput, expectedStatus: 0, href: '/examples/workspace_guard/src/main/',
	},
	'intermediate-project': {
		id: 'intermediate-project', kind: 'workspace', source: 'curriculum/main-evidence/projects/workspace_guard/src/main.fl', start: 73, end: 116,
		goal: 'Qualify Workspace Guard as one package: explicit usage, root selection, exit codes, and deterministic help.',
		goalPt: 'Qualifique Workspace Guard como pacote: uso explícito, seleção da raiz, códigos de saída e ajuda determinística.',
		commands: ['longbow check curriculum/main-evidence/projects/workspace_guard', 'longbow test curriculum/main-evidence/projects/workspace_guard', 'longbow build curriculum/main-evidence/projects/workspace_guard', 'longbow run curriculum/main-evidence/projects/workspace_guard -- help'],
		expectedStdout: workspaceOutput, expectedStatus: 0, href: '/examples/workspace_guard/src/main/',
	},
	'advanced-contracts': single('advanced-contracts', 'ownership_contracts', 1, 16,
		'Put allocation ownership, construction, destruction, and transfer in one auditable contract.',
		'Coloque propriedade da alocação, construção, destruição e transferência em um contrato auditável.', '', 42, '/examples/ownership_contracts/'),
	'advanced-native': single('advanced-native', 'llvm_poc', 1, 9,
		'Keep the workload and exit status fixed before inspecting optimized native or LLVM output.',
		'Mantenha workload e status de saída fixos antes de inspecionar saída nativa otimizada ou LLVM.', '', 42, '/examples/llvm_poc/'),
	'advanced-failure': {
		id: 'advanced-failure', kind: 'ledger', source: 'curriculum/main-evidence/projects/ledger/src/main.fl', start: 20, end: 55,
		goal: 'Map typed domain failures to stable CLI messages and exit codes in one place.',
		goalPt: 'Mapeie falhas de domínio tipadas para mensagens CLI e códigos de saída estáveis em um só lugar.',
		commands: ['longbow check curriculum/main-evidence/projects/ledger', 'longbow run curriculum/main-evidence/projects/ledger -- help'],
		expectedStdout: ledgerOutput.split('\n').slice(1).join('\n'), expectedStatus: 0, href: '/examples/ledger/src/main/',
	},
	'advanced-project': {
		id: 'advanced-project', kind: 'ledger', source: 'curriculum/main-evidence/projects/ledger/src/model.fl', start: 3, end: 54,
		goal: 'Qualify a multi-module native program with six behavior tests and deterministic command output.',
		goalPt: 'Qualifique um programa nativo multimódulo com seis testes e saída determinística.',
		commands: ['longbow check curriculum/main-evidence/projects/ledger', 'longbow test curriculum/main-evidence/projects/ledger', 'longbow build curriculum/main-evidence/projects/ledger', 'longbow run curriculum/main-evidence/projects/ledger -- help'],
		expectedStdout: ledgerOutput, expectedStatus: 0, href: '/examples/ledger/src/model/',
	},
	'unsafe-boundary': single('unsafe-boundary', 'unsafe_pointers', 4, 17,
		'Write the pointer contract at the smallest boundary while ordinary address copying stays safe.',
		'Escreva o contrato do ponteiro na menor fronteira enquanto copiar endereços continua seguro.', '42', 42, '/examples/unsafe_pointers/'),
	'unsafe-native': single('unsafe-native', 'foreign_add', 1, 14,
		'Embed one C translation unit, declare its exact scalar ABI, and return to safe Flecha immediately.',
		'Embuta uma unidade C, declare sua ABI escalar exata e retorne imediatamente a Flecha segura.', '42', 0, '/docs/reference/extern/'),
	'unsafe-containment': single('unsafe-containment', 'unsafe_pointers', 19, 45,
		'Keep raw access inside two short blocks and verify the safe value before and after the boundary.',
		'Mantenha o acesso bruto em dois blocos curtos e verifique o valor seguro antes e depois da fronteira.', '42', 42, '/examples/unsafe_pointers/'),
};
