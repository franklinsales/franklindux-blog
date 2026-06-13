## Introdução
 
Toda vez que você cria um recurso na AWS — uma instância EC2, um banco de dados RDS, um cluster Elastic Beanstalk — esse recurso existe dentro de uma rede. Essa rede é a **VPC**. Sem entender como a VPC funciona, você está operando infraestrutura sem entender o terreno onde ela vive: não sabe por que uma instância consegue acessar a internet e outra não, por que dois serviços não se enxergam, ou por que um banco de dados está exposto quando deveria estar isolado.

A VPC é o fundamento de toda arquitetura AWS. IAM controla *quem* pode fazer *o quê*. A VPC controla *onde* os recursos ficam e *como* eles se comunicam. Os dois precisam ser compreendidos antes de qualquer serviço de computação ou banco de dados.

Este artigo cobre os cinco pilares da VPC:
1) O que é uma VPC e como ela isola sua infraestrutura.
2) Como o endereçamento IP funciona com CIDR blocks.
3) A diferença entre subnets públicas e privadas.
4) Como o Internet Gateway conecta sua rede à internet.
5) Como as Route Tables determinam o caminho do tráfego.

---

## 1. O que é uma VPC

Antes da nuvem, uma empresa que precisava de infraestrutura de TI construía ou alugava espaço em um datacenter físico. Nesse datacenter, a empresa tinha sua própria rede isolada: servidores, switches, firewalls e cabos que não se misturavam com a infraestrutura de outras empresas no mesmo prédio. Um visitante de outra empresa no mesmo datacenter não conseguia acessar os servidores de sau empresa só por estar físicamente no mesmo lugar.

A **VPC - Virtual Private Cloud** é o equivalente virtual desse datacenter privado dentro da infraestrutura da AWS. É uma rede virtual isolada logicamente dentro da nuvem da AWS, dedicada exclusivamente à sua conta. Outros clientes da AWS - mesmo que seus servidores físicos estejam nos mesmos datacenters - não podem acessar os recursos dentro da sua VPC a menos que você permita explicitamente.

### O que a VPC provê

Uma VPC é mais que um simples argupamento de recursos. Ela provê:

**Isolamento de rede:** recursos dentro da sua VPC são invisíveis e inacessíveis para o mundo externo por padrão, incluindo outras contas AWS e outras VPCs. Nenhum tráfego entra ou sai sem que você explicitamente configure isso.

**Controle completo de endereçamento IP:** você define o espaço de endereços IP da sua rede usando notação CIDR. Você decide quais faixas de IP existem, como são dividas em sub-redes (subnets), e quais IPs são atribuídos a quais recursos.

**Segmentação em subnets:** você pode dividir sua VPC em sub-redes menores (subnets) distribuídas entre Zonas de Disponibildidade (AZs). Algumas subnets são acessíveis da internet; outras são completamente privadas. Essa segmentação é fundamental para arquiteturas seguras e escaláveis.

**Controle de roteamento:** você define explicitamente como o tráfego flui dentro da VPC e entre a VPC e redes externas (internet, outras VPCs, redes on-premises) usando Route Tables. Com isso(Route Tables) você decide quais caminhos o tráfego pode seguir e quais destinos são acessíveis.

**Firewall de rede:** Security Groups e Network ACLs controlam qual tráfego é permitido entre recursos e entre a VPC e o mundo externo. Esses mecanismos serão detalhados em artigos futuros, mas é importante saber que a VPC já inclui camadas de segurança de rede integradas.

### A VPC Default

Quando você cria uma conta AWS, a AWS automaticamente cria uma **VPC Default** em cada região. Essa VPC vem pré-configurada com subnets em cada Zona de Disponibilidade, um Internet Gateway, e Route Tables que permitem que recursos criados na VPC Default tenham acesso à internet. A VPC Default é útil para testes e aprendizado, mas para produção é recomendado criar VPCs customizadas com configurações específicas de segurança e rede.

A VPC Default existe para facilitar o início rápido - você pode lançar uma instância EC2 imediatamente sem precisar configurar rede. Mas ela não é adequada para produção por dois motivos:

1) **Segurança:** a VPC Default tem configurações de segurança mais permissivas por padrão, o que pode expor recursos acidentalmente. Por exemplo, as subnets públicas permitem acesso à internet sem restrições. Isso é o inverso do conceito de segurança "least privilege" (privilégio mínimo) que é fundamental para ambientes de produção.

2) **Controle:** a VPC Default tem um layout de rede fixo que pode não se encaixar nas necessidades específicas da sua aplicação. Por exemplo, você pode querer subnets privadas para bancos de dados e subnets públicas apenas para servidores web, ou pode querer segmentar sua rede em mais subnets para melhor organização e segurança. Criar uma VPC customizada permite que você defina exatamente como sua rede é estruturada, quais IPs são usados, e quais regras de segurança se aplicam.

> **Boa Prática** nunca use a VPC Default para produção. Crie VPCs customizadas com CIDR blocks planejados, subnets privadas para recursos internos, e subnets públicas para os recursos que precisam de acesso à internet. Isso garante que sua infraestrutura seja segura, organizada, e escalável desde o início.

## VPC como escopo de rede

É importante entender que a VPC existe por região. Você nào cria uma VPC global - você cria uma VPC em `sa-east-1` e outra VPC em `us-east-1`. Cada VPC é isolada dentro da região onde foi criada. Recursos dentro de uma VPC só podem se comunicar diretamente com recursos na mesma VPC.

Dentro de uma região, você pode ter múltiplas VPCs. Uma conta AWS suporta até 5 VPCs por região por padrão (limite aumentável via suporte). VPCs diferentes na mesma região são completamente isoladas entre si -  a menos que você configure VPC Peering ou Transit Gateway para concetá-las. Isso é útil para separar ambientes (produção, staging, desenvolvimento) ou para isolar diferentes projetos dentro da mesma conta.

### Componentes que formam uma VPC

Uma VPC não é um único objeto - ela é composta por vários componentes que trabalham juntos:

