---
title: Aprender Flecha v0.3
description: Comece com Longbow, sintaxe atual, erros e propriedade explícitos, testes, biblioteca padrão e pacotes.
---

Este guia acompanha o toolchain v0.3 em desenvolvimento. Instale binários
`flecha` e `longbow` da mesma compilação. Arquivos Flecha usam `.fl`; um
executável define `i32 main()` ou `void main()` sem parâmetros.

## Seu primeiro programa

```sh
longbow new hello
cd hello
longbow check
longbow run
```

Longbow cria `longbow.toml` e `src/main.fl`, encontra a biblioteca padrão do
toolchain e grava artefatos em `target`.

## Funções e variáveis locais inferidas

O tipo de retorno aparece antes do nome da função. `:=` infere o tipo de uma variável local.

```flecha
module main;

@imports
    :: lib::std::fmt;

i32 quadrado(i32 valor) {
    return valor * valor;
}

i32 main() {
    resposta := quadrado(7);
    fmt::println(resposta);
    return 0;
}
```

Imports selecionam módulos lógicos declarados. `root` identifica o pacote
atual; `lib::<alias>` identifica uma dependência. Longbow fornece `lib::std`.

## Memória e limites de segurança

Referências e fatias verificadas podem ser usadas em código seguro. Ponteiros e alocação bruta exigem um contexto `unsafe` explícito. Contratos de propriedade e verificações de atribuição ajudam o compilador a rejeitar fluxos inválidos de recursos.

## Continue no fluxo v0.3

- [Primeiro projeto Longbow — inglês](/tutorials/first-project/)
- [Aplicativo de linha de comando — inglês](/tutorials/command-line-app/)
- [Criar e publicar um pacote — inglês](/tutorials/publish-package/)
- [API completa da biblioteca padrão — inglês](/docs/reference/standard_library/)
- [Exemplos executáveis](/pt-br/examples/)
