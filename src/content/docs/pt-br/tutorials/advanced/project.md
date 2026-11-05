---
title: '4. Projeto: qualifique um ledger determinístico'
description: Audite um aplicativo maior através de encoding canônico, persistência, hashing, pacotes e falhas.
---

O [ledger determinístico](/examples/ledger/src/main/) armazena uma cadeia
append-only SHA-256 em formato binário canônico. Seus módulos separam comandos,
codec, armazenamento e modelo; vetores dourados fixam bytes exatos.

Qualifique como software de release. Compile com cache de pacotes limpo e
verificado, execute testes, crie e acrescente registros e verifique o arquivo.
Compare a mesma fixture entre dois builds limpos. Corrompa comprimento, payload
e digest separadamente e confirme rejeição determinística sem perder o original.
Examine endianness e limites no codec e limpeza após falhas no armazenamento.

Registre compilador, Longbow, alvo, comandos, checksums, saída e orçamentos de
recursos. O resultado é uma qualificação reproduzível, não “funcionou uma vez”.

## Trilha concluída

Continue em [Unsafe: o limite unsafe](/pt-br/tutorials/unsafe/boundary/) somente
quando precisar implementar uma fronteira que Flecha segura não expressa.
