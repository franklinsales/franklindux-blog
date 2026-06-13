# Semana 6 — O que é VPC e Como Funciona

> Artigo da série **Do Leigo ao Avançado em Infraestrutura AWS**.

---

## Introdução

Toda vez que você cria um recurso na AWS — uma instância EC2, um banco de dados RDS, um cluster Elastic Beanstalk — esse recurso existe dentro de uma rede. Essa rede é a **VPC**. Sem entender como a VPC funciona, você está operando infraestrutura sem entender o terreno onde ela vive: não sabe por que uma instância consegue acessar a internet e outra não, por que dois serviços não se enxergam, ou por que um banco de dados está exposto quando deveria estar isolado.

A VPC é o fundamento de toda arquitetura AWS. IAM controla *quem* pode fazer *o quê*. A VPC controla *onde* os recursos ficam e *como* eles se comunicam. Os dois precisam ser compreendidos antes de qualquer serviço de computação ou banco de dados.

Esta semana cobre os cinco pilares da VPC: o que ela é e como ela isola sua infraestrutura, como o endereçamento IP funciona com CIDR blocks, a diferença entre subnets públicas e privadas, como o Internet Gateway conecta sua rede à internet, e como as Route Tables determinam o caminho do tráfego.

---

## 1. O que é uma VPC

### A analogia do datacenter privado

Antes da nuvem, uma empresa que precisava de infraestrutura de TI construía ou alugava espaço em um datacenter físico. Nesse datacenter, a empresa tinha sua própria rede isolada: servidores, switches, firewalls e cabos que não se misturavam com a infraestrutura de outras empresas no mesmo prédio. Um visitante de outra empresa no mesmo datacenter não conseguia acessar os servidores da sua empresa só por estar fisicamente no mesmo lugar.

A **VPC — Virtual Private Cloud** é o equivalente virtual desse datacenter privado dentro da infraestrutura da AWS. É uma rede isolada logicamente dentro da nuvem da AWS, dedicada exclusivamente à sua conta. Outros clientes da AWS — mesmo que seus servidores físicos estejam nos mesmos datacenters — não têm visibilidade nem acesso à sua VPC.

### O que a VPC provê

Uma VPC é mais do que um simples agrupamento de recursos. Ela provê:

**Isolamento de rede:** recursos dentro da sua VPC são invisíveis e inacessíveis para o mundo externo por padrão, incluindo outras contas AWS e outras VPCs. Nenhum tráfego entra ou sai sem que você explicitamente configure isso.

**Controle completo de endereçamento IP:** você define o espaço de endereços IP da sua rede usando notação CIDR. Você decide quais faixas de IP existem, como são divididas em sub-redes, e quais recursos recebem quais endereços.

**Segmentação em subnets:** você divide a VPC em sub-redes menores (subnets) distribuídas entre Zonas de Disponibilidade. Algumas subnets são acessíveis da internet; outras são completamente privadas. Essa segmentação é o fundamento da segurança de rede em cloud.

**Controle de roteamento:** você define explicitamente como o tráfego flui dentro da VPC e entre a VPC e redes externas (internet, outras VPCs, redes corporativas). Esse controle é feito via Route Tables.

**Firewalls de rede:** Security Groups e Network ACLs controlam qual tráfego é permitido entre recursos e entre a VPC e o mundo externo. Esses mecanismos serão detalhados na Semana 7.

### A VPC Default

Quando você cria uma conta AWS, a AWS automaticamente cria uma **VPC Default** em cada região. Essa VPC vem pré-configurada com subnets em cada Zona de Disponibilidade, um Internet Gateway já anexado, e Route Tables que dão acesso à internet para todos os recursos.

A VPC Default existe para facilitar o início rápido — você pode lançar uma instância EC2 imediatamente sem precisar configurar rede. Mas ela não é adequada para produção por dois motivos:

Primeiro, todas as subnets da VPC Default são públicas por padrão — qualquer instância lançada nela pode receber um IP público e ser acessível da internet. Isso inverte o princípio do menor privilégio: em vez de negar acesso público por padrão e habilitar apenas quando necessário, o padrão é exposto.

Segundo, você não tem controle sobre o CIDR block da VPC Default (ele é sempre `172.31.0.0/16`), o que pode criar conflitos se você precisar conectar sua VPC a uma rede corporativa no futuro.

> **Boa prática atual:** nunca use a VPC Default para cargas de trabalho de produção. Crie VPCs customizadas com CIDR blocks planejados, subnets privadas para recursos internos, e subnets públicas apenas para os componentes que precisam genuinamente de acesso à internet (load balancers, por exemplo). A VPC Default pode ser deletada ou simplesmente ignorada.

### VPC como escopo de rede

É importante entender que a VPC existe por região. Você não cria uma VPC global — você cria uma VPC em `sa-east-1`, outra em `us-east-1`, e assim por diante. Recursos em regiões diferentes estão em VPCs diferentes por definição.

Dentro de uma região, você pode ter múltiplas VPCs. Uma conta AWS suporta até 5 VPCs por região por padrão (limite aumentável via suporte). VPCs diferentes na mesma região são completamente isoladas entre si — a menos que você configure VPC Peering ou Transit Gateway para conectá-las, o que será abordado na Semana 8.

### Componentes que formam uma VPC

Uma VPC não é um único objeto — ela é composta por vários componentes que trabalham juntos:

```
VPC (10.0.0.0/16)
├── Subnet Pública A (10.0.1.0/24) — AZ sa-east-1a
├── Subnet Pública B (10.0.2.0/24) — AZ sa-east-1b
├── Subnet Privada A (10.0.10.0/24) — AZ sa-east-1a
├── Subnet Privada B (10.0.20.0/24) — AZ sa-east-1b
├── Internet Gateway
├── Route Table Pública
├── Route Table Privada
├── Security Groups
└── Network ACLs
```

Cada um desses componentes será detalhado ao longo desta semana e das seguintes.

---

## 2. CIDR Blocks: Endereçamento IP

### O que é um endereço IP

Um **endereço IP** (Internet Protocol) é um identificador numérico atribuído a cada dispositivo em uma rede. Na versão 4 do protocolo (IPv4, ainda dominante na AWS), um endereço IP é composto por 32 bits, representados como quatro grupos de números decimais separados por pontos, cada grupo variando de 0 a 255.

```
10.0.1.45
│  │ │ └── último octeto: 45
│  │ └──── terceiro octeto: 1
│  └────── segundo octeto: 0
└───────── primeiro octeto: 10
```

No total, existem 2³² = 4.294.967.296 endereços IPv4 possíveis — o que parece muito até você considerar que a internet tem mais de 5 bilhões de dispositivos conectados. Isso levou à criação de faixas de IP reservadas para uso privado (redes internas, como VPCs) e à eventual necessidade de IPv6.

### Faixas de IP privadas

Três faixas de endereços IPv4 são reservadas pela RFC 1918 para uso em redes privadas. Elas nunca são roteadas na internet pública — são usadas exclusivamente em redes internas:

| Faixa | Notação CIDR | Total de IPs | Uso típico |
|---|---|---|---|
| 10.0.0.0 – 10.255.255.255 | `10.0.0.0/8` | 16.777.216 | Redes corporativas grandes, VPCs |
| 172.16.0.0 – 172.31.255.255 | `172.16.0.0/12` | 1.048.576 | VPC Default da AWS (`172.31.0.0/16`) |
| 192.168.0.0 – 192.168.255.255 | `192.168.0.0/16` | 65.536 | Redes domésticas e pequenas empresas |

Para VPCs na AWS, a faixa `10.0.0.0/8` é a mais usada em produção por oferecer o maior espaço de endereçamento e menor chance de conflito.

### O que é notação CIDR

**CIDR** (Classless Inter-Domain Routing) é a notação usada para representar uma faixa de endereços IP. Ela combina um endereço IP base com um número que indica quantos bits são fixos (o prefixo de rede), deixando o restante para identificar hosts individuais.

```
10.0.0.0/16
│        └── prefixo: 16 bits fixos
└─────────── endereço base
```

A barra seguida do número (o prefixo) define quantos bits do endereço identificam a **rede** e quantos identificam **hosts** dentro dela:

- Prefixo maior → rede menor → menos IPs disponíveis
- Prefixo menor → rede maior → mais IPs disponíveis

### Calculando o tamanho de uma rede CIDR

Com um prefixo `/N`, o número de endereços IP disponíveis é **2^(32-N)**.

| Notação CIDR | Bits de host | Total de IPs | IPs utilizáveis (AWS reserva 5) |
|---|---|---|---|
| `/8` | 24 bits | 16.777.216 | 16.777.211 |
| `/16` | 16 bits | 65.536 | 65.531 |
| `/24` | 8 bits | 256 | 251 |
| `/26` | 6 bits | 64 | 59 |
| `/27` | 5 bits | 32 | 27 |
| `/28` | 4 bits | 16 | 11 |

**A AWS reserva 5 endereços em cada subnet** para uso interno. Em uma subnet `/24` com 256 endereços totais, 251 estão disponíveis para seus recursos. Os 5 reservados são:

| Endereço | Finalidade (exemplo em `10.0.1.0/24`) |
|---|---|
| Primeiro (`10.0.1.0`) | Endereço de rede (identificador da subnet) |
| Segundo (`10.0.1.1`) | Reservado pela AWS — roteador da VPC |
| Terceiro (`10.0.1.2`) | Reservado pela AWS — servidor DNS |
| Quarto (`10.0.1.3`) | Reservado pela AWS — uso futuro |
| Último (`10.0.1.255`) | Broadcast (não utilizado em VPC, mas reservado) |

### Como interpretar um CIDR na prática

Para entender qual faixa de IPs um CIDR representa, o caminho mais direto é interpretar os bits fixos:

**`10.0.0.0/16`:**
- Os primeiros 16 bits são fixos: `10.0` (primeiro e segundo octetos)
- Os últimos 16 bits variam: terceiro e quarto octetos podem ser qualquer valor de 0 a 255
- Faixa: `10.0.0.0` até `10.0.255.255`
- Total: 65.536 endereços

**`10.0.1.0/24`:**
- Os primeiros 24 bits são fixos: `10.0.1` (três octetos completos)
- O último octeto varia: 0 a 255
- Faixa: `10.0.1.0` até `10.0.1.255`
- Total: 256 endereços

**`10.0.0.0/8`:**
- Apenas o primeiro octeto é fixo: `10`
- Os outros três octetos variam livremente
- Faixa: `10.0.0.0` até `10.255.255.255`
- Total: 16.777.216 endereços

### Planejamento de CIDR para uma VPC

O CIDR block de uma VPC define o espaço total de endereçamento disponível para dividir em subnets. A AWS aceita prefixos entre `/16` (65.536 IPs) e `/28` (16 IPs) para VPCs.

**Escolha o CIDR da VPC com antecedência.** Uma vez que recursos estão provisionados dentro da VPC, alterar o CIDR primário é muito difícil — você pode adicionar CIDRs secundários, mas não substituir o primário sem recriar a VPC do zero. Errar o CIDR no início cria dívida técnica.

**Critérios para escolher o CIDR da VPC:**

**1. Capacidade suficiente para crescimento:**
Estime quantas instâncias, bancos de dados e outros recursos sua infraestrutura terá nos próximos 2 a 3 anos. Cada recurso consome um IP. Cada subnet consome 5 IPs de overhead. Escolha um CIDR generoso.

Um `/16` (65.536 IPs) é um bom ponto de partida para a maioria das organizações. Um `/24` (256 IPs) pode parecer suficiente hoje e ser insuficiente em seis meses.

**2. Não conflitar com outras redes:**
Se sua VPC precisar se conectar a uma rede corporativa on-premises ou a outras VPCs, os CIDRs não podem se sobrepor. Planejar o espaço de endereçamento de toda a organização antes de criar a primeira VPC evita retrabalho.

**Exemplo de planejamento para uma organização com múltiplos ambientes:**

```
Organização usa 10.0.0.0/8 como espaço total

VPC Produção:   10.0.0.0/16   → 65.536 IPs
VPC Staging:    10.1.0.0/16   → 65.536 IPs
VPC Dev:        10.2.0.0/16   → 65.536 IPs
VPC Shared:     10.3.0.0/16   → 65.536 IPs (serviços compartilhados)
```

Dessa forma, os quatro ambientes têm CIDRs completamente distintos e podem ser conectados entre si via VPC Peering sem conflito.

**3. Dividir o CIDR da VPC em subnets:**
O CIDR da VPC é subdividido em CIDRs menores para as subnets. Cada subnet precisa de um CIDR que seja um subconjunto do CIDR da VPC.

```
VPC: 10.0.0.0/16

Subnet Pública A  (AZ 1a): 10.0.1.0/24   → 251 IPs utilizáveis
Subnet Pública B  (AZ 1b): 10.0.2.0/24   → 251 IPs utilizáveis
Subnet Privada A  (AZ 1a): 10.0.10.0/24  → 251 IPs utilizáveis
Subnet Privada B  (AZ 1b): 10.0.20.0/24  → 251 IPs utilizáveis
```

Note que os CIDRs das subnets não se sobrepõem (faixas diferentes do terceiro octeto) e todos estão dentro do espaço `10.0.0.0/16`.

### Verificando CIDRs na prática

Para calcular CIDRs sem decorar regras de bits, use calculadoras online como `cidr.xyz` ou `jodies.de/ipcalc`. Na AWS, ao criar subnets, o console mostra automaticamente quantos IPs disponíveis cada CIDR terá.

Via CLI, para listar os CIDRs das VPCs existentes:

```bash
# Listar todas as VPCs e seus CIDRs
aws ec2 describe-vpcs \
  --query "Vpcs[*].{VpcId:VpcId, CIDR:CidrBlock, Nome:Tags[?Key=='Name']|[0].Value}" \
  --output table

# Listar subnets de uma VPC específica com seus CIDRs
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-0abc123def456" \
  --query "Subnets[*].{SubnetId:SubnetId, CIDR:CidrBlock, AZ:AvailabilityZone}" \
  --output table
```

---

## 3. Subnets Públicas vs. Privadas

### O que é uma Subnet

Uma **subnet** (sub-rede) é uma subdivisão do espaço de endereçamento de uma VPC. Ela existe dentro de uma única Zona de Disponibilidade — você não pode criar uma subnet que abranja múltiplas AZs. Recursos (instâncias EC2, bancos de dados RDS, funções Lambda em VPC) são lançados dentro de uma subnet específica e recebem um endereço IP do CIDR block dessa subnet.

A subnet é o menor componente de segmentação de rede na VPC. Enquanto a VPC define o espaço total da sua rede, as subnets definem os segmentos dentro dela — e a localização de um recurso em uma subnet determina suas regras de conectividade de rede.

### A diferença entre subnet pública e privada

A distinção entre subnet pública e privada **não é uma propriedade intrínseca da subnet** — não existe um campo chamado "tipo" que você define como "pública" ou "privada". O que determina se uma subnet é pública ou privada é a sua **Route Table**: especificamente, se ela tem uma rota para um Internet Gateway.

**Subnet pública:** tem uma rota em sua Route Table que direciona tráfego de internet (`0.0.0.0/0`) para um Internet Gateway. Recursos nessa subnet podem se comunicar diretamente com a internet — tanto recebendo tráfego de entrada quanto iniciando conexões de saída.

**Subnet privada:** não tem rota para um Internet Gateway. Recursos nessa subnet não têm caminho direto para a internet. Eles podem se comunicar com outros recursos dentro da VPC, mas não conseguem nem enviar nem receber tráfego da internet diretamente.

A Route Table é o mecanismo que cria essa distinção, e será detalhada na seção 5. Por ora, o importante é entender a consequência prática:

```
Internet
    │
    │ (tráfego pode fluir)
    ▼
┌───────────────────────────────────────┐
│  SUBNET PÚBLICA (10.0.1.0/24)        │
│  ┌─────────┐  ┌──────────────────┐   │
│  │  EC2    │  │  Load Balancer   │   │
│  │(bastion)│  │   (ALB)          │   │
│  └─────────┘  └──────────────────┘   │
└───────────────────────────────────────┘
    │
    │ (tráfego interno apenas)
    ▼
┌───────────────────────────────────────┐
│  SUBNET PRIVADA (10.0.10.0/24)       │
│  ┌─────────┐  ┌──────────────────┐   │
│  │  EC2    │  │   RDS Aurora     │   │
│  │ (app)   │  │   (banco)        │   │
│  └─────────┘  └──────────────────┘   │
└───────────────────────────────────────┘
```

### IP público vs. IP privado em subnets

Além da Route Table, há um atributo de subnet que controla se os recursos lançados nela **recebem automaticamente um IP público**: `MapPublicIpOnLaunch`.

Quando ativado (padrão em subnets públicas), cada instância EC2 lançada na subnet recebe automaticamente um endereço IPv4 público além do seu IP privado. Esse IP público é efêmero — ele muda quando a instância é parada e reiniciada.

Para IPs públicos permanentes, existe o **Elastic IP (EIP)** — um endereço IPv4 público estático que você aloca e associa a uma instância. O EIP permanece o mesmo independente de quantas vezes a instância é parada ou reiniciada.

```bash
# Verificar se uma subnet atribui IPs públicos automaticamente
aws ec2 describe-subnets \
  --subnet-ids subnet-0abc123 \
  --query "Subnets[*].{SubnetId:SubnetId, MapPublicIp:MapPublicIpOnLaunch}" \
  --output table

# Modificar uma subnet para atribuir IPs públicos automaticamente
aws ec2 modify-subnet-attribute \
  --subnet-id subnet-0abc123 \
  --map-public-ip-on-launch
```

### Onde cada tipo de recurso deve ficar

A decisão de qual subnet usar para cada tipo de recurso é uma das mais importantes em arquitetura AWS. A regra geral é: **exponha à internet apenas o que precisa absolutamente ser acessível da internet. Todo o resto fica em subnets privadas.**

| Recurso | Subnet recomendada | Justificativa |
|---|---|---|
| Application Load Balancer | Pública | Precisa receber tráfego da internet |
| Instâncias EC2 (servidores web com ALB na frente) | Privada | O ALB recebe o tráfego; a instância não precisa de IP público |
| Instâncias EC2 (servidor web sem ALB) | Pública | Precisa de acesso direto da internet |
| RDS Aurora | Privada | Banco de dados nunca deve ser acessível pela internet |
| ElastiCache (Redis/Memcached) | Privada | Cache interno; sem exposição à internet |
| Elastic Beanstalk (ambiente web) | Privada (instâncias) + Pública (ALB) | Separar o ponto de entrada das instâncias de aplicação |
| NAT Gateway | Pública | Precisa de acesso à internet para rotear tráfego de subnets privadas |
| Bastion Host | Pública | Ponto de entrada controlado para acessar instâncias privadas via SSH |
| Lambda em VPC | Privada | Funções que acessam recursos internos não precisam de IP público |

### Subnets e Zonas de Disponibilidade

Cada subnet existe em uma única AZ. Para alta disponibilidade, você precisa replicar subnets em múltiplas AZs:

```
VPC: 10.0.0.0/16
├── sa-east-1a
│   ├── Subnet Pública A:  10.0.1.0/24
│   └── Subnet Privada A:  10.0.10.0/24
└── sa-east-1b
    ├── Subnet Pública B:  10.0.2.0/24
    └── Subnet Privada B:  10.0.20.0/24
```

Um Application Load Balancer lançado em subnets públicas de duas AZs distribui tráfego entre instâncias nas subnets privadas das mesmas AZs. Se `sa-east-1a` falhar completamente, o tráfego continua fluindo para instâncias em `sa-east-1b`. Sem essa redundância, uma falha de AZ derruba a aplicação inteira.

> **Boa prática:** sempre crie subnets em pelo menos duas AZs. O custo adicional é zero (subnets não têm custo). A diferença em disponibilidade é a linha entre uma falha de AZ causar downtime ou não.

### Criando subnets via CLI

```bash
# Criar subnet pública na AZ sa-east-1a
aws ec2 create-subnet \
  --vpc-id vpc-0abc123def456 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone sa-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=subnet-publica-1a},{Key=Type,Value=public}]'

# Criar subnet privada na AZ sa-east-1a
aws ec2 create-subnet \
  --vpc-id vpc-0abc123def456 \
  --cidr-block 10.0.10.0/24 \
  --availability-zone sa-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=subnet-privada-1a},{Key=Type,Value=private}]'
```

---

## 4. Internet Gateway: Como Recursos Alcançam a Internet

### O que é um Internet Gateway

O **Internet Gateway (IGW)** é o componente da VPC que permite comunicação entre recursos dentro da VPC e a internet pública. Sem um Internet Gateway, nenhum recurso em nenhuma subnet da VPC consegue se comunicar com a internet — independente de ter um IP público.

O IGW serve duas funções complementares:

**1. Roteamento:** funciona como o alvo de uma rota na Route Table para o destino `0.0.0.0/0` (qualquer IP na internet). Sem essa rota apontando para o IGW, o tráfego de saída para a internet não sabe para onde ir.

**2. NAT para IPs públicos:** quando uma instância com IP público envia tráfego para a internet, o IGW realiza uma tradução de endereço: o IP privado da instância (ex: `10.0.1.45`) é substituído pelo IP público associado a ela (ex: `54.207.100.10`) nos pacotes que saem. Quando a resposta chega, o processo inverso acontece. Essa tradução é transparente para a instância — ela não sabe que tem um IP público, apenas usa seu IP privado.

### Características do Internet Gateway

**Alta disponibilidade por design:** o IGW é um componente horizontalmente escalável, redundante e altamente disponível gerenciado pela AWS. Você não precisa se preocupar com falhas, capacidade ou patches — a AWS cuida de tudo. Não existe "tamanho" de IGW para escolher.

**Um IGW por VPC:** cada VPC pode ter no máximo um Internet Gateway associado. Você não precisa de múltiplos IGWs para múltiplas AZs — um único IGW serve toda a VPC.

**Sem custo de existência:** o IGW em si não tem custo por hora. O custo surge na transferência de dados que passa por ele (tráfego de saída para a internet).

**Stateless do ponto de vista de roteamento:** o IGW roteia pacotes individualmente sem manter estado de conexão — essa função é dos Security Groups e da stack TCP/IP dos próprios recursos.

### Criando e associando um Internet Gateway

Um IGW precisa ser criado e depois **anexado** a uma VPC. São duas operações separadas:

Via console:
1. VPC → Internet Gateways → Create Internet Gateway
2. Dê um nome ao IGW
3. Após criado, Actions → Attach to VPC → selecione sua VPC

Via CLI:

```bash
# Criar o Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=igw-producao}]'
# Retorna: InternetGatewayId: igw-0abc123def456

# Anexar à VPC
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-0abc123def456 \
  --vpc-id vpc-0abc123def456

# Verificar o estado do IGW (deve mostrar "attached")
aws ec2 describe-internet-gateways \
  --internet-gateway-ids igw-0abc123def456 \
  --query "InternetGateways[*].{ID:InternetGatewayId, State:Attachments[0].State, VPC:Attachments[0].VpcId}" \
  --output table
```

### O fluxo completo de tráfego de saída

Para um recurso em uma subnet pública acessar a internet, três condições precisam ser verdadeiras simultaneamente:

**1. O recurso tem um IP público** (Elastic IP ou IP público automático atribuído pela AWS).

**2. A subnet tem uma rota para o IGW** na sua Route Table (explicado na próxima seção).

**3. O Security Group do recurso permite o tráfego de saída** — por padrão, o tráfego de saída é totalmente liberado, mas pode ser restringido.

Se qualquer uma dessas três condições não for atendida, o tráfego não chega à internet. Esse é um ponto de troubleshooting importante: quando um recurso não consegue acessar a internet, verifique essas três condições em ordem.

### O fluxo completo de tráfego de entrada

Para que a internet alcance um recurso dentro da VPC:

**1. O recurso tem um IP público** — sem IP público, não há endereço de destino para o tráfego externo usar.

**2. A subnet tem uma rota para o IGW** — o IGW precisa estar no caminho do tráfego de entrada.

**3. O Security Group do recurso permite o tráfego de entrada** na porta correta (ex: porta 80 para HTTP, 443 para HTTPS, 22 para SSH) — por padrão, nenhum tráfego de entrada é permitido.

**4. O Network ACL da subnet não bloqueia o tráfego** — por padrão, NACLs permitem tudo, mas podem ter sido configuradas restritivamente.

