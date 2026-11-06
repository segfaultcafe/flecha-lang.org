export const arrowfallNarrative = {
	'01-scene': {
		en: {
			context: [
				'Arrowfall begins with the smallest useful result: a terminal program that can already be recognized as a game. There is no state or input yet. The current program only establishes the title, the room boundary, the archer, the floor, and the exit.',
				'This static frame is intentional. Before rules can move a symbol, the symbols need a stable meaning. The same four characters will remain visible as later checkpoints replace literal text with state, collision, enemies, and rendering logic.',
			],
			model: [
				'The terminal is a grid of characters, so one printed line represents one row. Calling stdoutln once per row makes the spatial layout visible directly in source: the outer # characters are walls, @ is the archer, . is traversable floor, and > is the exit.',
				'At this stage the source text is also the scene data. That is acceptable only because nothing can change. It gives us a precise baseline without introducing a structure whose responsibilities are still unknown.',
				'The important invariant is visual rather than dynamic: every row has the same width and the room remains enclosed. Movement and collision are deliberately out of scope until the program has state to modify.',
			],
			snippets: [
				{
					before: ['The complete program fits in one module. The module declaration gives Longbow an entry module, while main writes the four-line frame in display order.'],
					after: [
						'Each call ends its row with a newline. Keeping the title separate from the room means later renderers can redraw the map without treating the title as a map cell.',
						'There is no loop because there is no repeated rule yet. A loop would hide the only information this checkpoint needs to teach: the exact first frame.',
					],
				},
			],
			run: [
				'The recorded run has no standard input. Its frame should contain the same four rows as the source, with the archer at the only floor cell before the exit.',
				'This output becomes the first visual contract. If one character changes, the frame fixture changes with it; later checkpoints can therefore show which visible behavior came from a code change.',
			],
			conclusion: [
				'We now have a compilable Longbow program and an exact terminal baseline, but the archer is still part of a string. There is no value that represents its location.',
				'The next checkpoint introduces that value and makes rendering consult it. Only then can movement mean changing data instead of editing text.',
			],
		},
		'pt-br': {
			context: [
				'Arrowfall começa com o menor resultado útil: um programa de terminal que já pode ser reconhecido como jogo. Ainda não há estado nem entrada. O programa atual apenas estabelece o título, o limite da sala, o arqueiro, o piso e a saída.',
				'Esse frame estático é intencional. Antes de uma regra mover um símbolo, os símbolos precisam ter significado estável. Os mesmos quatro caracteres continuarão visíveis quando os próximos checkpoints substituírem texto literal por estado, colisão, inimigos e lógica de renderização.',
			],
			model: [
				'O terminal é uma grade de caracteres, portanto cada linha impressa representa uma linha do mapa. Uma chamada a stdoutln por linha torna o arranjo espacial visível diretamente no código: os caracteres # externos são paredes, @ é o arqueiro, . é piso transitável e > é a saída.',
				'Nesta etapa, o texto do código também é o dado da cena. Isso só é aceitável porque nada pode mudar. Assim obtemos uma referência precisa sem introduzir uma estrutura cujas responsabilidades ainda não conhecemos.',
				'O invariante importante é visual, não dinâmico: todas as linhas têm a mesma largura e a sala permanece fechada. Movimento e colisão ficam deliberadamente fora do escopo até que o programa tenha estado para alterar.',
			],
			snippets: [
				{
					before: ['O programa completo cabe em um módulo. A declaração do módulo fornece a entrada ao Longbow, enquanto main escreve o frame de quatro linhas na ordem de exibição.'],
					after: [
						'Cada chamada encerra sua linha com uma quebra. Manter o título separado da sala permite que renderizadores futuros redesenhem o mapa sem tratar o título como célula.',
						'Não há loop porque ainda não existe uma regra repetida. Um loop esconderia a única informação que este checkpoint precisa ensinar: o primeiro frame exato.',
					],
				},
			],
			run: [
				'A execução registrada não tem entrada padrão. O frame deve conter as mesmas quatro linhas do código, com o arqueiro na única célula de piso antes da saída.',
				'Essa saída se torna o primeiro contrato visual. Se um caractere mudar, o fixture do frame muda junto; assim, os checkpoints posteriores podem mostrar qual comportamento visível veio de uma alteração no código.',
			],
			conclusion: [
				'Agora temos um programa Longbow compilável e uma referência exata de terminal, mas o arqueiro ainda faz parte de uma string. Nenhum valor representa sua posição.',
				'O próximo checkpoint introduz esse valor e faz a renderização consultá-lo. Só então movimento poderá significar alterar dados em vez de editar texto.',
			],
		},
	},
	'02-state': {
		en: {
			context: [
				'Checkpoint 01 draws an archer, but the @ character has no relationship to a game object. Moving it would require changing the literal row, and the coordinate printed elsewhere could silently disagree.',
				'This checkpoint keeps the room visually unchanged while replacing that duplication with one source of truth. Game owns the current Position; every visible representation asks Game for that value.',
			],
			model: [
				'Position groups x and y because a location is only meaningful when both coordinates travel together. Game owns one Position privately, so code outside Game can observe the location but cannot replace the owned field directly.',
				'Game::playerPosition takes a checked const reference to self and returns the small Position by value. The caller receives a copy for rendering; ownership of the authoritative player field remains in Game. This is the boundary between model and presentation in the first stateful version.',
				'Rendering traverses the three interior columns and compares each coordinate with the copied player position. Exactly one comparison is true, so @ is derived from state. The exit remains a fixed rule for the last column and every other cell becomes floor.',
				'The invariant is that Game::start establishes a valid initial position once. Drawing never changes it, and both the map glyph and the coordinate line use the same copied value. Input and mutation remain out of scope for this checkpoint.',
			],
			snippets: [
				{
					before: ['The first excerpt defines the ownership boundary. Position contains the two coordinates; Game contains one private Position and is the only owner of the authoritative player location.'],
					after: [
						'Position::at constructs both fields together, avoiding partially initialized coordinates. Game::start then chooses (1, 1) in one place instead of scattering the start cell through rendering code.',
						'playerPosition borrows Game as const, so observing the location cannot mutate the model. Returning a copy is appropriate for this two-integer value; a reference would couple the renderer to Game storage without providing a benefit here.',
					],
				},
				{
					before: ['main obtains one snapshot of the player position and passes it to draw_row. The same snapshot is then used for the textual coordinate, preventing the two outputs from consulting different state.'],
					after: [
						'draw_row visits x coordinates 1, 2, and 3. The first branch places @ only when both coordinates match; the second reserves column 3 for the exit; the final branch fills the remaining cell with floor.',
						'The traversal is deliberately small and explicit. A full map array would be unnecessary until walls become data in checkpoint 04, but rendering from a coordinate already establishes the source-of-truth rule that the later map renderer keeps.',
					],
				},
			],
			run: [
				'The frame still looks like checkpoint 01, then prints Player: (1, 1). That extra line is useful evidence: the @ glyph and the reported coordinate came from the same Position snapshot.',
				'Changing Game::start to (2, 1) for the exercise must move both representations. If only one changes, rendering has reintroduced a second source of truth.',
			],
			conclusion: [
				'The picture is now a view of owned state. Construction, observation, and traversal have separate responsibilities, and rendering cannot mutate Game through its const borrow.',
				'The state still never changes after construction. The next checkpoint adds a typed input boundary and gives Game the only mutation operation for player movement.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 01 desenha um arqueiro, mas o caractere @ não tem relação com um objeto do jogo. Movê-lo exigiria alterar a linha literal, e a coordenada impressa em outro lugar poderia divergir silenciosamente.',
				'Este checkpoint mantém a sala visualmente igual enquanto substitui essa duplicação por uma única fonte de verdade. Game possui a Position atual; toda representação visível consulta esse valor em Game.',
			],
			model: [
				'Position agrupa x e y porque uma localização só faz sentido quando as duas coordenadas viajam juntas. Game possui uma Position privada, então código externo pode observar a localização, mas não substituir diretamente o campo que pertence ao jogo.',
				'Game::playerPosition recebe uma referência verificada e const para self e retorna a pequena Position por valor. O chamador recebe uma cópia para renderizar; a propriedade do campo autoritativo continua em Game. Essa é a primeira fronteira entre modelo e apresentação.',
				'A renderização percorre as três colunas internas e compara cada coordenada com a posição copiada. Exatamente uma comparação é verdadeira, portanto @ é derivado do estado. A saída continua como regra fixa da última coluna e as demais células viram piso.',
				'O invariante é que Game::start estabelece uma posição inicial válida uma vez. O desenho nunca a altera, e tanto o glifo no mapa quanto a linha de coordenadas usam a mesma cópia. Entrada e mutação continuam fora do escopo.',
			],
			snippets: [
				{
					before: ['O primeiro trecho define a fronteira de propriedade. Position contém as duas coordenadas; Game contém uma Position privada e é o único dono da localização autoritativa do jogador.'],
					after: [
						'Position::at constrói os dois campos juntos, evitando coordenadas parcialmente inicializadas. Game::start escolhe (1, 1) em um único lugar, sem espalhar a célula inicial pelo código de renderização.',
						'playerPosition empresta Game como const, então observar a localização não pode alterar o modelo. Retornar uma cópia é adequado para esse valor de dois inteiros; uma referência acoplaria o renderer ao armazenamento de Game sem benefício aqui.',
					],
				},
				{
					before: ['main obtém um snapshot da posição e o passa para draw_row. O mesmo snapshot produz a coordenada textual, impedindo que as duas saídas consultem estados diferentes.'],
					after: [
						'draw_row visita as coordenadas x 1, 2 e 3. O primeiro ramo coloca @ somente quando as duas coordenadas coincidem; o segundo reserva a coluna 3 para a saída; o último preenche a célula restante com piso.',
						'O percurso é pequeno e explícito de propósito. Um array de mapa completo seria desnecessário antes de as paredes virarem dados no checkpoint 04, mas renderizar a partir de coordenadas já estabelece a regra de fonte única mantida pelo renderer posterior.',
					],
				},
			],
			run: [
				'O frame ainda se parece com o checkpoint 01 e depois imprime Player: (1, 1). Essa linha adicional é uma evidência útil: o glifo @ e a coordenada relatada vieram do mesmo snapshot de Position.',
				'No exercício, alterar Game::start para (2, 1) deve mover as duas representações. Se apenas uma mudar, a renderização reintroduziu uma segunda fonte de verdade.',
			],
			conclusion: [
				'A imagem agora é uma visão do estado próprio. Construção, observação e percurso têm responsabilidades separadas, e a renderização não pode alterar Game por seu empréstimo const.',
				'O estado ainda não muda depois da construção. O próximo checkpoint adiciona uma fronteira de entrada tipada e dá a Game a única operação de mutação da posição.',
			],
		},
	},
	'03-movement': {
		en: {
			context: [
				'Checkpoint 02 has a trustworthy player position, but every run ends with the same value. To make the program interactive, terminal text must cross a boundary into the game model without letting arbitrary strings become rules.',
				'This version uses an open 5×3 floor so input and mutation can be understood without collision at the same time. W, A, S, and D move; Q stops the loop; invalid text reports an error and leaves state unchanged.',
			],
			model: [
				'The input side owns normalization and parsing. It trims ASCII whitespace, requires exactly one character, lowercases it, and converts it to a closed Command enum. Past that boundary, Game never compares strings.',
				'The control loop follows a fixed order: draw the current state, read one command, reject an error or quit, then ask Game to apply a valid movement. The next iteration draws the mutated state, so input effects are visible without the parser knowing how rendering works.',
				'Game::apply receives a mutable checked reference to self. Each command selects one coordinate change and checks the training-floor edge before mutation. This checkpoint writes those changes directly; checkpoint 04 will factor the repeated coordinate arithmetic into Direction and a delta.',
				'The invariant is that x remains in 0…4 and y remains in 0…2. Invalid input and blocked edge movement are no-ops. Walls, turn costs, and victory are intentionally deferred until the text-to-command boundary is stable.',
			],
			snippets: [
				{
					before: ['Command is the vocabulary shared by parser and model. Its variants describe intent rather than keyboard spelling, so Game does not need to know that MoveUp originated as W or w.'],
					after: [
						'Quit belongs to the same parsed vocabulary but is handled by the loop before Game::apply. CommandError keeps malformed input separate from a legitimate command.',
						'A closed enum also makes missing cases visible when later code matches commands. Accepting raw strings instead would allow normalization and rule logic to drift apart.',
					],
				},
				{
					before: ['Only Game mutates the private Position. The four branches pair a command with the relevant boundary and change one coordinate after that check succeeds.'],
					after: [
						'The checked mutable reference means the caller lends Game for the duration of apply; no second owner is created. A rejected boundary leaves both coordinates untouched.',
						'The repeated branches are acceptable for one open rectangle, but they mix direction with geometry. The next map checkpoint replaces them with a Direction-to-delta conversion before testing a proposed cell.',
					],
				},
				{
					before: ['read_command is the terminal boundary. It treats end-of-input as Quit, trims the line, validates its width, normalizes case once, and returns either a Command or a typed error.'],
					after: [
						'Indexing value[0] happens only after len() confirms that one byte is present. The lowercase conversion makes W and w equivalent without duplicating branches.',
						'The tuple carries the command and error together because the loop needs both outcomes. The parser does not mutate Game; the loop calls apply only when commandError is none.',
					],
				},
			],
			run: [
				'The recorded D, S, Q sequence draws the initial floor, moves right, moves down, and then exits. The representative frame therefore places @ at column 2, row 2.',
				'An unknown key prints its diagnostic and proceeds to the next loop iteration without calling apply. The unchanged following frame demonstrates that parsing failures cannot leak into state mutation.',
			],
			conclusion: [
				'Terminal text now becomes a typed command before it reaches Game, and Game owns every coordinate mutation. The renderer simply observes the result on the next iteration.',
				'All valid directions still succeed unless they cross the rectangular edge. The next checkpoint turns the original # and > symbols into map data, collision, turn counting, and victory.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 02 tem uma posição confiável, mas toda execução termina com o mesmo valor. Para tornar o programa interativo, o texto do terminal precisa atravessar uma fronteira até o modelo sem transformar strings arbitrárias em regras.',
				'Esta versão usa um piso aberto 5×3 para explicar entrada e mutação sem misturar colisão. W, A, S e D movem; Q encerra o loop; texto inválido relata erro e preserva o estado.',
			],
			model: [
				'O lado da entrada é responsável por normalização e parsing. Ele remove espaços ASCII, exige exatamente um caractere, converte para minúsculo e produz um enum Command fechado. Depois dessa fronteira, Game nunca compara strings.',
				'O loop de controle segue uma ordem fixa: desenha o estado atual, lê um comando, rejeita erro ou saída e então pede que Game aplique um movimento válido. A iteração seguinte desenha o estado alterado, sem que o parser conheça a renderização.',
				'Game::apply recebe uma referência mutável verificada para self. Cada comando seleciona uma mudança de coordenada e testa o limite do piso antes da mutação. Este checkpoint escreve as mudanças diretamente; o checkpoint 04 extrai a aritmética repetida para Direction e um delta.',
				'O invariante é x permanecer em 0…4 e y em 0…2. Entrada inválida e movimento bloqueado no limite são no-ops. Paredes, custo de turno e vitória ficam adiados até a fronteira texto-comando estar estável.',
			],
			snippets: [
				{
					before: ['Command é o vocabulário compartilhado por parser e modelo. As variantes descrevem intenção, não a tecla, portanto Game não precisa saber que MoveUp surgiu de W ou w.'],
					after: [
						'Quit pertence ao mesmo vocabulário analisado, mas o loop o trata antes de Game::apply. CommandError mantém entrada malformada separada de um comando legítimo.',
						'Um enum fechado também torna casos ausentes visíveis quando o código usa match. Aceitar strings cruas permitiria que normalização e regras divergissem.',
					],
				},
				{
					before: ['Somente Game altera a Position privada. Os quatro ramos combinam comando e limite relevante, mudando uma coordenada apenas depois de a verificação passar.'],
					after: [
						'A referência mutável verificada significa que o chamador empresta Game durante apply; nenhum segundo dono é criado. Um limite rejeitado preserva as duas coordenadas.',
						'Os ramos repetidos são aceitáveis para um retângulo aberto, mas misturam direção e geometria. O próximo checkpoint os substitui por conversão de Direction em delta antes de testar a célula proposta.',
					],
				},
				{
					before: ['read_command é a fronteira do terminal. Ela trata fim de entrada como Quit, limpa a linha, valida o tamanho, normaliza caixa uma vez e retorna Command ou erro tipado.'],
					after: [
						'O acesso value[0] só ocorre depois de len() confirmar que há um byte. A conversão para minúsculo torna W e w equivalentes sem duplicar ramos.',
						'A tupla leva comando e erro porque o loop precisa dos dois resultados. O parser não altera Game; o loop chama apply apenas quando commandError é none.',
					],
				},
			],
			run: [
				'A sequência registrada D, S, Q desenha o piso inicial, move à direita, move para baixo e encerra. O frame representativo coloca @ na coluna 2, linha 2.',
				'Uma tecla desconhecida imprime o diagnóstico e segue para a próxima iteração sem chamar apply. O frame seguinte inalterado demonstra que falhas de parsing não chegam à mutação.',
			],
			conclusion: [
				'O texto do terminal agora se torna comando tipado antes de chegar a Game, e Game possui toda mutação das coordenadas. O renderer apenas observa o resultado na iteração seguinte.',
				'Toda direção válida ainda funciona, salvo no limite retangular. O próximo checkpoint transforma os símbolos # e > originais em dados de mapa, colisão, contagem de turnos e vitória.',
			],
		},
	},
	'04-map': {
		en: {
			context: [
				'Checkpoint 03 proves the input loop, but its open floor gives every command the same consequence. The visual language from checkpoint 01 still has no authority: # is not solid and > cannot end a run.',
				'This checkpoint makes space part of the rules. A proposed position is checked against a fixed map before Game commits it, so a wall, a floor cell, and the exit can produce different outcomes.',
			],
			model: [
				'Movement is now a two-phase operation. Position::moved computes a candidate by adding a directional delta; Game::apply inspects the candidate and mutates self.player only after the tile accepts it. Rejected movement therefore cannot partially update state.',
				'The map is a 9×7 fixed array stored in row-major order. tile_at exposes it as a const checked slice to tile_from_cells, which first treats every out-of-range coordinate as a wall and only then computes y × WIDTH + x.',
				'Treating the outside as # is an invariant that closes the room even if a caller proposes an invalid coordinate. The slice access is reached only after the signed bounds checks, so the cast to usize cannot turn a negative coordinate into an index.',
				'A wall is a free no-op: the player does not move and turnCount does not advance. A floor cell commits the position and costs one turn. The exit is checked after the commit, so the winning frame and final state agree on the player location.',
				'Game, input, render, and test are separated now because map policy belongs to the engine while terminal text does not. Enemies and damage remain outside this checkpoint.',
			],
			snippets: [
				{
					before: ['Direction first becomes a delta, and moved returns a new Position rather than modifying the original. Game can therefore inspect next before deciding whether to commit it.'],
					after: [
						'The wall branch returns immediately, preserving both player and turnCount. Only line 83 assigns next to the owned position; incrementing the turn immediately afterward ties time to a successful move.',
						'Checking > after assignment means victory is a property of entering the exit cell, not merely facing it. Quit is handled separately and does not need a direction.',
					],
				},
				{
					before: ['The map literal contains exactly WIDTH × HEIGHT cells. tile_from_cells is the single conversion from two-dimensional coordinates to the one-dimensional checked slice.'],
					after: [
						'The bounds branch returns # before indexing. Once it passes, y × WIDTH + x is within 0…62, so the cast and slice access refer to a real cell.',
						'A fixed array suits a map whose dimensions do not change. A growable collection would add allocation and failure handling without supporting a requirement in this game.',
					],
				},
				{
					before: ['The first behavior test drives Game directly. It does not parse keys or inspect terminal text, so a failure identifies collision, time, or victory logic rather than I/O.'],
					after: [
						'MoveUp hits the boundary wall and must not count. Four MoveDown commands then enter the exit; the assertion checks the returned events, final turn, and final outcome together.',
						'This test fixes the free-wall invariant before an enemy makes turn cost more consequential in the next checkpoint.',
					],
				},
			],
			run: [
				'The recorded input first presses W. The diagnostic reports a wall and the following frame still shows Turn: 0. Four S commands then move through the left corridor and enter > on turn 4.',
				'The representative frame shows the player at the exit coordinate. It is rendered from the committed state, while the winning event explains why the loop stops.',
			],
			conclusion: [
				'Movement now asks the map for permission, and the engine owns the invariants for collision, elapsed turns, and victory. Terminal I/O remains outside those rules.',
				'The room is still harmless: nothing reacts after a successful move. The next checkpoint gives each effective player action an enemy response and makes the timing observable.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 03 comprova o loop de entrada, mas o piso aberto dá a todo comando a mesma consequência. A linguagem visual do checkpoint 01 ainda não tem autoridade: # não é sólido e > não encerra uma execução.',
				'Este checkpoint transforma espaço em regra. Uma posição proposta é consultada no mapa fixo antes de Game confirmá-la, então parede, piso e saída podem produzir resultados diferentes.',
			],
			model: [
				'Movimento agora tem duas fases. Position::moved calcula uma candidata somando um delta direcional; Game::apply inspeciona a candidata e só altera self.player depois que a célula a aceita. Movimento rejeitado não atualiza parte do estado.',
				'O mapa é um array fixo 9×7 em ordem por linhas. tile_at o expõe como slice const verificado para tile_from_cells, que primeiro trata toda coordenada fora dos limites como parede e só então calcula y × WIDTH + x.',
				'Tratar o exterior como # é um invariante que fecha a sala mesmo se um chamador propuser coordenada inválida. O acesso ao slice só ocorre depois das verificações com sinal, portanto o cast para usize não transforma coordenada negativa em índice.',
				'Parede é no-op gratuito: o jogador não se move e turnCount não avança. Piso confirma a posição e custa um turno. A saída é verificada depois da confirmação, então frame vencedor e estado final concordam sobre a posição.',
				'Game, input, render e test são separados porque a política do mapa pertence ao motor e o texto do terminal não. Inimigos e dano continuam fora desta etapa.',
			],
			snippets: [
				{
					before: ['Direction primeiro vira delta, e moved retorna uma nova Position em vez de alterar a original. Assim Game inspeciona next antes de decidir confirmá-la.'],
					after: [
						'O ramo da parede retorna imediatamente, preservando player e turnCount. Somente a linha 83 atribui next à posição própria; incrementar o turno logo depois liga tempo a movimento bem-sucedido.',
						'Testar > depois da atribuição faz da vitória uma propriedade de entrar na saída, não apenas olhar para ela. Quit é tratado separadamente e não precisa de direção.',
					],
				},
				{
					before: ['O literal do mapa contém exatamente WIDTH × HEIGHT células. tile_from_cells é a única conversão das coordenadas bidimensionais para o slice unidimensional verificado.'],
					after: [
						'O ramo de limites retorna # antes do acesso. Depois dele, y × WIDTH + x está em 0…62, então o cast e o slice referem-se a uma célula real.',
						'Array fixo serve a um mapa cujas dimensões não mudam. Uma coleção expansível adicionaria alocação e tratamento de falhas sem atender a um requisito deste jogo.',
					],
				},
				{
					before: ['O primeiro teste de comportamento aciona Game diretamente. Ele não analisa teclas nem texto do terminal, portanto uma falha aponta para colisão, tempo ou vitória, não E/S.'],
					after: [
						'MoveUp atinge a parede externa e não deve contar. Quatro MoveDown entram na saída; a asserção verifica eventos retornados, turno final e resultado final juntos.',
						'O teste fixa o invariante da parede gratuita antes de um inimigo tornar o custo de turno mais importante no próximo checkpoint.',
					],
				},
			],
			run: [
				'A entrada registrada começa com W. O diagnóstico relata parede e o frame seguinte ainda mostra Turn: 0. Quatro comandos S percorrem o corredor esquerdo e entram em > no turno 4.',
				'O frame representativo mostra o jogador na coordenada da saída. Ele é renderizado do estado confirmado, enquanto o evento de vitória explica por que o loop para.',
			],
			conclusion: [
				'O movimento agora pede permissão ao mapa, e o motor possui os invariantes de colisão, turnos decorridos e vitória. A E/S do terminal permanece fora dessas regras.',
				'A sala ainda é inofensiva: nada reage depois de um movimento. O próximo checkpoint dá uma resposta inimiga a cada ação efetiva e torna o tempo observável.',
			],
		},
	},
	'05-goblin': {
		en: {
			context: [
				'Checkpoint 04 makes movement meaningful, but the optimal route never changes and health would have no purpose. Adding one goblin introduces pressure, provided the player can understand exactly when the enemy is allowed to move or attack.',
				'This checkpoint defines that timing as engine data. One effective player turn permits one goblin response. Entering danger produces a warning; damage is possible only when the player began a later action already adjacent and failed to get away.',
			],
			model: [
				'TurnResult is the complete observable result of one command: a player event, an enemy event, and spentTurn. The CLI displays those facts but never recomputes adjacency, turn cost, or damage. Keeping policy in Game prevents terminal wording from becoming a second rules engine.',
				'Game::apply captures DANGER_BEFORE before attempting the player action. This snapshot is the temporal contract. New adjacency created by the current action can warn, but it cannot retroactively authorize an attack in the same turn.',
				'spentTurn distinguishes time from input. Help, Quit, and a safe collision do not advance the goblin. A blocked action while already in danger does spend time, because doing nothing under immediate threat is still the player response for that turn.',
				'goblinTurn first considers an authorized attack, then current adjacency, then movement. That order enforces “warn before damage” and “move or attack, never both.” tryGoblinStep also refuses the player, walls, and the exit.',
				'The pursuit chooses horizontal progress before vertical progress in this version. Variety is deliberately deferred; the final checkpoint changes tie order with a seed while preserving this turn contract.',
			],
			snippets: [
				{
					before: ['TurnResult names the three pieces of information the caller needs after apply. The result is a value, not mutable shared state, so the renderer receives a coherent account of one command.'],
					after: [
						'PlayerEvent and EnemyEvent are separate because both sides can act during one effective turn. Defaults represent the absence of an enemy event and a free action without requiring several constructors.',
						'spentTurn is explicit even though Game also stores turnCount. The former explains this command to the caller; the latter records cumulative engine state. The CLI does not infer one from the other.',
					],
				},
				{
					before: ['apply snapshots adjacency in DANGER_BEFORE before computing next. The branches then distinguish a safe no-op from the same no-op performed while the goblin was already adjacent.'],
					after: [
						'A safe wall or goblin collision returns with spentTurn false and does not call goblinTurn. Under prior danger, the same failed movement increments turnCount and calls goblinTurn(true), allowing the promised attack.',
						'A successful move always spends a turn. Passing DANGER_BEFORE—not newly calculated adjacency—means approaching the goblin can produce Threatened but cannot lose HP until a later response. Reaching the exit ends the game before any enemy action.',
					],
				},
				{
					before: ['goblinTurn receives attack permission from apply rather than deriving history from the current board. It can therefore distinguish “was already dangerous” from “became adjacent just now.”'],
					after: [
						'The attack branch runs only when canAttack and adjacency are both true. Otherwise, current adjacency returns Threatened without damage. Pursuit happens only when neither condition applies.',
						'After one successful step, the method reports Threatened if it reached adjacency or Moved otherwise. It returns immediately and never falls through to attack, preserving one enemy consequence per turn.',
					],
				},
				{
					before: ['The focused tests encode both sides of the timing contract: a wall is free while safe, and first adjacency warns before a later failed response causes damage.'],
					after: [
						'safe_wall_is_free checks the returned player event, spentTurn, and cumulative turn together. The second test drives a deterministic approach, captures the warning result, then verifies that the following blocked action attacks exactly once.',
						'These assertions test Game directly. Terminal output may change wording later without weakening the rule that warning precedes damage.',
					],
				},
			],
			run: [
				'The recorded route lets the goblin approach, exposes the warning at full health, and then demonstrates damage on later unresolved danger. The final representative frame is the deterministic defeat state at HP 0 and turn 10.',
				'Reading the transcript should show no combined move-and-attack event. Safe failed actions leave the turn unchanged; the same failure after a warning consumes the response and may subtract one HP.',
			],
			conclusion: [
				'Time is now an explicit engine contract. Game reports what each side did and whether time advanced, while the CLI remains a presentation layer that cannot invent rules.',
				'The player can understand danger but can only flee. The next checkpoint reuses direction for a second action family: spending a limited arrow to trace a line of sight.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 04 torna movimento significativo, mas a rota ideal nunca muda e vida não teria função. Um goblin adiciona pressão, desde que o jogador consiga entender exatamente quando o inimigo pode mover ou atacar.',
				'Este checkpoint define esse tempo como dado do motor. Um turno efetivo do jogador permite uma resposta do goblin. Entrar em perigo gera aviso; dano só é possível quando o jogador começa uma ação posterior já adjacente e não consegue escapar.',
			],
			model: [
				'TurnResult é o resultado observável completo de um comando: evento do jogador, evento do inimigo e spentTurn. A CLI exibe esses fatos, mas nunca recalcula adjacência, custo de turno ou dano. Manter a política em Game impede que o texto do terminal vire um segundo motor de regras.',
				'Game::apply captura DANGER_BEFORE antes de tentar a ação do jogador. Esse snapshot é o contrato temporal. Nova adjacência criada pela ação atual pode avisar, mas não autoriza retroativamente um ataque no mesmo turno.',
				'spentTurn separa tempo de entrada. Help, Quit e colisão segura não avançam o goblin. Uma ação bloqueada quando já há perigo gasta tempo, pois não fazer nada sob ameaça imediata ainda é a resposta do jogador naquele turno.',
				'goblinTurn considera primeiro ataque autorizado, depois adjacência atual e por último movimento. Essa ordem garante “avisar antes de ferir” e “mover ou atacar, nunca os dois”. tryGoblinStep também recusa jogador, paredes e saída.',
				'A perseguição prioriza progresso horizontal antes do vertical nesta versão. Variedade fica adiada; o checkpoint final muda a ordem de empate com seed sem alterar o contrato de turno.',
			],
			snippets: [
				{
					before: ['TurnResult nomeia as três informações que o chamador precisa depois de apply. O resultado é um valor, não estado compartilhado mutável, então o renderer recebe um relato coerente de um comando.'],
					after: [
						'PlayerEvent e EnemyEvent são separados porque os dois lados podem agir no mesmo turno efetivo. Valores padrão representam ausência de evento inimigo e ação gratuita sem exigir vários construtores.',
						'spentTurn é explícito embora Game também guarde turnCount. O primeiro explica este comando ao chamador; o segundo registra estado acumulado. A CLI não deduz um a partir do outro.',
					],
				},
				{
					before: ['apply registra a adjacência em DANGER_BEFORE antes de calcular next. Os ramos então distinguem no-op seguro do mesmo no-op realizado quando o goblin já estava adjacente.'],
					after: [
						'Parede ou colisão segura retorna com spentTurn false e não chama goblinTurn. Sob perigo anterior, o mesmo movimento falho incrementa turnCount e chama goblinTurn(true), permitindo o ataque prometido.',
						'Movimento bem-sucedido sempre gasta turno. Passar DANGER_BEFORE—e não adjacência recalculada—permite que aproximação produza Threatened sem perder HP até uma resposta posterior. Alcançar a saída encerra antes de ação inimiga.',
					],
				},
				{
					before: ['goblinTurn recebe de apply a permissão de ataque em vez de deduzir histórico do tabuleiro atual. Assim distingue “já era perigoso” de “ficou adjacente agora”.'],
					after: [
						'O ramo de ataque só executa quando canAttack e adjacência são verdadeiros. Caso contrário, adjacência atual retorna Threatened sem dano. A perseguição ocorre apenas quando nenhuma condição se aplica.',
						'Depois de um passo, o método relata Threatened se alcançou adjacência ou Moved caso contrário. Ele retorna sem cair em ataque, preservando uma consequência inimiga por turno.',
					],
				},
				{
					before: ['Os testes focados codificam os dois lados do contrato temporal: parede é gratuita quando segura, e a primeira adjacência avisa antes de uma resposta falha posterior causar dano.'],
					after: [
						'safe_wall_is_free verifica evento retornado, spentTurn e turno acumulado juntos. O segundo teste conduz uma aproximação determinística, captura o aviso e verifica que a próxima ação bloqueada ataca exatamente uma vez.',
						'As asserções testam Game diretamente. A saída do terminal pode mudar de texto depois sem enfraquecer a regra de que aviso precede dano.',
					],
				},
			],
			run: [
				'A rota registrada permite a aproximação do goblin, expõe o aviso com vida cheia e demonstra dano em perigo não resolvido posterior. O frame representativo final é a derrota determinística com HP 0 no turno 10.',
				'O transcript não deve mostrar evento combinado de movimento e ataque. Ações falhas seguras preservam o turno; a mesma falha depois de um aviso consome a resposta e pode subtrair um HP.',
			],
			conclusion: [
				'Tempo agora é contrato explícito do motor. Game relata o que cada lado fez e se o tempo avançou; a CLI continua camada de apresentação incapaz de inventar regras.',
				'O jogador entende o perigo, mas só pode fugir. O próximo checkpoint reutiliza direção para uma segunda família de ação: gastar uma flecha limitada para percorrer linha de visão.',
			],
		},
	},
	'06-archery': {
		en: {
			context: [
				'Checkpoint 05 creates a fair threat, but the archer has only movement commands. The map already contains corridors and walls, so it can also answer a new question: what lies along a chosen direction?',
				'This checkpoint adds three arrows and I, J, K, L shot commands. A shot consumes one arrow, advances cell by cell, stops at a wall, and kills the goblin if the cursor reaches its position first.',
			],
			model: [
				'Movement and shooting share Direction because both choose up, left, down, or right. They remain distinct Command variants because their resources and stopping rules differ. Reusing direction does not collapse two different actions into one.',
				'Game::apply preserves the TurnResult contract from checkpoint 05. It records DANGER_BEFORE, delegates to movePlayer or shoot, then decides whether a no-op is free or consumes a threatened turn. The caller still receives one player event and one enemy response.',
				'shoot checks the empty quiver before decrementing. With an arrow available, the cursor starts in the adjacent cell and advances until tile_at returns #. Encountering the live goblin first changes goblinAlive and returns ShotHit; reaching a wall returns ShotMiss.',
				'The line-of-sight loop relies on the map invariant established in checkpoint 04: outside coordinates read as walls. It therefore terminates even when fired toward the map edge. Arrows do not pass through walls, and one command consumes at most one arrow.',
				'The player cannot recover arrows in this project. That keeps inventory finite and visible without adding pickups or allocation, which are outside the combat rule being introduced.',
			],
			snippets: [
				{
					before: ['apply classifies the command after preserving prior danger. is_shot chooses the action family; both helpers return PlayerEvent, allowing the existing turn policy to process their outcomes uniformly.'],
					after: [
						'Wall, GoblinBlocks, and NoArrows are no-ops. They stay free while safe but permit an attack if danger existed before the command. A hit or miss consumes a normal turn and then allows the goblin response if it survived.',
						'The exit check remains after the player action. Shooting cannot move the player, so it cannot accidentally win; movement can enter > under the same rule as before.',
					],
				},
				{
					before: ['movePlayer and shoot isolate their different state transitions. The shot method makes resource consumption happen once, before line-of-sight traversal.'],
					after: [
						'NoArrows returns before decrementing or creating a cursor. Otherwise arrowCount decreases exactly once regardless of hit or miss. Each loop iteration examines one cell before advancing in the same Direction.',
						'Setting goblinAlive false is the only combat mutation. The later goblinTurn begins by checking that flag, so a goblin killed by this shot cannot respond in the same turn.',
					],
				},
				{
					before: ['Input tests keep the two directional key diamonds distinct at the parser boundary. Uppercase W must become movement, while lowercase l must become a rightward shot.'],
					after: [
						'The assertion verifies both parsed commands and both error values. One lowercase normalization supports either input case without changing the enum seen by Game.',
						'Testing parse directly separates keyboard mapping regressions from combat regressions; game tests can focus on line of sight, ammunition, and turn effects.',
					],
				},
			],
			run: [
				'The recorded S, S, L, S, S route aligns the player with the goblin, shoots right, then reaches the exit. The kill occurs on turn 3 and the win on turn 5 with 3 HP and 2 arrows.',
				'An upward shot from the starting cell demonstrates the other branch: it consumes one arrow, meets the boundary wall, and returns ShotMiss. The transcript distinguishes hit, miss, and empty quiver instead of reducing them to one boolean.',
			],
			conclusion: [
				'Arrowfall now has movement, pursuit, danger, a limited ranged action, and two possible successful responses: escape or defeat the threat before escaping.',
				'The rules are complete, but pursuit ties always choose the same axis and interactive redraws are poor golden evidence. The final checkpoint adds controlled variation and release-facing options without changing combat policy.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 05 cria ameaça justa, mas o arqueiro só tem movimento. O mapa já contém corredores e paredes, então pode responder a outra pergunta: o que existe ao longo de uma direção?',
				'Este checkpoint adiciona três flechas e comandos de disparo I, J, K, L. Um disparo consome uma flecha, avança célula a célula, para numa parede e mata o goblin se o cursor alcançar sua posição primeiro.',
			],
			model: [
				'Movimento e disparo compartilham Direction porque ambos escolhem cima, esquerda, baixo ou direita. Continuam variantes Command distintas porque recursos e condições de parada diferem. Reutilizar direção não transforma duas ações em uma.',
				'Game::apply preserva o contrato TurnResult do checkpoint 05. Registra DANGER_BEFORE, delega a movePlayer ou shoot e decide se um no-op é gratuito ou consome um turno ameaçado. O chamador ainda recebe um evento do jogador e uma resposta inimiga.',
				'shoot verifica a aljava vazia antes de decrementar. Com flecha disponível, o cursor começa na célula adjacente e avança até tile_at retornar #. Encontrar o goblin vivo primeiro altera goblinAlive e retorna ShotHit; chegar à parede retorna ShotMiss.',
				'O loop de linha de visão depende do invariante do checkpoint 04: coordenadas externas são paredes. Portanto ele termina mesmo disparando para a borda. Flechas não atravessam paredes e um comando consome no máximo uma flecha.',
				'O jogador não recupera flechas neste projeto. Isso mantém o inventário finito e visível sem adicionar pickups ou alocação, fora da regra de combate introduzida agora.',
			],
			snippets: [
				{
					before: ['apply classifica o comando depois de preservar o perigo anterior. is_shot escolhe a família de ação; os dois helpers retornam PlayerEvent, permitindo que a política de turnos processe os resultados de modo uniforme.'],
					after: [
						'Wall, GoblinBlocks e NoArrows são no-ops. Permanecem gratuitos em segurança, mas permitem ataque se o perigo existia antes do comando. Acerto ou erro gasta turno normal e permite resposta do goblin se ele sobreviveu.',
						'A verificação da saída continua depois da ação. Disparo não move o jogador, então não vence por acidente; movimento pode entrar em > pela mesma regra anterior.',
					],
				},
				{
					before: ['movePlayer e shoot isolam transições de estado diferentes. O disparo consome o recurso uma vez, antes de percorrer a linha de visão.'],
					after: [
						'NoArrows retorna antes de decrementar ou criar cursor. Caso contrário, arrowCount diminui exatamente uma vez independentemente de acerto ou erro. Cada iteração examina uma célula antes de avançar na mesma Direction.',
						'Definir goblinAlive como false é a única mutação do combate. O goblinTurn posterior começa verificando essa flag, portanto um goblin morto pelo disparo não responde no mesmo turno.',
					],
				},
				{
					before: ['Os testes de entrada mantêm os dois losangos direcionais distintos na fronteira do parser. W maiúsculo deve virar movimento, enquanto l minúsculo vira disparo à direita.'],
					after: [
						'A asserção verifica os dois comandos e os dois erros. Uma normalização para minúsculas aceita ambas as caixas sem alterar o enum visto por Game.',
						'Testar parse diretamente separa regressões de teclado das de combate; os testes de jogo podem focar linha de visão, munição e efeitos de turno.',
					],
				},
			],
			run: [
				'A rota registrada S, S, L, S, S alinha jogador e goblin, dispara à direita e chega à saída. A morte ocorre no turno 3 e a vitória no turno 5, com 3 HP e 2 flechas.',
				'Um disparo para cima na célula inicial demonstra o outro ramo: consome uma flecha, encontra a parede externa e retorna ShotMiss. O transcript distingue acerto, erro e aljava vazia em vez de reduzi-los a booleano.',
			],
			conclusion: [
				'Arrowfall agora tem movimento, perseguição, perigo, ação à distância limitada e duas respostas bem-sucedidas: escapar ou derrotar a ameaça antes de escapar.',
				'As regras estão completas, mas empates sempre escolhem o mesmo eixo e redesenho interativo é evidência golden ruim. O checkpoint final adiciona variação controlada e opções de release sem alterar a política de combate.',
			],
		},
	},
	'07-final': {
		en: {
			context: [
				'Checkpoint 06 is playable, but every pursuit tie chooses the same path, terminal redraws mix control bytes with evidence, and changing a run requires editing source. These are release-boundary problems rather than new game rules.',
				'The final checkpoint adds an explicit seed, command-line options, plain output, focused tests, and a golden campaign. The goal is controlled variation: different seeds may choose different paths, while the same seed and input reproduce the same run.',
			],
			model: [
				'Game owns both sourceSeed and Generator. Game::start initializes them from the same argument, so the displayed seed identifies the random stream that controls pursuit decisions. No renderer or CLI code draws random values.',
				'Randomness is used only when horizontal and vertical distance are both nonzero. That is a genuine tie between two legal pursuit priorities. Generator::boolean may swap them, after which the existing collision-aware step logic remains unchanged.',
				'Options separates process policy from engine policy. --seed selects reproducibility and --no-clear selects presentation; neither changes movement, damage, line of sight, or victory. Invalid options fail before Game starts.',
				'The parser is stateful because --seed consumes the following argument. expectsSeed records that one-token context, while finish returns a complete Options value. An absent or empty seed uses the documented default; malformed non-empty values produce InvalidSeed.',
				'Plain rendering is the test boundary. The renderer builds one frame from const Game state, and a golden test compares the exact map, status, seed, and important messages. ANSI screen clearing is confined to interactive presentation.',
				'Unsafe code, network play, save files, and dynamic maps remain out of scope. None is required to qualify this terminal package, and adding them would obscure the deterministic engine boundary established here.',
			],
			snippets: [
				{
					before: ['The final Game stores the seed that explains a run and the generator that advances it. Both are initialized exactly once in Game::start alongside the rest of the authoritative state.'],
					after: [
						'sourceSeed remains unchanged for status and diagnostics. random is private mutable state whose sequence advances only when the engine resolves a pursuit tie.',
						'Passing the seed into Game rather than using a global generator makes independent games reproducible and keeps tests free to choose their own streams.',
					],
				},
				{
					before: ['The random decision is deliberately narrow. It runs only when both DX and DY are nonzero, where horizontal-first and vertical-first are alternative pursuit choices.'],
					after: [
						'A true result swaps the two preferred directions. The later tryGoblinStep calls still reject walls, the player cell, and the exit, so randomness chooses order but cannot bypass invariants.',
						'Using a seeded generator does not promise identical behavior across unrelated implementations; within this qualified Flecha package, the committed seed, source, and tests define the reproducible run.',
					],
				},
				{
					before: ['Options owns CLI defaults and Parser owns the temporary state needed while consuming arguments. This keeps process syntax out of Game and makes option failures testable before launch.'],
					after: [
						'--no-clear changes only clearFrames. --seed sets expectsSeed, and the following non-option token is converted to u64. A new option where a value was expected is rejected as an option rather than silently accepted as a seed.',
						'The default seed is a named constant used for absent or empty values. Centralizing it ensures the displayed default, tests, and recorded command all refer to the same run.',
					],
				},
				{
					before: ['The render test treats the complete plain frame and event messages as public behavior. It starts a game with seed 42, draws from const state, and compares exact strings.'],
					after: [
						'The expected frame includes map cells, HP, arrows, turn, and seed. Separate message assertions protect the distinctions between hit, miss, and threat that the engine exposes through events.',
						'This is intentionally stricter than checking a few substrings. A formatting change must update an explicit golden contract, while engine tests separately protect rules such as free walls, warning before damage, and shot outcomes.',
					],
				},
			],
			run: [
				'The qualified command uses --no-clear --seed 20261105 and the recorded S, S, L, S, S input. The final frame reports that exact seed, 3 HP, 2 arrows, turn 5, and the escape messages without ANSI control bytes.',
				'Running the same command twice must produce byte-identical stdout. Changing only the seed may change pursuit tie choices, but the selected seed remains visible and can reproduce the run.',
			],
			conclusion: [
				'The final package has a deterministic engine boundary, explicit process options, eleven focused tests, exact golden output, and an optimized build path. Variation is controlled by input rather than hidden global state.',
				'Arrowfall stops here as a small terminal program that can be checked, tested, built, run, and distributed. The complete snapshot below is the release candidate used by every command on this page.',
			],
		},
		'pt-br': {
			context: [
				'O checkpoint 06 é jogável, mas todo empate de perseguição escolhe a mesma rota, redesenhos misturam bytes de controle com evidência e mudar uma execução exige editar código. São problemas da fronteira de release, não novas regras.',
				'O checkpoint final adiciona seed explícita, opções de linha de comando, saída simples, testes focados e campanha golden. O objetivo é variação controlada: seeds diferentes podem escolher caminhos diferentes, enquanto a mesma seed e entrada reproduzem a execução.',
			],
			model: [
				'Game possui sourceSeed e Generator. Game::start inicializa os dois com o mesmo argumento, então a seed exibida identifica o fluxo aleatório que controla decisões de perseguição. Renderer e CLI não sorteiam valores.',
				'Aleatoriedade só é usada quando as distâncias horizontal e vertical são ambas diferentes de zero. Esse é um empate real entre duas prioridades legais. Generator::boolean pode trocá-las; depois disso, a lógica existente de passo com colisão continua igual.',
				'Options separa política do processo da política do motor. --seed seleciona reprodutibilidade e --no-clear seleciona apresentação; nenhuma altera movimento, dano, linha de visão ou vitória. Opções inválidas falham antes de Game iniciar.',
				'O parser tem estado porque --seed consome o argumento seguinte. expectsSeed registra esse contexto de um token, enquanto finish retorna Options completo. Seed ausente ou vazia usa o padrão documentado; valor não vazio malformado produz InvalidSeed.',
				'Renderização simples é a fronteira de teste. O renderer constrói um frame a partir de Game const, e um teste golden compara mapa, status, seed e mensagens importantes. Limpeza ANSI fica confinada à apresentação interativa.',
				'Código unsafe, jogo em rede, saves e mapas dinâmicos ficam fora do escopo. Nada disso é necessário para qualificar este pacote de terminal, e adicioná-los esconderia a fronteira determinística estabelecida aqui.',
			],
			snippets: [
				{
					before: ['O Game final armazena a seed que explica a execução e o gerador que a avança. Os dois são inicializados uma vez em Game::start junto do restante do estado autoritativo.'],
					after: [
						'sourceSeed permanece imutável para status e diagnósticos. random é estado mutável privado cuja sequência avança apenas quando o motor resolve empate de perseguição.',
						'Passar a seed para Game em vez de usar gerador global torna jogos independentes reproduzíveis e permite que testes escolham seus próprios fluxos.',
					],
				},
				{
					before: ['A decisão aleatória é estreita de propósito. Ela ocorre apenas quando DX e DY são diferentes de zero, onde prioridade horizontal ou vertical são alternativas de perseguição.'],
					after: [
						'Resultado verdadeiro troca as duas direções preferidas. As chamadas posteriores a tryGoblinStep ainda rejeitam paredes, jogador e saída; aleatoriedade escolhe ordem, mas não contorna invariantes.',
						'Gerador com seed não promete comportamento idêntico em implementações alheias; neste pacote Flecha qualificado, seed, código e testes versionados definem a execução reproduzível.',
					],
				},
				{
					before: ['Options possui os padrões da CLI e Parser possui o estado temporário para consumir argumentos. Isso mantém sintaxe do processo fora de Game e torna falhas de opção testáveis antes do início.'],
					after: [
						'--no-clear altera apenas clearFrames. --seed define expectsSeed, e o token não-opção seguinte vira u64. Nova opção onde se esperava valor é rejeitada como opção, não aceita silenciosamente como seed.',
						'A seed padrão é constante nomeada usada para valores ausentes ou vazios. Centralizá-la faz exibição, testes e comando registrado se referirem à mesma execução.',
					],
				},
				{
					before: ['O teste de render trata frame simples completo e mensagens como comportamento público. Inicia jogo com seed 42, desenha de estado const e compara strings exatas.'],
					after: [
						'O frame esperado contém mapa, HP, flechas, turno e seed. Asserções separadas preservam as distinções entre acerto, erro e ameaça expostas pelo motor como eventos.',
						'Isso é mais estrito que verificar substrings. Mudança de formatação atualiza contrato golden explícito, enquanto testes do motor protegem regras como parede gratuita, aviso antes de dano e resultados de disparo.',
					],
				},
			],
			run: [
				'O comando qualificado usa --no-clear --seed 20261105 e a entrada S, S, L, S, S. O frame final relata essa seed, 3 HP, 2 flechas, turno 5 e as mensagens de fuga sem bytes de controle ANSI.',
				'Executar o mesmo comando duas vezes deve produzir stdout idêntica byte a byte. Alterar só a seed pode mudar escolhas de empate, mas a seed escolhida permanece visível e reproduz a execução.',
			],
			conclusion: [
				'O pacote final tem fronteira determinística do motor, opções explícitas, onze testes focados, saída golden exata e caminho de build otimizado. A variação é controlada por entrada, não estado global oculto.',
				'Arrowfall termina como programa pequeno de terminal que pode ser verificado, testado, compilado, executado e distribuído. O snapshot completo abaixo é o candidato de release usado por todos os comandos da página.',
			],
		},
	},
};

export function narrativeFor(id, locale) {
	return arrowfallNarrative[id]?.[locale];
}
