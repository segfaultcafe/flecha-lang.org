---
title: '4. Projeto: placar com testes'
description: Combine módulos, dados fixos, funções, erros explícitos e testes em um aplicativo pequeno.
---

Construa `archer-score`, que soma três rodadas e rejeita valores fora do
intervalo aceito. Mantenha validação e soma em `score.fl`, formatação em
`main.fl` e casos de sucesso e falha em `score_test.fl`.

A qualificação é o projeto: `longbow check` deve aceitar o grafo completo,
`longbow test` deve cobrir valores-limite e um inválido, e `longbow run` deve
imprimir um resultado estável. Troque uma entrada por valor inválido e confirme
que o programa retorna status não zero documentado, sem limitar silenciosamente.

O projeto é pequeno para caber em uma revisão. Seu valor está na separação dos
contratos: módulos possuem nomes, funções possuem validação, a entrada possui os
diagnósticos e testes possuem a evidência.

## Trilha concluída

Continue em [Intermediário: propriedade, movimentos e empréstimos
verificados](/pt-br/tutorials/intermediate/ownership-and-borrows/).
