---
title: '2. Memória bruta e o primeiro programa unsafe'
description: Compare um empréstimo verificado com um ponteiro bruto e declare a prova de tempo de vida exigida.
---

A forma segura deve ser a padrão:

```flecha title="safe.fl" test="unsafe-first"
i32 main() {
    i32 value = 42;
    reference := &value;
    stdoutln(*reference);
    return 0;
}
```

O menor equivalente bruto precisa de fronteira explícita:

```flecha title="unsafe.fl" test="unsafe-first"
i32 main() {
    i32 value = 42;
    unsafe {
        *i32 pointer = &raw value;
        stdoutln(*pointer);
    }
    return 0;
}
```

Os dois programas qualificados imprimem `42` e retornam zero. No primeiro, o
compilador acompanha o empréstimo. No segundo, a revisão deve provar que o
ponteiro não é nulo, está alinhado, aponta para `i32` vivo, permite o acesso e
não é usado depois de `value` morrer. A prova é maior embora a sintaxe seja
parecida.

`new<T>` bruto também retorna erro de alocação e cria obrigação de limpeza.
Associe cada sucesso a exatamente um `free`, inclusive em retornos antecipados.

## O que aprender a seguir

- [FFI e interoperabilidade nativa](/pt-br/tutorials/unsafe/native-interop/)
- [Alocação bruta — em inglês](/docs/reference/raw_allocation/)
- [Exemplo de rastreamento de memória — em inglês](/examples/memory_tracking/)

