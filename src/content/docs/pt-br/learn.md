---
title: Aprender Flecha
description: Uma introdução curta à sintaxe da Flecha e ao fluxo de trabalho do compilador.
---

Este guia pressupõe que você já [compilou a ferramenta](/pt-br/install/). Arquivos Flecha usam a extensão `.fl`; um módulo executável define `i32 main()` ou `void main()`.

## Seu primeiro programa

```flecha title="hello.fl"
void main() {
    stdoutln("Olá da Flecha");
}
```

```sh
build/flecha check hello.fl
build/flecha build hello.fl -o build/hello
./build/hello
```

`check` executa o frontend sem gerar um artefato. `build` emite e vincula um executável nativo.

## Funções e variáveis locais inferidas

O tipo de retorno aparece antes do nome da função. `:=` infere o tipo de uma variável local.

```flecha
i32 quadrado(i32 valor) {
    return valor * valor;
}

void main() {
    resposta := quadrado(7);
    stdoutln(resposta);
}
```

## Memória e limites de segurança

Referências e fatias verificadas podem ser usadas em código seguro. Ponteiros e alocação bruta exigem um contexto `unsafe` explícito. Contratos de propriedade e verificações de atribuição ajudam o compilador a rejeitar fluxos inválidos de recursos.

Explore os [exemplos](/pt-br/examples/) e consulte a [documentação técnica](/pt-br/docs/).
