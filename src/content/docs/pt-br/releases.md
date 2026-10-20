---
title: Versões
description: Versões atuais da Flecha e status do projeto.
---

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

## Desenvolvimento em `master`

O trabalho após a v0.1.3 inclui valores chamáveis e closures com capturas explícitas `copy`, por referência verificada, `lend` e `own`; assinaturas chamáveis genéricas; movimentação segura de valores que contêm callables; e declarações restritas ao quiver e módulos privados. Esses recursos representam o estado de desenvolvimento e não fazem parte do contrato da v0.1.3.

Consulte o [marco da v0.2.0 — em inglês](/docs/reference/release_0_2/) para acompanhar o que já foi implementado e o que ainda falta, ou veja o [changelog completo no GitHub](https://github.com/segfaultcafe/flecha/blob/master/CHANGELOG.md).
