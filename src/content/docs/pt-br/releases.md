---
title: Versões
description: Versões atuais da Flecha e status do projeto.
---

## 0.2.5

Lançada em 27 de outubro de 2026. A Flecha 0.2.5 permite que o Longbow crie e opere em projetos cujos nomes não são identificadores da Flecha, incluindo nomes com espaços e hífens.

`longbow check`, `build`, `run`, `test` e `clean` agora aceitam um diretório de projeto opcional. Nomes de projetos de biblioteca são normalizados para identificadores de módulo válidos da Flecha.

[Ver v0.2.5 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.5)

## 0.2.4

Lançada em 25 de outubro de 2026. A Flecha 0.2.4 corrige a seleção de testes em módulos lógicos compostos por vários arquivos-fonte.

`flecha test <arquivo>` agora executa somente os testes declarados no arquivo solicitado, mas continua carregando o módulo lógico de testes completo para declarações compartilhadas, imports e análise semântica. `longbow test` agora executa todo arquivo-fonte que declara um módulo de testes, preservando a cobertura completa do projeto.

[Ver v0.2.4 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.4)

## 0.2.3

Lançada em 22 de outubro de 2026. A Flecha 0.2.3 corrige reempréstimos aninhados do receptor nos argumentos de chamadas de métodos. O empréstimo mutável do receptor passa a ser ativado após a avaliação dos argumentos, permitindo reempréstimos compartilhados temporários que produzem valores comuns, como `self->read(self->remaining())`.

Mutações sobrepostas, movimentos e argumentos que mantêm um empréstimo durante a chamada mutável continuam rejeitados.

[Ver v0.2.3 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.3)

## 0.2.2

Lançada em 21 de outubro de 2026. A Flecha 0.2.2 corrige a classificação de estado zero para estruturas que contêm proprietários move-only de arrays com tamanho em tempo de execução. Proprietários `*[]T` nulos passam a ser trivialmente zeráveis, permitindo que estruturas equivalentes usem `none` diretamente, inclusive dentro de resultados em tupla, sem enfraquecer a semântica de propriedade move-only.

[Ver v0.2.2 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.2)

## 0.2.1

Lançada em 20 de outubro de 2026. A Flecha 0.2.1 corrige o modelo de módulos introduzido na v0.2.0: módulos agora são escopos lógicos formados por declarações em qualquer quantidade de arquivos-fonte, e o nome do arquivo não define mais a identidade do módulo.

Imports selecionam módulos declarados, não arquivos. Cada unidade-fonte mantém seus próprios imports e compartilha declarações com os demais arquivos do mesmo módulo lógico. Módulos distintos importados com o mesmo nome podem se sobrepor: membros exclusivos são resolvidos normalmente, membros ambíguos geram erro no ponto de uso e aliases isolam cada módulo. Testes agora são associados por módulos `<name>_test` declarados, permitindo que vários arquivos com nomes livres contribuam para um único módulo de teste.

O legado `private module` continua aceito com aviso de depreciação. Código novo deve usar `quiver` para visibilidade no mesmo namespace. `export` passa a significar sempre visibilidade pública da declaração, inclusive dentro de um módulo privado legado; a restrição de importação do módulo ainda controla quem pode importá-lo.

[Ver v0.2.1 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.1), ler a [correção completa do modelo de módulos — em inglês](/docs/reference/release_0_2_1/) ou consultar o [guia atual de módulos e imports — em inglês](/docs/reference/modules/).

## 0.2.0

Lançada em 20 de outubro de 2026. A Flecha 0.2.0 adiciona valores chamáveis e closures de primeira classe, propriedade explícita de capturas, callables genéricos e de uso único com `once`, `defer` para callables, visibilidade por quiver, testes nativos da linguagem, algoritmos com callbacks, arrays ampliados e APIs mais completas para sistema de arquivos e streams.

[Ver v0.2.0 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.0) ou ler as [notas completas da v0.2.0 — em inglês](/docs/reference/release_0_2_0/).

## 0.1.3

Lançada em 19 de outubro de 2026. Esta versão de correção melhora a interoperabilidade entre caracteres e bytes: valores de caractere passam a ser convertidos implicitamente para `u8`, e dados emprestados de strings podem atravessar limites compatíveis de ponteiros para bytes em chamadas externas.

[Ver v0.1.3 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.3)

## 0.1.2

Lançada em 17 de outubro de 2026. Esta versão de correção ajusta o reconhecimento de construções triviais de zero, inclusive em estruturas genéricas e aninhadas.

[Ver v0.1.2 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.2)

## 0.1.1

Versão de estabilização do primeiro toolchain instalável, com verificações de instalação limpa em Linux, Windows e macOS, melhores diagnósticos do linker e pacotes para editores.

[Ver v0.1.1 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.1)

## 0.1.0

Primeira versão marcada da Flecha, estabelecendo o compilador, runtime, biblioteca padrão, empacotamento e superfície inicial da linguagem.

[Ver v0.1.0 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.1.0)

:::caution[Versões em estágio inicial]
Flecha ainda não possui uma linguagem ou ABI estável. Leia as notas de cada versão e fixe versões em projetos reproduzíveis.
:::

## Desenvolvimento atual

A Flecha v0.3.0 é o marco atual de desenvolvimento e ainda não foi lançada. A
versão lançada mais recente é a v0.2.5. O branch `master`
acompanha o trabalho rumo à v0.3.0, e seus recursos permanecem em desenvolvimento
até aparecerem em uma versão marcada.

Consulte a [versão v0.2.5 no GitHub](https://github.com/segfaultcafe/flecha/releases/tag/v0.2.5), o [marco da biblioteca padrão v0.3.0 — em inglês](/docs/reference/release_0_3/) ou o [changelog completo no GitHub](https://github.com/segfaultcafe/flecha/blob/master/CHANGELOG.md).
