---
title: '2. Limites nativos e evidências de desempenho'
description: Projete limites FFI e nativos e inspecione o código gerado antes de afirmar desempenho.
---

Uma função externa é um contrato de ABI. Faça corresponder convenção de
chamada, largura, layout, propriedade e falhas. Envolva-a em um módulo Flecha
pequeno para que o restante use valores tipados comuns. Torne entradas nativas
explícitas e qualifique cada alvo compatível.

Para desempenho, comece por uma carga representativa e saída estável. Meça
builds nativos otimizados, inspecione LLVM para checks de limites e overflow e
perfile alocações antes de mudar o código. Índices constantes ou comprovadamente
seguros podem perder checks; variáveis devem manter o contrato. Nunca enfraqueça
um check para vencer um microbenchmark.

Leia [funções externas](/docs/reference/extern/), [geração
LLVM](/docs/reference/llvm_codegen/) e a [linha de base v0.3](/docs/reference/performance/).

## O que aprender a seguir

- [Tratamento de falhas e design de APIs](/pt-br/tutorials/advanced/failure-and-api-design/)
- [ABI do runtime — em inglês](/docs/reference/runtime_abi/)
- [Geração nativa — em inglês](/docs/reference/native_codegen/)

