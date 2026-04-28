# O que é um LLM?

## 1 - O que é um LLM?
LLM é a sigla para: Large Language Model - em português, Grande Modelo de Linguagem. É um sistema computacional treinado(em um enorme volume de dados textuais) para processar e gerar texto em linguagem natural(como o português e inglês, ou até mesmo código de programação). 

O adjetivo *large*(grande) refere-se a duas dimensões(características) principais do modelo:
- **Volume de dados de treinamento**: textos na escala de trilhões de palavras, extraídos de livros, artigos, páginas da web, código-fonte, entre outros.
- **Número de parâmetros**: se refere aos *weights* (pesos ou valores que controlam a força de influência entre tokens, resultantes do processo de treinamento) do modelo, que funcionam como a **“memória aprendida”** (conhecimento, ou seja, as relações entre palavras, frases e conceitos) do modelo. Modelos modernos operam na faixa de bilhões e trilhões de parâmetros, o que lhes confere uma capacidade impressionante de compreensão e geração de texto.

Em termos funcionais, um LLM é capaz de realizar tarefas como responder perguntas, traduzir idiomas, resumir textos, gerar código de programação, manter conversas coerentes, entre outras aplicações, sem ter sido explicitamente programado para cada tarefa específica. Esse comportamento é resultado do processo de treinamento em larga escala, que permite ao modelo aprender padrões complexos na linguagem e aplicar esse conhecimento de forma flexível.

## 2 - A diferença entre LLMs e modelos de NLP (Natural Language Processing) tradicionais

Para entender o que torna os LLMs tão poderosos, é necessário situá-los dentro da história do Processamento de Linguagem Natural (NLP).

### 2.1 Uma linha do tempo nos avanços do NLP

---

**Anos 1950–1960:** o famoso matemático Alan Turing (o pai da computação moderna) lançou uma pergunta provocativa: "As máquinas podem pensar?" *(I propose to consider the question, 'Can machines think?')* e propôs o Teste de Turing, no qual uma máquina tentaria se passar por um ser humano em uma conversa. Ao longo dos anos 1950, especialmente com iniciativas de tradução automática como o Experimento Georgetown-IBM, surgiram os primeiros sistemas de processamento de linguagem — desenvolvimentos que corriam em paralelo à fundação da inteligência artificial como campo. Após a famosa Conferência de Dartmouth, onde John McCarthy cunhou o termo "inteligência artificial", esses esforços passaram a ser enquadrados dentro de um novo campo científico, e o NLP (Natural Language Processing) consolidou-se como uma de suas subáreas centrais.

A abordagem dominante era baseada em regras escritas manualmente por linguistas, como gramáticas formais, dicionários bilíngues e parsers sintáticos ainda rudimentares. Havia forte interesse em tradução automática, especialmente no contexto da Guerra Fria (inglês–russo). A ideia era codificar a linguagem como um sistema lógico.

O problema é que regras não escalam: a língua real é ambígua, contextual, evolutiva e altamente variável, e qualquer construção não prevista quebrava o sistema. O fracasso dessas abordagens, especialmente em tradução automática, culminou no Relatório ALPAC (1966), que levou a cortes significativos de financiamento e redirecionou a área para tarefas mais restritas, como análise sintática e compreensão de texto em domínios fechados.

---

**Anos 1970–1980:** A abordagem simbólica se aprofundou. Sistemas especialistas e redes semânticas tentavam representar o conhecimento do mundo de forma estruturada — projetos como SHRDLU conseguiam manipular objetos em ambientes virtuais restritos usando linguagem natural controlada. Esses sistemas funcionavam bem em domínios fechados, mas eram frágeis fora deles. Ao mesmo tempo, começaram a surgir os primeiros esforços de corpora anotados — incluindo os trabalhos iniciais que culminariam no Penn Treebank, publicado formalmente em 1992–1993. A limitação dos sistemas simbólicos, somada a expectativas infladas, levou a ciclos de redução de financiamento. O chamado segundo inverno da IA teve início no final dos anos 1980 e se estendeu até meados dos anos 1990.

---

**Anos 1990:** O campo passou por uma transição para métodos estatísticos baseados em dados. Em vez de codificar regras explicitamente, modelos aprendem padrões a partir de grandes corpora. Técnicas como modelos de linguagem n-grama e Hidden Markov Models (HMMs) tornaram-se centrais em tarefas como tagging e reconhecimento de fala. Representações como Bag of Words (BoW) e TF-IDF permitem transformar texto em vetores numéricos. Esses métodos são escaláveis e robustos, mas limitados: ignoram semântica profunda e dependem fortemente de frequência e coocorrência. Ainda assim, muitos sistemas permaneceram híbridos, combinando estatística e regras.

---

**Anos 2000:** Sobre essas representações, algoritmos como SVM (Support Vector Machines), Naive Bayes e CRFs (Conditional Random Fields) dominaram o estado da arte em tarefas específicas — classificação de texto, análise de sentimento, reconhecimento de entidades. O NLP foi estruturado como pipelines: tokenização → anotação gramatical → extração de features → modelo. Esses sistemas funcionavam bem dentro do domínio treinado, mas eram altamente dependentes de engenharia manual e dados rotulados. Cada nova tarefa exigia um novo modelo.

---

**Anos 2013–2014:** Os embeddings mudaram a base da representação. Word2Vec (2013) e GloVe (2014) aprendem vetores densos para palavras com base em seu contexto de uso. Palavras semanticamente semelhantes passam a ocupar regiões próximas no espaço vetorial, permitindo capturar relações como analogias. No entanto, esses embeddings ainda são *context-free*: cada palavra tem uma única representação fixa, independentemente do contexto em que aparece.

