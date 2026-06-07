## Introdução

Se existe um único serviço que você precisa entender profundamente antes de qualquer outro na AWS, esse é o IAM. Não o EC2, não o RDS, não o S3 e nem o Elastic Beanstalk. Comece pelo IAM.

O motivo é simples: o IAM controla quem pode fazer o quê na sua conta AWS. Toda operação em qualquer serviço, por exemplo: criar uma instância EC2, acessar um bucket S3, acessar um banco de dados RDS ou modificar uma regra de firewall, passa pelo IAM antes de ser executada. Se o IAM não autorizar, a operação não acontece.

Administradores de infraestrutura que entendem IAM superficialmente cometem erros que ficam adormecidos por meses ou até anos, até que, um dia, se tornam um grande problema de segurança. Já administradores que entendem o IAM profundamente constroem ambientes onde o raio de impacto de qualquer comprometimento é limitado por design.

## 1. O que é IAM e Por que ele existe?

<div style="text-align: center;display: flex;justify-content: center;"><img src="/posts/aws-iam-logo-franklindux.png" alt="Logo do IAM" style="width: 300px;" /></div>

### O problema que o IAM resolve
Imagine que você acabou de criar sua conta AWS. Existe um único usuário com acesso total:
O Root User, com poder absoluto sobre tudo. Agora você precisa:
- Dar acesso a um colega desenvolvedor para criar e gerenciar instâncias EC2.
- Dar acesso a uma aplicação para ler objetos de um bucket S3 específico.
- Dar acesso a um colega de operações para monitorar métricas no CloudWatch, mas sem poder modificar nada.
- Dar acesso a um serviço de CI/CD para fazer deploy no Elastic Beanstalk.

Como você faze isso sem dar a senha do Root User para o todo mundo? E como garante que o desenvolvedor não acesse acidentalmente (ou malicionamente) o banco de dados e produção? E que a aplicação não possa deletar instâncias?

O IAM (Identity and Acessess Management) é a resposta para todos esses problemas.

### O que é o IAM?
O IAM é o serviço da AWS que gerencia identidades (quem você é) e permissões de acesso (o que você pode fazer). Ele permite criar e gerenciar:

- **Identidades**: Usuários humanos, grupos de usuários e roles (para serviços e sistemas).
- **Política de Permissões**: Regras que definem quais ações são permitidas ou negadas em quais recursos.
- **Autenticação**: Verificar que você é quem diz ser (senha, MFA, access keys).
- **Autorização**: Verificar se você tem permissão para realizar uma ação específica em um recurso específico.

Características fundamentais do IAM:
**IAM é um serviço global.** Diferente da maioria dos serviços AWS que existem por região, o IAM é um serviço global.

**IAM é gratuito.** Você não paga nada para criar usuários, grupos, roles ou políticas. Você só paga pelos recursos que os usuários e roles acessam (EC2, S3, etc).

**IAM é o portão de entrada para tudo.** Cada chamada de API para qualquer serviço AWS - seja via console, CLI ou SDK - passa pelo IAM, que avalia se a identidade tem permissão para executar aquela operação naquele recurso. Se não tiver, a chamada retorna um erro de acesso negado ('AccessDenied').

**IAM nega por padrão.** Se você não explicitamente conceder permissão para uma ação, ela é negada. Isso é fundamental para a segurança, pois garante que nada pode ser feito sem autorização explícita. Isso só é excessão para o Root User, que tem acesso total por padrão.

### O Modelo de avaliação de permissões (Visão Geral):
Quando uma identidade tenta realizar uma ação, o IAM segue uma lógica de avaliação:
1. **Negação explícita**: O IAM verifica se existe uma política que explicitamente negue ('Deny') a ação. Se sim, a ação é negada, mesmo que exista uma permissão explícita.
2. **Permissões explícitas**: O IAM verifica se existe uma política que explicitamente permita ('Allow') a ação. Se sim, a ação é permitida. (Desde que não exista uma negação ('Deny') explícita, como no passo 1).
3. **Negação implícita**: Se não existe nenhuma permissão explícita ou negação explícita, a ação é negada por padrão (implicit deny).

A regra de ouro: Um Deny explícito sempre vence um Allow, e a ausência de um Allow é uma negação implícita. Portanto, para que uma ação seja permitida, deve existir um Allow explícito e não pode existir nenhum Deny explícito.

## 2. Usuários, Grupos e Roles (Papel/Função)

O IAM tem três tipos principais de identidades: Users, Groups e Roles. Cada um tem um propósito específico e é usado em cenários diferentes, confundir-los é um dos erros mais comuns que vejo em ambientes AWS.

### IAM Users (Usuários)

O IAM tem três tipos principais de identidade: Users, Groups e Roles. Cada um serve a um propósito distinto, e confundir quando usar cada um é um dos erros mais comuns em ambientes AWS.

### IAM Users (Usuários)

Um **IAM User** é uma identidade que representa uma **pessoa ou uma aplicação/sistema específico** que precisa de acesso à conta AWS de forma persistente.

Cada usuário tem:

- **Nome único** dentro da conta.
- **Credenciais de console:** nome de usuário + senha para login no console web.
- **Credenciais programáticas (opcionais):** Access Key ID + Secret Access Key para acesso via AWS CLI, SDKs ou APIs.
- **Políticas de permissão:** diretamente anexadas ao usuário ou herdadas de grupos.

Um usuário IAM criado sem nenhuma política não pode fazer absolutamente nada. Ele pode fazer login no console, mas qualquer tentativa de acessar serviços retorna `AccessDenied`.

**Quando criar um IAM User:**

- Para sistemas externos (ferramentas de CI/CD hospedadas fora da AWS, aplicações em servidores on-premises) que genuinamente precisam de credenciais de longa duração e não têm suporte a credenciais temporárias.
- Para contas individuais de estudo e aprendizado, onde a simplicidade importa mais que a escala.

**Quando NÃO criar um IAM User:**

- Para serviços AWS que precisam acessar outros serviços AWS — use Roles (detalhado abaixo).
- Para acesso temporário — use Roles com STS (AWS Security Token Service), abordado no futuro.
- Para acesso humano em ambientes com múltiplas pessoas ou múltiplas contas AWS — veja a nota abaixo.

**Limitações e boas práticas:**

- Uma conta AWS suporta até **5.000 usuários IAM** por padrão.
- Cada usuário pode ter no máximo **2 Access Keys** ativas simultaneamente (para facilitar rotação).
- Access Keys devem ser rotacionadas regularmente (recomendação: a cada 90 dias).
- Nunca crie um usuário IAM genérico compartilhado entre múltiplas pessoas. Cada pessoa deve ter seu próprio usuário para que o CloudTrail registre ações de forma rastreável.

> **Boa prática atual — IAM Identity Center**
>
> Desde 2022, a AWS recomenda oficialmente o **IAM Identity Center** (antigo AWS SSO) como o método preferido para gerenciar acesso humano a contas AWS — em vez de criar IAM Users individuais com senhas e Access Keys.
>
> O IAM Identity Center funciona como uma camada centralizada de Single Sign-On: você conecta seu provedor de identidade existente (Google Workspace, Azure Active Directory, Okta, ou o diretório interno do próprio Identity Center), define permissões por conjunto de contas, e os usuários fazem login uma única vez para acessar múltiplas contas AWS. As credenciais geradas são sempre **temporárias** — nenhuma Access Key permanente é necessária para acesso humano.
>
> **Por que isso importa:** IAM Users com Access Keys permanentes são um vetor de risco. Chaves esquecidas, não rotacionadas ou expostas acidentalmente em repositórios são a causa de boa parte dos incidentes de segurança em ambientes AWS. O IAM Identity Center elimina esse problema para acessos humanos.
>
> **Nesse artigo:** IAM Users são estudados primeiro porque são o alicerce conceitual — você precisa entender usuários, grupos, roles e policies antes de configurar o Identity Center, que usa todos esses conceitos internamente. O IAM Identity Center será abordado em mais detalhes no futuro.

### IAM Groups (Grupos)

Um **IAM Group** é uma coleção de usuários IAM. Ele serve para organizar usuários e facilitar a atribuição de permissões em lote. Políticas de permissão aplicadas a um grupo são herdadas por todos os usuários membros do grupo.
 
**Por que grupos existem:**
 
Sem grupos, se você tem 10 desenvolvedores e precisa dar a eles acesso ao EC2, você precisaria anexar a mesma política a cada um dos 10 usuários individualmente. Se amanhã você precisar alterar essa permissão, teria que modificar 10 usuários. Com grupos, você aplica a política ao grupo `Developers` uma única vez e todos os 10 herdam. Para revogar o acesso de um desenvolvedor, você o remove do grupo.

**Características dos grupos:**

- Um usuário pode pertencer a **múltiplos grupos** simultaneamente. Suas permissões são a união das permissões de todos os grupos dos quais faz parte.
- Grupos **não podem conter outros grupos** — não existe hierarquia de grupos no IAM.
- Grupos **não são identidades** — você não pode fazer login como um grupo, nem referenciar um grupo em políticas de resource-based (isso ficará claro na seção de Policies).
- Uma conta suporta até **300 grupos** por padrão.

**Estrutura típica de grupos em um ambiente de desenvolvimento:**
 
```
Administrators    → AdministratorAccess (acesso total)
Developers        → EC2, S3, RDS (leitura e escrita)
Operations        → CloudWatch, EC2 (leitura), Systems Manager
ReadOnly          → ViewOnlyAccess (leitura em tudo)
Billing           → Billing (acesso ao faturamento)
```

### IAM Roles (Funções/Papéis)

Uma **IAM Role** é o componente mais poderoso e frequentemente mal compreendido do IAM. Diferente de um usuário, uma role **não pertence a uma pessoa específica** — ela é uma identidade que pode ser **assumida temporariamente** por quem tiver permissão para isso.

Quando uma entidade assume uma role, ela recebe credenciais temporárias (com prazo de expiração) que concedem as permissões da role. Quando o prazo expira, as credenciais se tornam inválidas automaticamente.

**Quem pode assumir uma role:**

- **Serviços AWS:** uma instância EC2 pode assumir uma role para acessar o S3. Um Lambda pode assumir uma role para escrever no DynamoDB. O Elastic Beanstalk usa uma role para criar instâncias EC2 em seu nome.
- **Usuários IAM:** um usuário pode assumir uma role diferente para obter permissões elevadas temporariamente (em vez de ter essas permissões sempre ativas).
- **Contas AWS externas:** uma role pode permitir que usuários de outra conta AWS a assumam — útil para acesso cross-account.
- **Identidades externas (federação):** usuários autenticados por provedores de identidade externos (Google, Active Directory, Okta) podem assumir roles via federação SAML ou OIDC. Será abordado em tópicos avançados.

**Anatomy de uma Role:**

Uma role tem dois componentes de política:

1. **Trust Policy (Política de Confiança):** define *quem* pode assumir a role. É um documento JSON que especifica os "principals" autorizados.
2. **Permission Policy (Política de Permissão):** define *o que* quem assumiu a role pode fazer. É igual a qualquer outra política IAM.

**Exemplo de Trust Policy que permite ao serviço EC2 assumir a role:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

O que cada parte faz:

* `"Effect": "Allow"` → permite a ação.
* `"Principal"` → define quem pode assumir a role.
* `"Service": "ec2.amazonaws.com"` → o principal é o serviço EC2.
* `"Action": "sts:AssumeRole"` → autoriza a operação de assumir a role.

**Por que roles são superiores a users para serviços:**
 
Quando uma aplicação rodando em EC2 precisa acessar o S3, você tem duas opções:
 
- **Opção ruim:** criar um usuário IAM, gerar Access Keys, configurar as keys na instância. As keys ficam no disco da instância (risco de exposição), não expiram (risco se comprometidas), e precisam de rotação manual.
- **Opção correta:** criar uma role com permissão de acesso ao S3, associar a role à instância EC2 via Instance Profile. A instância obtém credenciais temporárias automaticamente, que expiram e se renovam sem intervenção humana. Nenhuma chave fica armazenada no disco.
**Instance Profile** é o contêiner que associa uma role a uma instância EC2. Na prática, quando você associa uma role a uma instância EC2 no console, um Instance Profile é criado automaticamente com o mesmo nome. Na CLI e em IaC, você referencia o Instance Profile explicitamente.
 
**Comparativo resumido:**
 
| | User | Group | Role |
|---|---|---|---|
| Representa | Pessoa ou sistema específico | Conjunto de usuários | Identidade assumível temporariamente |
| Credenciais | Senha + Access Keys (permanentes) | Não tem credenciais próprias | Credenciais temporárias (STS) |
| Uso típico | Humanos, sistemas externos | Organizar usuários | Serviços AWS, acesso temporário, cross-account |
| Expira | Não | N/A | Sim (credenciais temporárias) |
| Pode fazer login no console | Sim | Não | Não (diretamente) |
 
---

## 3. Políticas (Policies): Inline vs. Managed
 
### O que é uma Policy
 
Uma **Policy** (política) é um documento JSON que define permissões. Ela especifica quais **ações** são permitidas ou negadas em quais **recursos**, sob quais **condições**.
 
Políticas são o mecanismo central do IAM. Sem políticas, nenhuma identidade (usuário, grupo ou role) tem permissão para fazer nada. Com políticas, você define com precisão cirúrgica o que cada identidade pode ou não fazer.
 
### Identity-based vs. Resource-based Policies
 
Antes de falar em inline vs. managed, é importante entender os dois tipos fundamentais de políticas:
 
**Identity-based Policies:** são anexadas a uma identidade (usuário, grupo ou role) e controlam o que essa identidade pode fazer. São o tipo mais comum.
 
**Resource-based Policies:** são anexadas diretamente a um recurso (um bucket S3, uma fila SQS, uma chave KMS) e controlam quem pode acessar aquele recurso específico. Incluem um campo `Principal` que identifica quem a política concede acesso.
 
```json
// Exemplo de resource-based policy em um bucket S3
// Permite que a conta 111122223333 leia objetos do bucket
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:root"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::meu-bucket/*"
    }
  ]
}
```
 
### Managed Policies
 
Uma **Managed Policy** é uma política criada independentemente de qualquer identidade e que pode ser **anexada a múltiplos usuários, grupos e roles**.
 
Existem dois subtipos:
 
#### AWS Managed Policies
 
Criadas e mantidas pela própria AWS. Você não pode editá-las, mas pode usá-las. São atualizadas automaticamente pela AWS quando novos serviços ou ações são lançados.
 
Exemplos comuns:
 
| Policy | O que permite |
|---|---|
| `AdministratorAccess` | Acesso total a tudo na conta (exceto Billing por padrão) |
| `PowerUserAccess` | Acesso a todos os serviços exceto IAM e Organizations |
| `ReadOnlyAccess` | Leitura em todos os serviços |
| `AmazonEC2FullAccess` | CRUD completo no EC2 |
| `AmazonS3ReadOnlyAccess` | Leitura em todos os buckets S3 |
| `AmazonRDSFullAccess` | CRUD completo no RDS |
| `CloudWatchFullAccess` | Acesso total ao CloudWatch |
| `IAMFullAccess` | Acesso total ao IAM |
| `AWSElasticBeanstalkFullAccess` | Acesso total ao Elastic Beanstalk |
 
**Quando usar AWS Managed Policies:**
 
- Para começar rapidamente — são bem conhecidas e documentadas.
- Para permissões padronizadas (read-only, full access) onde granularidade fina não é necessária.
- Cuidado: `AdministratorAccess` é muito ampla para uso em produção; reserve para administradores humanos e prefira políticas mais restritas para serviços.
#### Customer Managed Policies
 
Criadas e mantidas por você. São o padrão ouro para ambientes de produção: permitem granularidade total, são reutilizáveis, têm versionamento (a AWS guarda até 5 versões), e seguem exatamente o princípio do menor privilégio.
 
**Vantagens sobre AWS Managed Policies:**
 
- **Controle total:** você define exatamente quais ações e recursos são permitidos.
- **Versionamento:** você pode reverter para uma versão anterior se uma atualização causar problemas.
- **Reutilização:** uma Customer Managed Policy pode ser anexada a múltiplos usuários, grupos e roles.
- **Rastreabilidade:** você sabe exatamente o que está concedendo.
**Uma Customer Managed Policy pode ser anexada a até 5.000 entidades** (usuários, grupos e roles combinados).
 
### Inline Policies
 
Uma **Inline Policy** é uma política escrita **diretamente dentro de uma identidade específica** (usuário, grupo ou role). Ela não existe independentemente — se você deletar a identidade, a política também é deletada.
 
**Quando usar Inline Policies:**
 
- Quando você precisa garantir que uma política específica nunca seja reutilizada em outra identidade — a política e a identidade são inseparáveis por design.
- Para permissões excepcionais que são específicas de um único usuário ou role e não fazem sentido em nenhum outro contexto.
**Quando NÃO usar Inline Policies:**
 
- Para permissões que podem se aplicar a múltiplas identidades — use Customer Managed Policies.
- Como padrão geral — Inline Policies são mais difíceis de gerenciar em escala (você precisa entrar em cada identidade para ver suas permissões).
**Comparativo:**
 
| | AWS Managed | Customer Managed | Inline |
|---|---|---|---|
| Quem cria | AWS | Você | Você |
| Pode editar | Não | Sim | Sim |
| Reutilizável | Sim | Sim | Não |
| Versionamento | Não | Sim (5 versões) | Não |
| Visível no IAM Policies | Sim | Sim | Não (só na identidade) |
| Uso recomendado | Início rápido | Produção | Exceções específicas |
 
---

## 4. Estrutura de uma Policy em JSON
 
Toda policy IAM é um documento JSON com uma estrutura definida. Entender cada campo é fundamental para escrever e interpretar permissões corretamente.
 
### Estrutura completa
 
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermitirLeituraS3Producao",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::meu-bucket-producao",
        "arn:aws:s3:::meu-bucket-producao/*"
      ],
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "sa-east-1"
        }
      }
    }
  ]
}
```
 
### `Version`
 
Define a versão da linguagem de políticas IAM. Sempre use `"2012-10-17"` — esta é a versão atual desde 2012 e suporta todos os recursos modernos. A versão anterior (`"2008-10-17"`) não suporta variáveis de política e nunca deve ser usada em políticas novas.
 
```json
"Version": "2012-10-17"
```
 
### `Statement`
 
É o coração da política — um array de um ou mais objetos, cada um definindo uma regra de permissão ou negação. Uma política pode ter múltiplos statements, e cada statement é avaliado independentemente.
 
```json
"Statement": [ /* array de statements */ ]
```
 
### `Sid` (Statement ID)
 
Identificador opcional para o statement. Serve para documentação e referência. Não afeta a avaliação da permissão.
 
```json
"Sid": "PermitirLeituraS3Producao"
```
 
Boas práticas para Sid:
- Use nomes descritivos que expliquem a intenção do statement.
- Evite espaços — alguns serviços têm restrições de caracteres.
- Seja consistente: `PermitirEC2Leitura`, `NegaDeleteRDS`, `AllowCloudWatchRead`.
### `Effect`
 
Define se o statement **permite** ou **nega** as ações especificadas. Aceita apenas dois valores:
 
```json
"Effect": "Allow"  // Permite as ações
"Effect": "Deny"   // Nega as ações (tem precedência sobre Allow)
```
 
**A regra crítica:** um `Deny` explícito sempre vence qualquer `Allow`, independente de qual política o `Allow` vem. Se você tem uma política que diz `Allow s3:DeleteObject` e outra que diz `Deny s3:DeleteObject`, a ação é negada — ponto final.
 
### `Action`
 
Especifica as operações que o statement permite ou nega. Cada serviço AWS tem suas próprias ações, seguindo o padrão `serviço:Ação`.
 
**Formato:**
 
```json
// Uma única ação
"Action": "s3:GetObject"
 
// Múltiplas ações
"Action": [
  "s3:GetObject",
  "s3:PutObject",
  "s3:DeleteObject"
]
 
// Wildcard: todas as ações de um serviço
"Action": "s3:*"
 
// Wildcard global: todas as ações de todos os serviços (PERIGOSO)
"Action": "*"
```
 
**Exemplos de ações por serviço:**
 
| Serviço | Ações comuns |
|---|---|
| EC2 | `ec2:DescribeInstances`, `ec2:StartInstances`, `ec2:StopInstances`, `ec2:TerminateInstances` |
| S3 | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` |
| RDS | `rds:DescribeDBInstances`, `rds:CreateDBInstance`, `rds:DeleteDBInstance` |
| IAM | `iam:CreateUser`, `iam:AttachUserPolicy`, `iam:ListUsers` |
| CloudWatch | `cloudwatch:GetMetricData`, `cloudwatch:PutMetricAlarm` |
 
**Como descobrir as ações disponíveis:**
 
A documentação de referência de ações IAM está em `https://docs.aws.amazon.com/service-authorization/latest/reference/` — cada serviço tem sua página com todas as ações, recursos e condições suportadas.
 
### `Resource`
 
Especifica **em quais recursos** as ações se aplicam, usando ARNs.
 
```json
// Um recurso específico
"Resource": "arn:aws:s3:::meu-bucket"
 
// Múltiplos recursos
"Resource": [
  "arn:aws:s3:::meu-bucket",
  "arn:aws:s3:::meu-bucket/*"
]
 
// Wildcard: todos os recursos (use com cautela)
"Resource": "*"
```
 
**A diferença entre `arn:aws:s3:::meu-bucket` e `arn:aws:s3:::meu-bucket/*`:**
 
- `arn:aws:s3:::meu-bucket` — refere-se ao bucket em si. Necessário para ações de bucket como `s3:ListBucket`.
- `arn:aws:s3:::meu-bucket/*` — refere-se a **objetos dentro** do bucket. Necessário para ações de objeto como `s3:GetObject` e `s3:PutObject`.
Muitas políticas S3 precisam dos **dois** ARNs para funcionar corretamente:
 
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:ListBucket",      // Ação de bucket
    "s3:GetObject",       // Ação de objeto
    "s3:PutObject"        // Ação de objeto
  ],
  "Resource": [
    "arn:aws:s3:::meu-bucket",     // Para ListBucket
    "arn:aws:s3:::meu-bucket/*"    // Para GetObject e PutObject
  ]
}
```
 
**Wildcard em ARNs:**
 
O `*` pode ser usado em partes específicas do ARN:
 
```json
// Todas as instâncias EC2 em qualquer região da conta
"Resource": "arn:aws:ec2:*:123456789012:instance/*"
 
// Uma instância específica
"Resource": "arn:aws:ec2:sa-east-1:123456789012:instance/i-0abc123def456"
 
// Todos os usuários IAM cujo nome começa com "dev-"
"Resource": "arn:aws:iam::123456789012:user/dev-*"
```
 
**Algumas ações não têm recurso específico** e exigem `"Resource": "*"`. Por exemplo, `ec2:DescribeInstances` retorna informações de todas as instâncias — não faz sentido aplicá-la a uma instância específica. A documentação de cada ação indica se ela suporta especificação de resource.
 
### `Condition`
 
O campo `Condition` é opcional mas poderoso — ele adiciona **condições adicionais** que precisam ser verdadeiras para o statement ser aplicado. Permite controle de acesso muito mais granular do que apenas ação + recurso.
 
**Estrutura:**
 
```json
"Condition": {
  "<OperadorDeCondição>": {
    "<ChaveDeCondição>": "<Valor>"
  }
}
```
 
**Operadores de condição:**
 
| Tipo | Operadores |
|---|---|
| String | `StringEquals`, `StringNotEquals`, `StringLike`, `StringNotLike` |
| Numérico | `NumericEquals`, `NumericLessThan`, `NumericGreaterThan` |
| Data | `DateEquals`, `DateBefore`, `DateAfter` |
| Booleano | `Bool` |
| IP | `IpAddress`, `NotIpAddress` |
| ARN | `ArnEquals`, `ArnLike` |
| Existência | `Null` |
 
**Chaves de condição globais** (disponíveis em todos os serviços):
 
| Chave | Descrição |
|---|---|
| `aws:RequestedRegion` | Região onde a ação está sendo solicitada |
| `aws:SourceIp` | IP de origem da requisição |
| `aws:CurrentTime` | Horário atual da requisição |
| `aws:MultiFactorAuthPresent` | Se o usuário autenticou com MFA |
| `aws:PrincipalTag/<tag-key>` | Tags associadas à identidade |
| `aws:ResourceTag/<tag-key>` | Tags associadas ao recurso |
| `aws:userid` | ID do usuário ou role fazendo a requisição |
 
**Exemplos práticos de Condition:**
 
```json
// Permitir ação apenas se feita com MFA ativo
"Condition": {
  "Bool": {
    "aws:MultiFactorAuthPresent": "true"
  }
}
 
// Permitir ação apenas a partir de um IP específico
"Condition": {
  "IpAddress": {
    "aws:SourceIp": "203.0.113.0/24"
  }
}
 
// Permitir ação apenas em uma região específica
"Condition": {
  "StringEquals": {
    "aws:RequestedRegion": "sa-east-1"
  }
}
 
// Permitir ação apenas em recursos com uma tag específica
"Condition": {
  "StringEquals": {
    "aws:ResourceTag/Environment": "development"
  }
}
 
// Permitir EC2 apenas durante horário comercial (UTC)
"Condition": {
  "DateGreaterThan": {"aws:CurrentTime": "2024-01-01T09:00:00Z"},
  "DateLessThan": {"aws:CurrentTime": "2024-12-31T18:00:00Z"}
}
```
 
**Múltiplas condições no mesmo bloco são avaliadas com AND** — todas precisam ser verdadeiras:
 
```json
"Condition": {
  "Bool": {
    "aws:MultiFactorAuthPresent": "true"
  },
  "StringEquals": {
    "aws:RequestedRegion": "sa-east-1"
  }
}
// MFA ativo E região sa-east-1 — ambas precisam ser verdadeiras
```
 
### Política completa comentada: exemplo real
 
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermitirGerenciamentoEC2EmSaoPaulo",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "sa-east-1"
        },
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    },
    {
      "Sid": "NegaTerminarInstanciasProducao",
      "Effect": "Deny",
      "Action": "ec2:TerminateInstances",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Environment": "production"
        }
      }
    }
  ]
}
```
 
Esta política:
1. Permite listar, iniciar e parar instâncias EC2 em São Paulo, mas **apenas com MFA ativo**.
2. Nega terminação de qualquer instância marcada com `Environment = production` — independente de outras políticas.
---
 
## 5. Princípio do Menor Privilégio
 
### O conceito
 
O **Princípio do Menor Privilégio** (*Principle of Least Privilege*) é a prática de conceder a cada identidade **apenas as permissões mínimas necessárias para realizar sua função** — e nada além disso.
 
Se um serviço só precisa ler objetos de um bucket S3 específico, ele recebe `s3:GetObject` naquele bucket. Não `s3:*`. Não `*` em todos os recursos. Apenas o necessário.
 
Se um desenvolvedor precisa criar e gerenciar instâncias EC2, ele recebe as ações EC2 relevantes. Não `AdministratorAccess`. Não acesso ao IAM. Não acesso ao banco de dados de produção.
 
### Por que o menor privilégio importa
 
**Limitação do raio de impacto:** se uma credencial for comprometida, o atacante só pode fazer o que aquela credencial permite. Uma credencial com `s3:GetObject` em um único bucket causa muito menos dano do que uma com `AdministratorAccess`.
 
**Prevenção de erros humanos:** um desenvolvedor que não tem permissão de deletar o banco de dados de produção simplesmente não consegue fazer isso — nem por acidente. Permissões desnecessárias criam superfície para erros catastróficos.
 
**Compliance e auditoria:** regulações como LGPD, SOC 2, PCI-DSS exigem evidências de que o acesso a dados sensíveis é restrito ao mínimo necessário.
 
**Redução de superfície de ataque:** cada permissão desnecessária é uma porta potencial para exploração. Menos permissões = menos portas.
 
### O problema do "dar AdministratorAccess para simplificar"
 
Em ambientes de desenvolvimento e estudo, há uma tentação muito comum: dar `AdministratorAccess` para tudo porque é mais simples e evita erros de permissão enquanto você aprende. Isso cria dois problemas sérios:
 
1. **Hábito ruim:** você não aprende quais permissões são realmente necessárias para cada tarefa.
2. **Risco real:** se você por acidente expõe uma Access Key de um usuário com `AdministratorAccess`, o atacante tem controle total da conta.
A abordagem correta durante o aprendizado: comece com a permissão que você acha que precisa, execute a tarefa, veja se recebe `AccessDenied`, adicione a permissão faltante. Esse ciclo ensina quais permissões cada operação realmente requer.
 
### Como aplicar o menor privilégio na prática
 
#### 1. Comece pelo que a identidade precisa fazer
 
Antes de escrever uma policy, responda:
- Qual serviço ela acessa?
- Quais operações ela realiza? (ler? escrever? criar? deletar?)
- Em quais recursos específicos? (todos os buckets? um bucket específico? todas as instâncias? apenas as de staging?)
#### 2. Use o IAM Access Analyzer
 
O **IAM Access Analyzer** (abordado com mais profundidade no futuro) analisa logs do CloudTrail e sugere políticas baseadas no que uma identidade **realmente usou** em um período. Se uma role tem `ec2:*` mas o CloudTrail mostra que ela só executou `ec2:DescribeInstances` nos últimos 90 dias, o Access Analyzer sugere uma política mínima com apenas essa ação.
 
#### 3. Use o IAM Policy Simulator
 
O **IAM Policy Simulator** (em `https://policysim.aws.amazon.com`) permite testar se uma policy concede ou nega permissões específicas, sem precisar executar a ação real. Essencial para validar políticas antes de aplicá-las.
 
#### 4. Prefira Customer Managed Policies granulares
 
Em vez de `AmazonS3FullAccess`, crie uma policy que permite apenas `s3:GetObject` e `s3:PutObject` no bucket específico que a aplicação usa. Em vez de `AmazonEC2FullAccess`, permita apenas as ações que o sistema realmente precisa executar.
 
#### 5. Revise permissões periodicamente
 
Pessoas mudam de função, projetos acabam, serviços são descontinuados. Um usuário que precisava de acesso ao RDS de produção seis meses atrás pode não precisar mais. Revisões regulares de permissões (trimestrais, por exemplo) identificam e removem acessos obsoletos.
 
#### 6. Use condições para restringir ainda mais
 
Mesmo quando uma ação é necessária, condições podem adicionar restrições:
 
- Exigir MFA para ações destrutivas (`ec2:TerminateInstances`, `rds:DeleteDBCluster`).
- Restringir a uma região específica para evitar criação acidental de recursos em regiões erradas.
- Restringir por tag para que usuários só operem recursos de seus próprios projetos.
### Exemplo: do amplo ao mínimo
 
**Situação:** uma aplicação web precisa armazenar e recuperar avatares de usuários no S3.
 
**Permissão excessiva (ruim):**
```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```
Isso permite ler, escrever, deletar, listar e gerenciar *qualquer* bucket na conta inteira.
 
**Permissão mínima (correta):**
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject"
  ],
  "Resource": "arn:aws:s3:::meu-app-avatares/*"
}
```
Apenas upload e download de objetos, apenas naquele bucket específico. A aplicação não pode listar outros buckets, não pode deletar nada, não pode acessar nenhum outro bucket.
 
---
 
## 6. MFA: O que é e Como Ativar
 
### O que é autenticação multifator
 
**MFA** (Multi-Factor Authentication — Autenticação Multifator) é um mecanismo de segurança que exige **dois ou mais fatores de verificação** para confirmar a identidade de um usuário. Os fatores se dividem em categorias:
 
- **Algo que você sabe:** senha, PIN.
- **Algo que você tem:** um dispositivo físico, um aplicativo no celular.
- **Algo que você é:** biometria (impressão digital, reconhecimento facial).
No modelo tradicional de autenticação, apenas a senha protege o acesso. Se a senha vazar — por phishing, reutilização de senha, ou exposição em breach de dados — o atacante tem acesso completo. Com MFA, mesmo que a senha seja conhecida pelo atacante, ele ainda precisa do segundo fator (geralmente um código de 6 dígitos que muda a cada 30 segundos no celular do usuário). Sem o dispositivo físico, o acesso é impossível.
 
### Tipos de MFA suportados pelo IAM
 
O IAM suporta quatro tipos de dispositivos MFA:
 
#### Virtual MFA Device (TOTP)
 
O mais comum e conveniente. Um aplicativo no smartphone gera códigos **TOTP** (Time-based One-Time Password) de 6 dígitos que mudam a cada 30 segundos, baseados em um algoritmo padronizado (RFC 6238).
 
**Aplicativos compatíveis:**
- Google Authenticator (iOS e Android)
- Authy (iOS e Android — suporta backup em nuvem)
- Microsoft Authenticator
- 1Password, Bitwarden (gerenciadores de senha com suporte a TOTP)
O setup é feito via QR code: a AWS exibe um QR code que você escaneia com o aplicativo, e a partir daí o aplicativo e a AWS compartilham um segredo que permite gerar os mesmos códigos sincronizados.
 
**Vantagem:** gratuito, conveniente, sem hardware adicional.  
**Desvantagem:** se você perder o celular sem backup, pode perder acesso à conta.
 
#### Hardware TOTP Token
 
Um dispositivo físico dedicado (como os tokens da Gemalto/Thales) que gera códigos TOTP. Funcionam como o Virtual MFA mas em hardware dedicado, sem depender de um smartphone.
 
**Vantagem:** não depende de um smartphone; mais resistente a ataques de SIM swapping.  
**Desvantagem:** tem custo, precisa ser adquirido separadamente.
 
#### FIDO2 Security Key (WebAuthn)
 
Chaves de segurança físicas como YubiKey, Google Titan, ou qualquer dispositivo FIDO2. São dispositivos USB (ou NFC) que você conecta ao computador e toca para autenticar. São consideradas o método mais seguro disponível — imunes a phishing porque a autenticação é vinculada ao domínio do site.
 
**Vantagem:** mais seguro que TOTP (imune a phishing de TOTP); não requer digitar código.  
**Desvantagem:** tem custo; precisa do dispositivo físico em mãos para fazer login.
 
#### Passkey (FIDO2 em dispositivo pessoal)
 
A AWS também suporta passkeys armazenadas em dispositivos pessoais (Touch ID no Mac, Windows Hello, Face ID no iPhone) como segundo fator via WebAuthn. Conveniente para login no console sem hardware adicional.
 
### Como ativar MFA para o Root User
 
O MFA no Root User é a proteção mais crítica de toda a conta. Deve ser o **primeiro ato** após criar a conta.
 
1. Faça login no console com o Root User.
2. Clique no nome da conta no canto superior direito → **Security credentials**.
3. Na seção **Multi-factor authentication (MFA)**, clique em **Assign MFA device**.
4. Escolha o tipo de dispositivo (recomendado: **Authenticator app** para Virtual MFA).
5. Dê um nome ao dispositivo (ex: "meu-iphone-authy").
6. Escaneie o QR code com o aplicativo autenticador.
7. Digite dois códigos consecutivos (o código atual e o próximo) para confirmar o emparelhamento.
8. Clique em **Add MFA**.
A partir desse momento, qualquer login com o Root User exigirá o código MFA além da senha.
 
> **Backup crítico:** anote o código secreto (o QR code tem um código textual equivalente) e guarde em local seguro separado do dispositivo. Se o dispositivo for perdido, este código permite reconfigurar o MFA. Sem ele, o processo de recuperação é burocrático e pode levar dias.
 
### Como ativar MFA para usuários IAM
 
Para cada usuário IAM que acessa o console, o MFA deve ser ativado:
 
**Via console (pelo próprio usuário):**
 
1. Faça login como o usuário IAM.
2. Clique no nome do usuário no canto superior direito → **Security credentials**.
3. Na seção **Multi-factor authentication (MFA)**, clique em **Assign MFA device**.
4. Siga o mesmo processo do Root User.
**Via console (por um administrador, para outro usuário):**
 
1. Vá em **IAM → Users → [nome do usuário] → Security credentials**.
2. Na seção MFA, clique em **Assign MFA device**.
**Via CLI:**
 
```bash
# Listar dispositivos MFA de um usuário
aws iam list-mfa-devices --user-name franklin
 