### IGW vs. NAT Gateway

Uma confusão comum é entre Internet Gateway e NAT Gateway. Eles têm funções complementares mas distintas:

| | Internet Gateway | NAT Gateway |
|---|---|---|
| Permite tráfego de entrada da internet | Sim | Não |
| Permite tráfego de saída para a internet | Sim | Sim |
| Usado por | Subnets públicas | Subnets privadas |
| Custo | Sem custo fixo | ~$0.045/hora + dados processados |
| Gerenciado pela AWS | Sim | Sim |

O NAT Gateway permite que instâncias em subnets **privadas** iniciem conexões de saída para a internet (para baixar atualizações, por exemplo) sem receber um IP público e sem ser acessíveis de entrada. Ele será detalhado na Semana 8.

---

## 5. Route Tables: Como o Tráfego é Roteado

### O que é uma Route Table

Uma **Route Table** é uma tabela de roteamento — um conjunto de regras (rotas) que determinam para onde o tráfego de rede deve ser direcionado quando sai de uma subnet ou de uma VPC.

Cada subnet tem exatamente uma Route Table associada. Quando um recurso em uma subnet envia um pacote de rede, o VPC Router consulta a Route Table daquela subnet para decidir para onde encaminhar o pacote. A decisão é baseada no endereço de destino do pacote.

### Anatomia de uma Route Table

Uma Route Table contém um ou mais registros de rota. Cada rota tem dois campos:

**Destination (Destino):** um endereço IP ou bloco CIDR que representa para quais endereços essa rota se aplica. Pode ser um CIDR específico (como o CIDR da própria VPC) ou o destino curinga `0.0.0.0/0` (que significa "qualquer endereço").

**Target (Alvo):** para onde enviar o pacote quando o endereço de destino bate com o campo Destination. Pode ser um Internet Gateway, um NAT Gateway, uma interface de rede, uma instância EC2, uma VPC Peering connection, um Transit Gateway, entre outros.

**Exemplo de Route Table de uma subnet pública:**

| Destino | Alvo | Descrição |
|---|---|---|
| `10.0.0.0/16` | `local` | Todo tráfego dentro da VPC fica na VPC |
| `0.0.0.0/0` | `igw-0abc123def456` | Todo o resto vai para o Internet Gateway |

**Exemplo de Route Table de uma subnet privada:**

| Destino | Alvo | Descrição |
|---|---|---|
| `10.0.0.0/16` | `local` | Todo tráfego dentro da VPC fica na VPC |

Sem a rota `0.0.0.0/0 → igw`, nenhum tráfego sai para a internet — o que é exatamente o comportamento desejado para uma subnet privada.

### A rota `local`

Toda Route Table tem automaticamente uma rota `local` que não pode ser removida:

```
Destination: 10.0.0.0/16  →  Target: local
```

Essa rota diz ao VPC Router: "qualquer tráfego destinado a um endereço dentro do CIDR desta VPC deve ser roteado internamente, dentro da própria VPC". Ela garante que recursos dentro da VPC possam se comunicar entre si sem precisar sair para a internet.

A rota `local` sempre usa o CIDR block primário da VPC como destino. Ela é criada automaticamente e não pode ser editada ou removida.

### Como o VPC Router escolhe uma rota

Quando múltiplas rotas podem se aplicar ao mesmo destino, o VPC Router escolhe a **mais específica** — a que tem o prefixo CIDR maior (mais bits fixos). Esse é o princípio de **Longest Prefix Match**.

**Exemplo:**

```
Route Table:
10.0.0.0/16  →  local
10.0.1.0/24  →  vpce-0abc123  (VPC Endpoint para S3)
0.0.0.0/0    →  igw-0abc123
```

Para um pacote destinado a `10.0.1.45`:
- `/24` é mais específico que `/16` e mais específico que `/0`
- O pacote é roteado para o VPC Endpoint

Para um pacote destinado a `10.0.5.10`:
- Bate com `/16` mas não com `/24`
- O pacote é roteado via `local` (dentro da VPC)

Para um pacote destinado a `8.8.8.8` (Google DNS):
- Não bate com `/24` nem com `/16`
- Bate apenas com `0.0.0.0/0`
- O pacote é roteado para o Internet Gateway

### Route Table Main (Principal)

Toda VPC tem uma **Main Route Table** — uma Route Table padrão que é automaticamente associada a qualquer subnet que não tem uma Route Table explicitamente associada. Quando você cria uma nova subnet e não a associa a nenhuma Route Table, ela usa a Main Route Table.

**Implicação importante:** se a Main Route Table tiver uma rota para o Internet Gateway, todas as novas subnets criadas serão públicas por padrão — a menos que você explicitamente associe uma Route Table privada a elas.

> **Boa prática:** mantenha a Main Route Table da VPC como uma Route Table **privada** (sem rota para IGW). Crie Route Tables adicionais para subnets públicas e as associe explicitamente. Dessa forma, qualquer subnet criada sem associação explícita é privada por padrão — o comportamento mais seguro.

### Associação de Route Tables a Subnets

Uma Route Table pode ser associada a múltiplas subnets. Uma subnet pode ter apenas uma Route Table associada por vez.

Uma arquitetura típica com quatro subnets (duas públicas em duas AZs, duas privadas em duas AZs) usa geralmente duas Route Tables:

```
Route Table Pública (rtb-public):
  Rotas: 10.0.0.0/16 → local
         0.0.0.0/0   → igw-0abc123
  Associada a: Subnet Pública A, Subnet Pública B

Route Table Privada (rtb-private):
  Rotas: 10.0.0.0/16 → local
  Associada a: Subnet Privada A, Subnet Privada B
```

Quando subnets privadas em AZs diferentes precisam de NAT Gateways diferentes (um por AZ, para resiliência), você cria uma Route Table privada por AZ, cada uma apontando para o NAT Gateway da sua própria AZ:

```
Route Table Privada A (para sa-east-1a):
  Rotas: 10.0.0.0/16 → local
         0.0.0.0/0   → nat-0abc123 (NAT na AZ 1a)
  Associada a: Subnet Privada A

Route Table Privada B (para sa-east-1b):
  Rotas: 10.0.0.0/16 → local
         0.0.0.0/0   → nat-0def456 (NAT na AZ 1b)
  Associada a: Subnet Privada B
```

Essa configuração garante que se um NAT Gateway em `sa-east-1a` falhar, o tráfego de `sa-east-1b` continua fluindo pelo seu próprio NAT Gateway.

### Criando e configurando Route Tables via CLI

```bash
# Criar uma Route Table
aws ec2 create-route-table \
  --vpc-id vpc-0abc123def456 \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rtb-publica}]'
# Retorna: RouteTableId: rtb-0abc123def456

# Adicionar rota para o Internet Gateway (tornando a RT pública)
aws ec2 create-route \
  --route-table-id rtb-0abc123def456 \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id igw-0abc123def456

# Associar a Route Table a uma subnet
aws ec2 associate-route-table \
  --route-table-id rtb-0abc123def456 \
  --subnet-id subnet-0abc123def456

# Listar todas as rotas de uma Route Table
aws ec2 describe-route-tables \
  --route-table-ids rtb-0abc123def456 \
  --query "RouteTables[*].Routes" \
  --output table

# Verificar qual Route Table está associada a cada subnet
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=vpc-0abc123def456" \
  --query "RouteTables[*].{ID:RouteTableId, Subnets:Associations[*].SubnetId}" \
  --output table
```

### O fluxo completo: da criação ao recurso na internet

Juntando tudo que foi coberto nesta semana, o fluxo para que um recurso em uma subnet pública acesse a internet é:

```
Instância EC2 (IP privado: 10.0.1.45, IP público: 54.207.100.10)
    │
    │ Envia pacote para 8.8.8.8 (Google DNS)
    ▼
VPC Router consulta a Route Table da subnet
    │
    │ Rota: 0.0.0.0/0 → igw-0abc123
    ▼
Internet Gateway
    │
    │ Traduz IP privado (10.0.1.45) para IP público (54.207.100.10)
    │ Encaminha o pacote para a internet
    ▼
Internet → Servidor de destino (8.8.8.8)
    │
    │ Resposta retorna para 54.207.100.10
    ▼
Internet Gateway
    │
    │ Traduz IP público (54.207.100.10) de volta para IP privado (10.0.1.45)
    ▼
Instância EC2 recebe a resposta
```

E o mesmo fluxo para uma requisição que chega da internet para a instância:

```
Usuário na internet faz requisição para 54.207.100.10:80
    │
    ▼
Internet Gateway
    │
    │ Traduz IP público (54.207.100.10) para IP privado (10.0.1.45)
    │ Consulta Route Table: destino 10.0.1.45 bate com rota local
    ▼
Instância EC2 (10.0.1.45)
    │
    │ Security Group verifica se porta 80 está liberada
    │ Se sim: requisição chega à aplicação
    │ Se não: pacote é descartado silenciosamente
    ▼
Aplicação processa e responde
```

---

## Prática da Semana 6

Com os conceitos desta semana, você já tem tudo o que precisa para criar a estrutura de rede fundamental de qualquer arquitetura AWS. O exercício prático consiste em criar uma VPC do zero com uma subnet pública e uma privada, um IGW, e as Route Tables corretas.