---

**2017:** O Transformer, introduzido no artigo *Attention Is All You Need*, redefiniu a arquitetura dominante. Baseado inteiramente em mecanismos de self-attention, ele permite que cada token considere todos os outros simultaneamente, produzindo representações contextuais dinâmicas. Diferente de RNNs e LSTMs, elimina recorrência e permite treinamento altamente paralelizável, viabilizando escala sem precedentes.

---

**2018 em diante:** Com o Transformer como base, surgiu o paradigma do pré-treinamento em larga escala. BERT aprende representações profundas de linguagem de forma bidirecional e é ajustado para tarefas específicas. Modelos da família GPT seguem uma abordagem autorregressiva e generativa. Com o GPT-3 (2020), o aumento de escala (dados, parâmetros, compute) tornou evidente um fenômeno novo: o *in-context learning* — a habilidade de executar tarefas a partir de instruções ou poucos exemplos, sem nenhum treinamento específico adicional. Ainda assim, esses sistemas frequentemente passam por etapas de ajuste fino, como instruction tuning e RLHF. Estabelece-se a era dos LLMs: modelos generalistas capazes de atuar em múltiplos domínios e tarefas com mínima adaptação específica.

---

**Resumo da evolução do NLP: abordagens tradicionais até os LLMs**

| Época | Representação | Contexto | Generalização |
|---|---|---|---|
| Regras / simbólico (1950–80) | Explícita, manual | Inexistente | Nenhuma |
| BoW / TF-IDF (1990–2000) | Esparsa, por contagem | Inexistente | Nenhuma |
| Classificadores (2000–12) | Esparsa ou embedding fixo | Local / inexistente | Limitada ao domínio |
| Embeddings (2013–17) | Densa, por palavra | Fixo, sem sequência | Parcial (embedding reutilizável) |
| Transformer (2017) | Densa, por sequência inteira | Global (atenção completa) | Alta, via pré-treinamento |
| LLMs (2018–hoje) | Contextual, por token | Global + contexto longo | Ampla, via prompting |

Obviamente, essa linha do tempo é uma simplificação extrema. Muitos avanços ocorreram em paralelo, e a evolução do NLP é marcada por uma complexa interação de ideias, técnicas e contextos históricos. No entanto, mesmo bem simplificada, essa trajetória torna evidente um padrão recorrente: cada era foi limitada pelo que a anterior não conseguia capturar. Regras não escalam. Estatísticas ignoram semântica. Embeddings fixos ignoram contexto. RNNs não paralelizam. Os LLMs não "resolvem" NLP — eles simplesmente empurram essa fronteira de limitações para um lugar muito mais distante do que qualquer abordagem anterior havia conseguido.

### 2.2.0 O que torna os LLMs tão qualitativamente diferentes?
Situar os LLMs na linha do tempo é útil, mas não é o suficiente. A diferença não é apenas de grau - é de natureza. Alguns constrantes fundamentais:

**a) Pré-treinamento não supervisionado em larga escala:** Modelos tradicionais exigem dados rotulados manualmente para cada tarefa, o que é um processo caro, lento e limitado em volume. LLMs, por outro lado, são treinados em tarefas auto-supervisionadas (tipicamente, prever o próximo token) sobre quantidades massivas de texto puro, sem necessidade de anotação humana. A supervisão é do próprio texto: o rótulo de cada token é o token seguinte. Isso permite escalar o treinamento apara trilhões de exemplos sem intervenção humana direta, o que é impossível para modelos tradicionais.

**b) Emmergência de capacidades:** A partir de certa escala, LLMs demonstram capacidades que não foram explicitamente ensinadas: raciocínio multi-etapas, analogias, arimética básica, geração de código, seguimento de instruções complexas. Esse fenômeno é chamado de emergência(mergent behavior), capacidades que simplesmente não existem em modelos menores e aparecem de forma abrupta conforme a escala aumenta. Não é completamente compreendido por que isso ocorre. Isso não possível em modelos tradicionais, que só podem realizar tarefas para as quais foram explicitamente treinados.

**c) Generalização zero-shot e few-shot:** um modelo tradicional treinado para análise de sentimento não serve para tradução. Um LLM pode executar ambas as tarefas — e dezenas de outras — sem nenhum retreinamento. Basta descrever a tarefa no prompt (zero-shot) ou fornecer alguns exemplos (few-shot). Essa generalização é qualitativamente diferente da que os sistemas anteriores ofereciam.

**d) Representação contextual dinâmica**:Enquanto Word2Vec atribui um vetor fixo a cada palavra, os LLMs geram representações que variam conforme o contexto inteiro da sequência. A palavra "banco" em "fui ao banco sacar dinheiro" produz uma representação numericamente diferente da mesma palavra em "sentei no banco da praça" — o modelo distingue os dois usos porque processa toda a sequência de forma integrada.

Em resumo:

| Característica | Modelos Tradicionais | LLMs |
|---|---|---|
| Arquitetura base | Variada (SVM, RNN, n-gramas…) | Transformer |
| Escala de parâmetros | Milhões (ou menos) | Bilhões a trilhões |
| Paradigma de treinamento | Supervisionado por tarefa | Pré-treinamento auto-supervisionado |
| Dados necessários | Rotulados, por tarefa | Texto bruto em larga escala |
| Generalização | Fraca fora do domínio | Zero/few-shot robusta |
| Contexto capturado | Local ou ausente | Global (toda a sequência) |
| Representação de palavras | Fixa (context-free) | Dinâmica (contextual) |
| Capacidades emergentes | Não | Sim |