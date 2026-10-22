---
title: Flecha 1.0 (e além)
description: A direção rumo a uma Flecha 1.0 autocontida e performática — e as possibilidades que podem vir depois.
---

A Flecha está sendo construída para se tornar uma linguagem de sistemas
nativa e prática, capaz de sustentar a própria implementação. O caminho até a
1.0 desenvolve em conjunto a linguagem, o compilador, o runtime, as
ferramentas, a biblioteca padrão e um ecossistema mais amplo de bibliotecas.

:::note[Uma direção, não uma lista imutável]
Esta página explica para onde a Flecha está indo, não cada passo que ela
obrigatoriamente seguirá. A linguagem ainda aprende com a própria
implementação. Recursos podem ser adicionados, substituídos, reordenados ou
removidos conforme programas reais revelem projetos melhores. Cada versão
define seus compromissos concretos; esta visão não atribui antecipadamente
cada ideia a uma versão.
:::

## Por que as fundações importam

O trabalho atual em ownership, bytes, strings, containers, codificação,
streams, arquivos e buffering foi projetado para ser composto:

```text
ownership e memória
        |
bytes, strings, containers e alocação
        |
codificação, streams, arquivos e buffering
        |
   +----+----------------+----------------+
   |                     |                |
formatos de dados      redes          infraestrutura do compilador
JSON e XML             sockets        leitura de código-fonte
Base64                 HTTP           diagnósticos
serialização           WebSocket      caches e artefatos
                       gRPC
```

Um leitor com buffer não é apenas uma conveniência para arquivos. Ele pode se
tornar a camada incremental compartilhada por parsers, protocolos, leitura de
código-fonte do compilador e futuros adaptadores assíncronos. A Flecha está
construindo poucas fundações confiáveis capazes de abrir caminho para muitas
bibliotecas independentes.

## Direções no caminho até a 1.0

Estas frentes podem avançar juntas, e seus limites exatos entre versões
continuam abertos.

### Dados e interoperabilidade

A Flecha deve permitir implementações eficientes e incrementais de Base64,
JSON, XML e outros formatos de serialização. Isso exige APIs maduras de bytes
e texto, I/O com buffer, Unicode, conversão numérica, builders, containers e
erros estruturados.

Alguns formatos podem entrar na biblioteca padrão; outros podem permanecer em
pacotes separados. O teste importante é se a linguagem permite implementá-los
de forma segura, natural e eficiente.

### Segurança e criptografia

Programas reais precisam de aleatoriedade segura, hashes, autenticação,
criptografia, TLS, operações em tempo constante e tratamento cuidadoso de
chaves. A Flecha deve integrar implementações criptográficas consolidadas e
envolvê-las em APIs seguras. O projeto dará preferência a algoritmos revisados,
vetores publicados e provedores comprovados, em vez de inventar criptografia.

### Redes e I/O assíncrono

Sockets bloqueantes, DNS, timeouts e adaptadores de stream já podem viabilizar
programas TCP e UDP úteis antes da existência de async. HTTP básico e WebSocket
podem crescer sobre essas fundações. Depois, I/O assíncrono pode oferecer
transporte escalável sem exigir a reescrita dos parsers e do framing dos
protocolos.

HTTP/2 e gRPC podem vir mais tarde. Eles trazem outras dependências, como
Protocol Buffers, TLS, streaming, cancelamento, deadlines, geração de código e
um runtime assíncrono capaz. Esta é uma direção, não uma promessa de que todas
as camadas estarão em `std` ou chegarão em uma versão predeterminada.

### Integração nativa de baixo nível

A Flecha deve conseguir se integrar diretamente com APIs nativas exigentes,
como Vulkan e ImGui, e talvez futuramente oferecer bibliotecas de GUI nativa.
Esse trabalho exercita compatibilidade de ABI, layout e alinhamento explícitos,
ponteiros brutos, unions, callbacks, linking, integração com o build e
ownership através de fronteiras externas.

Bibliotecas gráficas e de GUI não precisam fazer parte da biblioteca padrão.
Elas demonstram que a Flecha consegue expressar integração de baixo nível sem
depender de um wrapper em C++ para tornar possíveis as partes difíceis.