```bash
# 1. Criar a VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=vpc-estudo}]'

# 2. Habilitar DNS hostnames (boa prática — necessário para RDS e outros serviços)
aws ec2 modify-vpc-attribute \
  --vpc-id vpc-SEU-ID \
  --enable-dns-hostnames '{"Value":true}'

# 3. Criar subnet pública
aws ec2 create-subnet \
  --vpc-id vpc-SEU-ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone sa-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=subnet-publica-1a}]'

# 4. Criar subnet privada
aws ec2 create-subnet \
  --vpc-id vpc-SEU-ID \
  --cidr-block 10.0.10.0/24 \
  --availability-zone sa-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=subnet-privada-1a}]'

# 5. Criar e anexar o Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=igw-estudo}]'

aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-SEU-ID \
  --vpc-id vpc-SEU-ID

# 6. Criar Route Table pública e adicionar rota para o IGW
aws ec2 create-route-table \
  --vpc-id vpc-SEU-ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rtb-publica}]'

aws ec2 create-route \
  --route-table-id rtb-SEU-ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id igw-SEU-ID

# 7. Associar a Route Table pública à subnet pública
aws ec2 associate-route-table \
  --route-table-id rtb-SEU-ID \
  --subnet-id subnet-PUBLICA-ID

# 8. Habilitar atribuição automática de IP público na subnet pública
aws ec2 modify-subnet-attribute \
  --subnet-id subnet-PUBLICA-ID \
  --map-public-ip-on-launch

# A subnet privada usa a Main Route Table da VPC (sem rota para IGW) — já está isolada.
```

---

## Resumo da Semana 6

| Conceito | O que você precisa saber |
|---|---|
| VPC | Rede privada isolada dentro da AWS; escopo por região; até 5 por região por padrão |
| VPC Default | Criada automaticamente; todas as subnets são públicas; não usar em produção |
| CIDR block | Notação para definir faixas de IP; `10.0.0.0/16` = 65.536 IPs |
| Prefixo CIDR | Quanto maior o número, menor a rede; `/16` > `/24` em capacidade |
| IPs reservados AWS | 5 IPs por subnet são reservados pela AWS e não usáveis |
| Planejamento de CIDR | Definir antes de criar recursos; CIDRs de ambientes não devem se sobrepor |
| Subnet pública | Tem rota para Internet Gateway na sua Route Table |
| Subnet privada | Sem rota para Internet Gateway; isolada da internet |
| IP público | Efêmero (muda ao reiniciar) ou estático (Elastic IP) |
| Internet Gateway | Componente que conecta a VPC à internet; um por VPC; sem custo fixo |
| IGW e NAT | IGW: tráfego bidirecional para subnets públicas; NAT: só saída para subnets privadas |
| Route Table | Define para onde o tráfego é roteado; uma por subnet; Main RT é o padrão |
| Rota `local` | Automática e irremovível; garante comunicação interna na VPC |
| Longest Prefix Match | Rota mais específica (prefixo maior) tem precedência |
| Main Route Table | Associada a subnets sem RT explícita; manter privada por segurança |

---

## Próximos Passos

Na **Semana 7**, você aprenderá os mecanismos de segurança de rede da VPC: **Security Groups** (firewall stateful por instância) e **Network ACLs** (firewall stateless por subnet). Esses dois mecanismos trabalham em camadas diferentes e em conjunto formam o controle de acesso de rede da sua infraestrutura. Você também aprenderá a diagnosticar problemas de conectividade — uma das habilidades mais práticas de um administrador de infraestrutura.

---

## Fontes e Leitura Complementar

### Documentação Oficial AWS

- AWS. *What is Amazon VPC?* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html
- AWS. *VPCs and subnets.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/configure-your-vpc.html
- AWS. *IP addressing in your VPC.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html
- AWS. *Subnet CIDR reservations.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html
- AWS. *Internet gateways.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
- AWS. *Configure route tables.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html
- AWS. *Default VPC and default subnets.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/default-vpc.html
- AWS. *Elastic IP addresses.* Amazon EC2 User Guide. Disponível em: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html
- AWS. *AWS VPC Limits.* Amazon VPC User Guide. Disponível em: https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html

### Padrões e Referências de Rede

- IETF. RFC 1918 — *Address Allocation for Private Internets.* Disponível em: https://datatracker.ietf.org/doc/html/rfc1918
- IETF. RFC 4632 — *Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan.* Disponível em: https://datatracker.ietf.org/doc/html/rfc4632
- NIST. *Guidelines on Firewalls and Firewall Policy* (SP 800-41 Rev. 1) — referência para segmentação de rede e firewalls. Disponível em: https://csrc.nist.gov/publications/detail/sp/800-41/rev-1/final

### Ferramentas

- CIDR Calculator (cidr.xyz): https://cidr.xyz
- IP Calculator (jodies.de): https://jodies.de/ipcalc
- AWS VPC CIDR Visualizer: disponível no console AWS ao criar subnets

### Materiais de Estudo

- AWS Well-Architected Framework — *Reliability Pillar — Network topology*: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_planning_network_topology_prefer_hub_and_spoke.html
- AWS. *Amazon VPC Ingress Routing* (roteamento avançado): https://docs.aws.amazon.com/vpc/latest/userguide/route-table-options.html
- AWS Skill Builder — *AWS Networking Basics* (gratuito): https://explore.skillbuilder.aws/learn/course/external/view/elearning/12439/aws-networking-basics
- AWS. *VPC example configurations* (exemplos de arquiteturas de VPC): https://docs.aws.amazon.com/vpc/latest/userguide/vpc-examples-intro.html