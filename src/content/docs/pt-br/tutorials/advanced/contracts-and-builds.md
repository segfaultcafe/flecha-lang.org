---
title: '1. Contratos de propriedade e builds determinísticos'
description: Torne a transferência de recursos explícita nas APIs e prove que entradas de pacote produzem saídas reproduzíveis.
---

APIs avançadas devem declarar se uma entrada é emprestada, consumida, retornada
ou retida. Aplique contratos de propriedade na menor fronteira e teste sucesso,
falha de validação, falha de alocação e inicialização parcial. Um método de
ciclo de vida não justifica transferência ambígua.

Builds determinísticos começam antes da geração de código. Fixe versões de
Flecha e Longbow, versione lockfiles, verifique checksums, ordene entradas antes
de serializar e exclua paths e tempos do host que não sejam entradas declaradas.
Reconstrua com cache limpo e compare o artefato relevante.

Use [contratos de propriedade](/docs/reference/ownership_contracts/),
[ecossistema de pacotes](/docs/reference/package_ecosystem/) e [geração
nativa](/docs/reference/native_codegen/) como listas de auditoria.

## O que aprender a seguir

- [Limites nativos e evidências de desempenho](/pt-br/tutorials/advanced/native-and-performance/)
- [Ciclo de vida e estruturas — em inglês](/docs/reference/structures/)
- [Lock e cache do Longbow — em inglês](/docs/reference/longbow/)

