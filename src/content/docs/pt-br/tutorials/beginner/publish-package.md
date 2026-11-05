---
title: '3. Crie e publique um pacote'
description: Extraia a saudação Archer para um pacote testado e inspecione a publicação sem enviar dados.
---

Crie uma biblioteca:

```sh test="package-dry-run"
longbow new archer-words --lib
cd archer-words
```

Exporte uma função pequena do módulo declarado, adicione um módulo `_test.fl`
pareado e execute `longbow test`. O [contrato do ecossistema de pacotes — em
inglês](/docs/reference/package_ecosystem/) explica identidades, aliases,
versões imutáveis, compatibilidade e credenciais.

Antes de qualquer envio, qualifique o arquivo exato:

```sh test="package-dry-run"
longbow check
longbow test
longbow build
longbow publish --dry-run
```

O dry run valida o manifesto e informa arquivos normalizados e checksum SHA-256
sem contatar o registro. Uma versão publicada é imutável. Incremente a versão
para corrigir; use yank apenas para impedir novas resoluções desbloqueadas.

Aplicativos importam a dependência pelo alias local, como
`lib::words::greeting`, não pelo proprietário no registro. Versione
`longbow.lock` em aplicativos para que a CI resolva os mesmos bytes.

## Trilha concluída

Agora você sabe criar, executar, diagnosticar e empacotar um aplicativo
pequeno. Continue em [Básico: módulos, valores e
funções](/pt-br/tutorials/basic/modules-values-functions/).
