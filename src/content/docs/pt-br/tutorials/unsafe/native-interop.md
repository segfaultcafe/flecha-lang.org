---
title: '3. FFI e interoperabilidade nativa'
description: Traduza contratos de ABI para wrappers Flecha estreitos com propriedade e falhas explícitas.
---

Comece pela declaração nativa, não por um tipo Flecha adivinhado. Registre ABI,
convenção de chamada, larguras, constness, layout, representação de strings,
tempo de vida, threads e erros. Rejeite a plataforma no build quando esses fatos
não corresponderem.

Mantenha declarações `extern` privadas em um módulo. Ele valida entradas
seguras, faz a menor conversão bruta, chama o código nativo, copia ou adota
resultados conforme o proprietário documentado e converte falha em erro Flecha.
Chamadores não devem precisar de `unsafe` só porque a implementação usa FFI.

Fontes nativas embutidas fazem parte do contrato. Fixe flags, qualifique cada
alvo e teste nulos, buffers vazios, comprimentos máximos, callbacks, repetição e
limpeza após falha.

## O que aprender a seguir

- [Contenção, revisão e testes](/pt-br/tutorials/unsafe/containment/)
- [Funções externas — em inglês](/docs/reference/extern/)
- [ABI do runtime — em inglês](/docs/reference/runtime_abi/)