### Metaprogramação

APIs nativas grandes e protocolos definidos por schemas exigem mais do que
boilerplate escrito à mão. A Flecha deve explorar macros e outras ferramentas
de tempo de compilação para geração higiênica, serialização, operações
derivadas, bindings FFI e tipos gerados por protocolos.

O projeto exato continua aberto. Macros declarativas, funções em tempo de
compilação, reflexão, derives ou uma combinação devem ser avaliados pelos
programas que viabilizam e pela clareza do código resultante.

## O que significa a v1.0

A Flecha chega à v1.0 quando deixa de depender de outra linguagem de
implementação para continuar seu desenvolvimento normal.

O compilador v1.0 será escrito em Flecha, compilará a linguagem e suas
bibliotecas e será capaz de compilar a si mesmo. O compilador atual, escrito em
C++, se tornará a implementação legada v0 usada para o bootstrap:

```text
compilador legado v0
        |
        v
compilador estágio 1 escrito em Flecha
        |
        v
compilador estágio 2 compilado pela própria Flecha
```

O estágio 1 deve compilar o estágio 2 com sucesso, e os compiladores
resultantes devem ser reproduzíveis ou comprovadamente equivalentes. As suítes
da linguagem e das bibliotecas devem passar pelo toolchain autocontido. Quando
esse caminho estiver confiável, a v0 não deve mais ser necessária para o
desenvolvimento comum nem para produzir novas versões.

Self-hosting sozinho não basta. O compilador autocontido e os programas que ele
gera devem estar na mesma classe de performance que implementações nativas
equivalentes em C++. Isso será tratado como uma meta de engenharia com
benchmarks explícitos, não como a alegação de que todo programa possível terá
performance idêntica. As medições devem incluir:

- tempo de execução e uso de memória dos programas gerados;
- tempo de execução e pico de memória do compilador;
- escalabilidade da compilação;
- tamanho dos binários gerados; e
- custo em runtime de ownership e abstrações de alto nível.

A Flecha v1.0 não é simplesmente a versão em que a sintaxe será declarada
pronta. É o ponto em que a linguagem consegue sustentar o próprio peso:
implementada em si mesma, capaz de construir sistemas nativos reais, apoiada
pelas bibliotecas necessárias ao seu toolchain e performática o bastante para
que reescrevê-la em C++ não traga uma vantagem fundamental.

O destino está claro, mas a rota pode melhorar. Chegar lá talvez exija
capacidades que ainda não estão listadas, e a experiência pode mostrar que
algumas ideias atuais devem assumir outra forma.

## E além

Self-hosting é um começo, não um ponto final. Estas são possibilidades, não uma
definição fixa da v2.0:

- uma plataforma de desenvolvimento mais ampla e autocontida, com formatter,
  language server, integração com debuggers, profiler, ecossistema de pacotes e
  ferramentas de documentação;
- mais independência do compilador por meio de compilação incremental, novos
  backends nativos, otimizações melhores e talvez mais partes do linker e do
  toolchain implementadas em Flecha;
- gráficos nativos, computação em GPU, áudio, janelas, input e bibliotecas de
  GUI ergonômicas construídas sobre APIs como Vulkan;
- um ecossistema maduro de serviços com aplicações async, transporte seguro,
  HTTP, WebSocket, gRPC, observabilidade e bibliotecas para sistemas
  distribuídos;
- sistemas embarcados e bare-metal, componentes de sistemas operacionais,
  WebAssembly e outros alvos restritos ou heterogêneos; e
- ferramentas mais fortes de correção para ownership, concorrência, fronteiras
  unsafe, reprodutibilidade e contratos verificáveis por máquina.

A Flecha v2.0, se e quando existir, deve ser definida pelo que o projeto
aprender construindo e usando a série v1.x — não por transformar os palpites de
hoje na linguagem de amanhã.

Para a versão detalhada desta direção, leia o
[documento de visão no repositório da Flecha](https://github.com/segfaultcafe/flecha/blob/master/docs/vision.md).