# Criar um dispositivo MFA virtual (retorna o QR code e o código secreto)
aws iam create-virtual-mfa-device \
  --virtual-mfa-device-name franklin-mfa \
  --outfile /tmp/qrcode.png \
  --bootstrap-method QRCodePNG
 
# Associar o dispositivo ao usuário (após escanear o QR code)
aws iam enable-mfa-device \
  --user-name franklin \
  --serial-number arn:aws:iam::123456789012:mfa/franklin-mfa \
  --authentication-code1 123456 \
  --authentication-code2 789012
```
 
### Forçar MFA via policy
 
Ativar MFA é uma coisa. Garantir que os usuários **precisem** ter MFA para usar a conta é outra. Uma prática avançada é criar uma policy que nega o acesso a qualquer serviço se o usuário não tiver autenticado com MFA.
 
**Exemplo de policy "Forçar MFA":**
 
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermitirGerenciarProprioMFA",
      "Effect": "Allow",
      "Action": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ListVirtualMFADevices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NegaTudoSemMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ListVirtualMFADevices",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
```
 
Esta policy:
1. Permite ao usuário configurar seu próprio MFA (necessário se ele ainda não tiver um).
2. Nega **tudo o mais** se o usuário não estiver autenticado com MFA.
Aplicada ao grupo de todos os usuários, garante que nenhum acesso aconteça sem MFA ativo — mesmo que o usuário tenha outras permissões amplas.
 
### MFA e Access Keys: uma distinção importante
 
MFA protege o **login no console web**. Ao fazer login, o console exige a senha + o código MFA.
 
**Access Keys (credenciais programáticas para CLI/SDK) não são protegidas por MFA por padrão.** Quem tem uma Access Key pode usá-la na CLI sem nenhum segundo fator.
 
Para exigir MFA também em chamadas programáticas, você pode:
 
1. Usar a policy `NegaTudoSemMFA` com a condição `aws:MultiFactorAuthPresent: false` — isso faz com que a CLI também precise de credenciais com MFA ativo.
2. Usar `aws sts get-session-token --serial-number <arn-mfa> --token-code <codigo>` para obter credenciais temporárias com MFA, e usar essas credenciais na CLI.
Este fluxo avançado com STS será detalhado no futuro.
 
---

## Fontes e Leitura Complementar
 
### Documentação Oficial AWS
 
- AWS. *What is IAM?* AWS Identity and Access Management User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
- AWS. *IAM users.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html
- AWS. *IAM user groups.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html
- AWS. *Policies and permissions in IAM.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
- AWS. *IAM JSON policy elements reference.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html
- AWS. *Managed policies and inline policies.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html
- AWS. *Security best practices in IAM.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- AWS. *Using multi-factor authentication (MFA) in AWS.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html
- AWS. *Enabling MFA devices for users in AWS.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable.html
- AWS. *What is IAM Identity Center?* AWS IAM Identity Center User Guide. Disponível em: https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html
- AWS. *Security best practices: Use IAM Identity Center for human access.* AWS IAM User Guide. Disponível em: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#bp-users-federation-idp
