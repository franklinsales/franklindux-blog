## Introdução

Agora é hora de aprender a linguagem da AWS — os conceitos que aparecem em absolutamente todos os serviços, documentações e erros que você vai encontrar.

Esse artigo cobre seis pilares conceituais: o que são recursos e como a AWS os identifica (ARNs e tags), quem é responsável pelo quê (Shared Responsibility Model), como a AWS cobra pelo que você usa, o que realmente é gratuito no Free Tier, e como operar a AWS pela linha de comando em vez do console web. São conceitos que parecem simples mas que, se mal entendidos, geram confusão, custos inesperados e vulnerabilidades de segurança.

## 1. Recursos na AWS, ARN e Tags

### O que é um recurso na AWS?
Na AWS, recurso (resource) é qualquer entidade que você cria, configura ou gerencia dentro da plataforma. Uma instância EC2 é um recurso. Um bucket S3 é um recurso. Um usuário IAM é um recurso. Uma VPC, uma subnet, um grupo de segurança, um banco de dados RDS - todos são recursos.

Recursos têm algumas características em comum:
- Pertencem a uma conta AWS e, na maioria dos casos, a uma região específica.
- Podem ser criados, modificados e deletados via console, CLI, SDK ou Infrastructure as Code (IaC), como CloudFormation ou Terraform.
- Têm um identificador único - o ARN.
- Podem receber tags - pares de chave-valor para organização, gerenciamento e rastreamento.
- Geram custos (ou não, dependendo do tipo de recurso e do uso).

### O que é um ARN?
ARN (Amazon Resource Name) é o identificador único e global de qualquer recurso na AWS. Não existe dois recursos no mundo com o mesmo ARN. É o "CPF" do recurso. O ARN é composto por várias partes, que indicam o tipo de recurso, a região, a conta e o nome ou ID do recurso.
A estrutura geral de um ARN é:

```
arn:partition:service:region:account-id:resource-type/resource-id
```
 
Cada campo tem um significado:
 
| Campo | Descrição | Exemplo |
|---|---|---|
| `arn` | Prefixo fixo — indica que é um ARN | `arn` |
| `partition` | Partição da AWS | `aws` (padrão), `aws-cn` (China), `aws-us-gov` (GovCloud) |
| `service` | Serviço AWS | `ec2`, `iam`, `s3`, `rds` |
| `region` | Região onde o recurso existe | `sa-east-1`, `us-east-1` |
| `account-id` | ID numérico da sua conta AWS (12 dígitos) | `123456789012` |
| `resource-type` | Tipo do recurso dentro do serviço | `instance`, `user`, `role` |
| `resource-id` | Identificador único do recurso | `i-0abc123def456`, `meu-usuario` |
 
**Exemplos reais:**
 
```
# Instância EC2
arn:aws:ec2:sa-east-1:123456789012:instance/i-0abc123def456
 
# Usuário IAM (IAM é global — sem região)
arn:aws:iam::123456789012:user/franklin
 
# Role IAM
arn:aws:iam::123456789012:role/minha-role-beanstalk
 
# Bucket S3 (S3 é global — sem região e sem account-id no ARN base)
arn:aws:s3:::meu-bucket
 
# Cluster RDS Aurora
arn:aws:rds:sa-east-1:123456789012:cluster:meu-cluster-aurora
 
# Tabela DynamoDB
arn:aws:dynamodb:us-east-1:123456789012:table/minha-tabela
```

Note que serviços globais como IAM omitem o campo de região (deixam em branco), e S3 omite tanto a região quanto o account-id no formato básico.

### Onde o ARN aparece?
O ARN é usado em muitos contextos na AWS:
- **Policies IAM:** quando você escreve uma política de permissão, o campo `Resource` usa ARNs para especificar exatamente a quais recursos a permissão se aplica.
- **CloudFormation:** ao referenciar recursos em templates, você pode usar ARNs para garantir que está apontando para o recurso correto.
- **Logs e auditoria:** em logs do CloudTrail, eventos e outros serviços de monitoramento, os ARNs aparecem para identificar quais recursos foram afetados por uma ação.
- **APIs e SDKs:** ao usar APIs ou SDKs para criar, modificar ou consultar recursos, os ARNs são frequentemente usados para identificar os recursos de forma única.
- **CloudWatch**: ao configurar alarmes, métricas ou dashboards, os ARNs são usados para associar os recursos monitorados.
- **Cross-service references:** quando um recurso de um serviço interage com outro serviço, os ARNs são usados para identificar os recursos envolvidos. Por exemplo, uma função Lambda pode ter permissões para acessar um bucket S3 específico, e isso é definido usando o ARN do bucket.

**Exemplo prático em uma policy IAM:**
```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::meu-bucket/*"
}
```
Neste exemplo, a política permite a ação `s3:GetObject` em todos os objetos dentro do bucket `meu-bucket`, identificado pelo ARN `arn:aws:s3:::meu-bucket/*`. O wildcard `*` indica que a permissão se aplica a todos os objetos dentro do bucket.

### Como encontrar o ARN de um recurso?
Existem várias maneiras de encontrar o ARN de um recurso na AWS:
- **Console AWS:** ao visualizar um recurso no console, geralmente há uma seção de detalhes onde o ARN é exibido. Por exemplo, ao clicar em uma instância EC2, você verá o ARN na seção de detalhes.
- **AWS CLI:** usando comandos da AWS CLI, você pode listar recursos e incluir o ARN na saída. Por exemplo, para listar instâncias EC2 com seus ARNs:
```bash
aws ec2 describe-instances --region us-east-1 --query 'Reservations[*].Instances[*].{ARN:Arn,InstanceId:InstanceId}' --output table
```
- **AWS SDKs:** ao usar SDKs para programar interações com a AWS,você pode acessar o ARN dos recursos retornados pelas chamadas de API.
- **CloudFormation:** ao criar recursos via CloudFormation, você pode usar a função `!GetAtt` para obter o ARN de um recurso criado. Por exemplo:
```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: meu-bucket
Outputs:
  BucketARN:
    Value: !GetAtt MyBucket.Arn
    Description: ARN do bucket S3 criado
```
- **Documentação AWS:** a documentação oficial da AWS para cada serviço geralmente inclui exemplos de ARNs para os recursos daquele serviço, o que pode ajudar a entender a estrutura do ARN.

## Tags

### O que são tags?
Tags são pares de chave-valor que você associa a recursos AWS. São simples na forma, mas poderosas na função.

**Exemplo:**
 
```
Environment = production
Project     = app-legal
Team        = backend
CostCenter  = 1042
```

Tags parecem opicionais e tecnicamente são, mas na prática se tornam essenciais à medida que sua infraestrutura cresce. Elas servem para:

#### 1.Controle de custos (billing):
O AWS Cost Explorer permite filtrar e agrupar gastos por tags. Com uma tag `Project = app-legal`, você consegue ver exatamente quanto o projeto App Legal está consumindo em termos de recursos e custos, separado de outros projetos. Sem tags, você ve2 apenas um número total, sem saber quais recursos estão gerando mais custos.

#### 2.Organização e gerenciamento:
Em contas com centenas de recursos, tags permitem filtrar. No console EC2, você pode filtrar instâncias por `Environment = production` para ver apenas as de produção, ignorando as de desenvolvimento, staging ou outras. Isso facilita a navegação e a gestão dos recursos.

#### 3.Automação e operações:
Scripts e ferramentas de automação usam tags para identificar o que devem operar. Por exemplo, um script de desligamento automático pode ser configurado para desligar todas as instâncias com a tag `AutoStop = true` durante a noite, economizando custos sem afetar recursos críticos.

#### 4.Segurança e conformidade:
Policies IAM podem usar condições baseadas em tags. Por exemplo: "Este usuário só pode modificar recursos que tenha a tag `Team = backend`". Isso permite um controle de acesso granular sem precissar criar uma policy separada para cada recurso.

#### 5.Conformidade e auditoria:
Em empresas maiores, tags são frequentemente obrigatórias por política interna: todo recurso deve ter `Owner`, `CostCenter`, `Environment` e `Project` por exemplo. Ferramentas como AWS Config podem monitorar e alertar quando recursos são criados sem as tags obrigatórias, garantindo conformidade com as políticas de governança.

### Convenções de nomeclatura para tags
Não existe um padrão universal para as chaves e valores das tags, mas algumas convenções comuns incluem:
- `Environment`: production, staging, development, test
- `Project`: nome do projeto ou aplicação
- `Team`: nome da equipe responsável
- `Owner`: email ou nome do responsável pelo recurso
- `CostCenter`: código do centro de custo para fins de billing
- `ManagedBy`: indica se o recurso é gerenciado por uma ferramenta ou serviço específico (ex: Terraform, CloudFormation, Manual)

### Tags e faturamento

Para que as tags apareçam nos relatórios de custo, é necessário ativá-las explicitamente. No console:
1. Vá para a seção **Billing and Cost Management -> Cost Allocation Tags**.
2. Selecione as tags que deseja ativar para alocação de custos.
3. Clique em "Activate" para que essas tags sejam incluídas nos relatórios do Cost Explorer.

As tags levam até 24 horas para aparecer nos relatórios de custo e só mostram dados a apartir do momento da ativação.

---

## 2. Modelos de Responsabilidade Compartilhada (Shared Responsibility Model):

### O conceito
O **Modelo de Responsabilidade Compartilhada** (*Shared Responsibility Model*) é o framework que define quem é responsável por quê em termos de segurança na AWS. É um dos conceitos mais importantes da computação em numvem - e um dos mais mal compreendidos.

A premissa é simples: a AWS e o cliente compartilham responsabilidade de segurança, cada um em sua camada. A confusão surge quando clientes assumem que por estarem "na nuvem", a segurança é problema da AWS. Não é.

A AWS define assim:
- **AWS é responsável pela segurança *da* nuvem** (*Security of the Cloud*): a AWS é responsável por proteger a infraestrutura global que suporta os serviços de nuvem, incluindo hardware, software, redes e instalações. Isso inclui data centers, servidores físicos, armazenamento, rede e virtualização. A AWS garante que a infraestrutura subjacente seja segura, confiável e resiliente.
- **O cliente é responsável pela segurança *na* nuvem** (*Security in the Cloud*): o cliente é responsável por proteger os dados, aplicativos, sistemas operacionais, redes e configurações que ele cria e gerencia dentro da nuvem. Isso inclui a configuração correta dos serviços, controle de acesso, criptografia de dados, monitoramento e resposta a incidentes.


### A responsabilidade varia por modelo de serviço
 
A divisão de responsabilidade não é fixa — ela se desloca dependendo do modelo de serviço usado. Quanto mais gerenciado o serviço, mais responsabilidade a AWS absorve.
 
| Responsabilidade | EC2 (IaaS) | RDS (PaaS) | SaaS |
|---|---|---|---|
| Datacenter físico | AWS | AWS | AWS |
| Hypervisor | AWS | AWS | AWS |
| Sistema Operacional | **Cliente** | AWS | AWS |
| Patches do DB engine | **Cliente** | AWS | AWS |
| Configuração de rede | **Cliente** | **Compartilhada** | AWS |
| Dados | **Cliente** | **Cliente** | **Cliente** |
| IAM e acessos | **Cliente** | **Cliente** | **Cliente** |
| Configuração do serviço | **Cliente** | **Cliente** | Limitada |
 
**Exemplo concreto:**
 
- Em uma instância EC2 rodando PostgreSQL: você é responsável por instalar o PostgreSQL, aplicar patches de segurança do PostgreSQL, configurar autenticação, fazer backup, etc.
- No RDS Aurora (PostgreSQL gerenciado): a AWS aplica patches do engine automaticamente (dentro de janelas configuradas por você), garante backups automáticos, e gerencia o OS. Você é responsável por configurar quem acessa, como o banco está exposto na rede, e os dados em si.

### Por que esse modelo importa na prática
 
A maioria dos incidentes de segurança em ambientes cloud não é causada por falha da AWS — é causada por configuração incorreta do cliente. Exemplos reais e frequentes:
 
- Bucket S3 com dados sensíveis configurado como público por acidente.
- Security Group permitindo acesso SSH (porta 22) de qualquer IP do mundo (`0.0.0.0/0`).
- Credenciais AWS (access keys) commitadas acidentalmente em um repositório Git público.
- Usuário IAM com política `AdministratorAccess` usada para uma aplicação que só precisava ler um bucket S3.
- Instância EC2 com sistema operacional desatualizado e vulnerabilidade conhecida explorada.
Todos esses problemas são responsabilidade do cliente, não da AWS. A AWS disponibiliza as ferramentas para fazer certo (IAM, Security Groups, S3 Block Public Access, KMS), mas não pode forçar o cliente a usá-las corretamente.
 
> **Mentalidade correta:** sempre que configurar um serviço AWS, pergunte: "O que eu estou expondo? Quem pode acessar? Os dados estão protegidos?" A AWS garante que a infraestrutura está segura; você garante que sua *configuração* está segura.
 
---

### 3. Precificação: Como a AWS Cobra?

A AWS não tem um modelo de preço único — cada serviço tem sua própria estrutura de cobrança. Entender os padrões ajuda a evitar surpresas e a tomar decisões arquiteturais mais conscientes.

### Os três modelos fundamentais de cobrança
 
#### Por hora ou por segundo
 
Muitos serviços de computação cobram por tempo de uso:
 
- **EC2:** cobra por hora ou por segundo (para instâncias Linux, mínimo de 60 segundos). Uma instância `t3.micro` em `us-east-1` custa aproximadamente $0.0104/hora. Se ela rodar 24h por 30 dias = ~$7.50/mês.
- **RDS:** cobra por hora de instância de banco de dados. Uma instância `db.t3.micro` em `us-east-1` custa ~$0.017/hora.
- **NAT Gateway:** cobra por hora que está provisionado (~$0.045/hora em `us-east-1`), independente de tráfego.
> **Atenção:** uma instância EC2 *parada* (stopped) não cobra pelo tempo de computação, mas **continua cobrando** pelo volume EBS associado. Um NAT Gateway parado não existe — se você o deletar, para de cobrar; se ele existe, cobra.
 
#### Por volume de dados (por GB)
 
Armazenamento e transferência de dados geralmente cobram por gigabyte:
 
- **EBS:** armazenamento em bloco para EC2. Volume `gp3` custa ~$0.08/GB-mês em `us-east-1`. Um disco de 100GB = ~$8/mês, independente de quantos dados você gravou.
- **S3:** armazenamento de objetos. ~$0.023/GB-mês para Standard em `us-east-1`.
- **RDS Storage:** ~$0.115/GB-mês para armazenamento gp2 em Aurora.
- **Data Transfer Out (saída de dados):** a AWS cobra por dados que *saem* da AWS para a internet. Os primeiros 100GB/mês são gratuitos, depois ~$0.09/GB. **Dados que entram na AWS (inbound) são gratuitos.**
- **Data Transfer entre regiões:** transferência de dados entre regiões diferentes cobre ambos os lados (~$0.02/GB por região).
- **Data Transfer entre AZs:** transferência entre AZs dentro da mesma região cobre ~$0.01/GB por lado. Dados dentro da mesma AZ são gratuitos.

#### Por requisição ou operação
 
Alguns serviços cobram pela quantidade de chamadas ou operações:
 
- **S3 API calls:** PUT, GET, DELETE têm preços por milhares de requisições (~$0.005 por 1.000 PUT requests).
- **Lambda:** cobra por número de invocações e por GB-segundo de execução.
- **API Gateway:** cobra por milhão de requisições recebidas.
- **CloudWatch Logs:** cobra por GB de dados ingeridos e armazenados.

### O custo invisível: transferência de dados
 
A **transferência de dados** é frequentemente subestimada e pode ser a maior parte da conta em algumas arquiteturas. Os padrões mais importantes:
 
| Tipo de transferência | Custo |
|---|---|
| Entrada de dados na AWS (inbound) | **Gratuito** |
| Saída para a internet (primeiros 100GB/mês) | **Gratuito** |
| Saída para a internet (acima de 100GB) | ~$0.09/GB |
| Entre serviços na mesma AZ | **Gratuito** |
| Entre AZs na mesma região | ~$0.01/GB por lado |
| Entre regiões diferentes | ~$0.02/GB por lado |
| EC2 para S3 na mesma região (via internet pública) | ~$0.09/GB saída |
| EC2 para S3 via VPC Endpoint | **Gratuito** |
 
> **Lição importante:** arquitetura importa para o custo. Dois serviços comunicando na mesma AZ pagam zero de transferência. Os mesmos dois serviços em AZs diferentes pagam por cada GB. Um VPC Endpoint para S3 elimina o custo de transferência que existiria se o tráfego fosse pela internet pública.

### Como consultar preços
 
- **AWS Pricing Calculator** (`calculator.aws`): estima o custo mensal de uma arquitetura antes de criá-la. Essencial antes de tomar decisões de infraestrutura.
- **AWS Cost Explorer:** analisa o custo histórico da conta, por serviço, por região, por tag.
- **Página de preços de cada serviço:** cada serviço tem uma página dedicada (ex: `aws.amazon.com/ec2/pricing`). São a fonte mais atualizada.


### Modelos de compra para EC2 (visão geral)
 
EC2 oferece diferentes modelos de compra com grandes variações de preço.
 
- **On-Demand:** paga por hora/segundo sem compromisso. Mais caro, mais flexível.
- **Reserved Instances / Savings Plans:** compromisso de 1 ou 3 anos com desconto de até 72%.
- **Spot Instances:** usa capacidade ociosa da AWS com desconto de até 90%, mas pode ser interrompido com 2 minutos de aviso.

### Boas práticas para controle de custos
 
1. **Configure Budget Alerts**: receba alertas antes de ser surpreendido.
2. **Use o AWS Cost Explorer**: regularmente para identificar o que está custando mais.
3. **Delete recursos que não usa**: instâncias paradas, volumes EBS órfãos, NAT Gateways sem uso, Elastic IPs não associados — todos geram custo.
4. **Use tags de custo**: para separar gastos por projeto.
5. **Prefira a mesma AZ**: para serviços que se comunicam frequentemente, quando alta disponibilidade não é requisito (ambientes de desenvolvimento, por exemplo).

---

## 4. AWS Free Tier: O que é Gratuito e O que Não é
 
O **AWS Free Tier** existe para que desenvolvedores e estudantes possam experimentar serviços sem custo. Mas tem regras e armadilhas que precisam ser entendidas antes de sair criando recursos.

> **Importante:** Esse texto foi escrito em 23 de maio de 2026. Esses limites e serviços gratuitos podem mudar a qualquer momento. Sempre consulte a página oficial do AWS Free Tier para informações atualizadas.
 
### Os três tipos de oferta gratuita
 
O Free Tier não é um bloco único — ele tem três categorias distintas:
 
#### 1. Always Free (sempre gratuito)
 
Estes limites não expiram e valem indefinidamente, independente de quando você criou a conta:
 
| Serviço | Limite gratuito permanente |
|---|---|
| AWS Lambda | 1 milhão de invocações/mês |
| DynamoDB | 25 GB de armazenamento |
| CloudFront | 1 TB de transferência de dados/mês |
| IAM | Ilimitado — IAM nunca cobra |
| VPC | Criação de VPC, subnets, route tables — sem custo |
| CloudWatch | 10 métricas customizadas, 10 alarmes, 1M API requests |
| SNS | 1 milhão de publicações/mês |
| SES | 62.000 emails enviados/mês |
 
#### 2. 12 Months Free (gratuito por 12 meses)
 
A partir da data de criação da conta, você tem 12 meses de uso gratuito dentro dos limites abaixo:
 
| Serviço | Limite gratuito (12 meses) |
|---|---|
| EC2 | 750 horas/mês — instância `t2.micro` ou `t3.micro` |
| RDS | 750 horas/mês — instância `db.t2.micro` ou `db.t3.micro`, 20 GB storage |
| EBS | 30 GB de SSD (gp2 ou gp3) |
| S3 | 5 GB Standard, 20.000 GET requests, 2.000 PUT requests |
| Data Transfer | 100 GB de saída para internet/mês |
| Elastic Load Balancer | 750 horas/mês de Classic Load Balancer |
| ElastiCache | 750 horas/mês — instância `cache.t2.micro` |
| CloudFront | 50 GB de transferência, 2 milhões de requisições/mês |
 
#### 3. Trials (períodos de teste)
 
Alguns serviços oferecem um período de teste independente da data de criação da conta:
 
| Serviço | Período de teste |
|---|---|
| Amazon SageMaker | 2 meses |
| Amazon Redshift | 2 meses (750 horas/mês) |
| Amazon QuickSight | 1 mês |
| Amazon Inspector | 90 dias |
 
  
### O que NÃO está no Free Tier (armadilhas comuns)
 
Esta é a parte mais importante para evitar cobranças inesperadas:
 
**NAT Gateway:** não tem Free Tier. Custa ~$0.045/hora + $0.045/GB processado. Se você criar um NAT Gateway para praticar e esquecer de deletar, pagará ~$32/mês só por ele existir.
 
**Elastic IP (EIP):** um EIP associado a uma instância rodando é gratuito. Um EIP *não associado* ou associado a uma instância *parada* custa ~$0.005/hora (~$3.60/mês). A AWS cobra para desincentivar o desperdício de IPs públicos.
 
**Transferência de dados entre AZs:** mesmo no Free Tier, transferência entre AZs é cobrada. Cuidado com arquiteturas que trafegam muitos dados entre zonas.
 
**Data Transfer acima dos 100GB/mês:** o Free Tier inclui 100GB de saída. Ultrapassar isso gera custo.
 
**Instâncias além do tipo micro:** o Free Tier cobre apenas `t2.micro` ou `t3.micro`. Se você subir uma `t3.small` ou qualquer outro tipo, começa a pagar imediatamente.
 
**Mais de uma instância EC2 simultânea:** o limite é 750 horas/mês de *uma* instância micro rodando 24h (720h/mês). Se você tiver *duas* instâncias micro rodando ao mesmo tempo, consome 1.440 horas/mês — o dobro do limite.
 
**RDS Multi-AZ:** o Free Tier cobre instâncias Single-AZ. Habilitar Multi-AZ dobra o custo da instância.
 
**Elastic Beanstalk:** o Beanstalk em si não cobra, mas os recursos que ele cria (EC2, ALB, EBS) cobram. Um ambiente Beanstalk com Application Load Balancer consome o Free Tier do EC2 mas cobra pelo ALB (~$0.008/hora).
 
**Serviços não listados no Free Tier:** se um serviço não aparece na lista do Free Tier, qualquer uso gera cobrança.
 
### Como monitorar o uso do Free Tier
 
No console da AWS:
 
1. Vá em **Billing and Cost Management → Free Tier**
2. Você verá uma tabela com todos os serviços elegíveis, o limite mensal e quanto você já consumiu no mês atual
3. A AWS também envia alertas automáticos por e-mail quando você atinge 85% de um limite do Free Tier — ative isso em Billing Preferences

---

## 5. AWS CLI: Instalar e Configurar
 
A **AWS CLI** (Command Line Interface) é a ferramenta de linha de comando oficial da AWS. Ela permite realizar qualquer operação disponível no console web — e muitas que o console não expõe — diretamente do terminal.
 
### Por que usar a CLI em vez do console
 
O console web é intuitivo para exploração e tarefas pontuais, mas a CLI é superior em vários cenários:
 
- **Automação:** scripts Bash ou Python que criam, modificam ou destroem recursos programaticamente.
- **Repetibilidade:** o mesmo comando executado 10 vezes produz o mesmo resultado. Cliques no console são propensos a erro humano.
- **Velocidade:** para usuários experientes, a CLI é muito mais rápida que navegar pelo console.
- **Scripting e CI/CD:** pipelines de integração contínua usam a CLI para deploy, validação de infraestrutura e notificações.
- **Acesso a funcionalidades avançadas:** alguns parâmetros e opções avançadas de serviços não estão expostos no console — só via CLI ou SDK.
### Instalação
 
A AWS CLI v2 é a versão atual e recomendada. A v1 está em modo de manutenção.
 
#### Linux (Ubuntu/Debian)
 
```bash
# Download do pacote de instalação
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
 
# Descompactar
unzip awscliv2.zip
 
# Instalar
sudo ./aws/install
 
# Verificar a instalação
aws --version
# Saída esperada: aws-cli/2.x.x Python/3.x.x Linux/...
```
 
#### macOS
 
```bash
# Via Homebrew (recomendado)
brew install awscli
 
# Verificar
aws --version
```
 
Alternativamente, baixe o instalador `.pkg` em `https://aws.amazon.com/cli/`.
 
#### Windows
 
Baixe e execute o instalador MSI disponível em `https://aws.amazon.com/cli/`. Após a instalação, a CLI estará disponível no PowerShell e no Prompt de Comando.
 
### Configuração com `aws configure`
 
Antes de usar a CLI, você precisa autenticá-la com credenciais de acesso. A forma mais simples é o comando `aws configure`:
 
```bash
aws configure
```
 
O comando solicita quatro informações:
 
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: sa-east-1
Default output format [None]: json
```
 
#### O que são Access Keys
 
Access Keys são credenciais programáticas para a AWS. Diferente do login do console (e-mail + senha), as Access Keys identificam quem está fazendo chamadas via CLI ou SDK. Elas têm dois componentes:
 
- **Access Key ID:** identificador público, começa com `AKIA` (ex: `AKIAIOSFODNN7EXAMPLE`)
- **Secret Access Key:** chave secreta, mostrada apenas uma vez no momento da criação
> ⚠️ **Segurança crítica:** nunca compartilhe ou exponha sua Secret Access Key. Nunca a inclua em código que vai para um repositório Git — mesmo privado. Se uma Access Key vazar, ela deve ser invalidada imediatamente via IAM e uma nova deve ser gerada.
 
#### Como criar Access Keys para um usuário IAM
 
A criação de usuários IAM será detalhada na Semana 3, mas o processo básico é:
 
1. No console, vá para **IAM → Users → [nome do usuário] → Security credentials**
2. Em **Access keys**, clique em **Create access key**
3. Escolha o caso de uso (CLI)
4. Copie o Access Key ID e a Secret Access Key — a Secret Key só é exibida uma vez
5. Armazene em local seguro (gerenciador de senhas)
> **Nunca crie Access Keys para o Root User.** Use sempre um usuário IAM com as permissões necessárias.
 
### O arquivo de configuração gerado
 
O `aws configure` cria dois arquivos no diretório `~/.aws/`:
 
**`~/.aws/credentials`** — armazena as chaves de acesso:
```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```
 
**`~/.aws/config`** — armazena região e formato de saída:
```ini
[default]
region = sa-east-1
output = json
```
 
### Profiles: gerenciando múltiplas contas ou usuários
 
Se você trabalha com mais de uma conta AWS (por exemplo, uma conta pessoal de estudo e a conta do trabalho), pode configurar **profiles** separados:
 
```bash
# Configurar um profile chamado "trabalho"
aws configure --profile trabalho
 
# Usar um profile específico em um comando
aws s3 ls --profile trabalho
 
# Definir um profile padrão via variável de ambiente
export AWS_PROFILE=trabalho
```
 
### Formatos de saída da CLI
 
O parâmetro `--output` controla como os resultados são exibidos:
 
- **json** (padrão): saída estruturada em JSON. Ideal para scripts e processamento com `jq`.
- **text**: saída em texto tabular simples. Fácil de usar com `grep`, `awk`, `cut`.
- **table**: saída formatada em tabela ASCII. Mais legível para leitura humana.
- **yaml**: saída em YAML.
```bash
# Comparando formatos para o mesmo comando
aws ec2 describe-regions --output json
aws ec2 describe-regions --output table
aws ec2 describe-regions --output text
```
 
### Filtragem e consulta com `--query`
 
A CLI suporta o parâmetro `--query` com sintaxe **JMESPath** para filtrar e transformar a saída JSON antes de exibi-la:
 
```bash
# Listar apenas os nomes das regiões, sem o resto do JSON
aws ec2 describe-regions --query "Regions[*].RegionName" --output text
 
# Listar instâncias EC2 mostrando apenas ID e estado
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name]" \
  --output table
```
 
### Variáveis de ambiente como alternativa ao configure
 
Além do `aws configure`, você pode autenticar a CLI via variáveis de ambiente — útil em pipelines de CI/CD ou containers:
 
```bash
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_DEFAULT_REGION="sa-east-1"
```
 
Variáveis de ambiente têm prioridade sobre o arquivo `~/.aws/credentials`.
 
---
 
## 6. Introdução ao AWS CloudShell
 
O **AWS CloudShell** é um terminal Linux disponível diretamente no console da AWS, sem necessidade de instalação ou configuração. É a forma mais rápida de ter acesso a uma CLI funcional.
 
### O que é e como acessar
 
Para abrir o CloudShell:
 
- Clique no ícone de terminal na barra superior do console AWS (ao lado da barra de busca)
- Ou busque por "CloudShell" na barra de pesquisa do console
Uma janela de terminal Linux abre dentro do próprio browser.
 
### Características do CloudShell
 
- **Pré-autenticado:** o CloudShell automaticamente usa as credenciais da sessão atual do console. Não é necessário rodar `aws configure` — a CLI já funciona com as permissões do usuário logado.
- **AWS CLI pré-instalada:** a versão mais recente da AWS CLI está disponível imediatamente.
- **Ferramentas adicionais incluídas:** Python, Node.js, git, jq, bash, vim, pip, npm.
- **1 GB de storage persistente por região:** arquivos no diretório home (`~`) são preservados entre sessões. Sessões inativas por mais de 20 minutos são encerradas, mas os arquivos permanecem.
- **Gratuito:** não há custo para usar o CloudShell — ele não consome EC2 ou outros recursos cobráveis.
- **Isolamento por região:** cada região tem seu próprio ambiente CloudShell com storage separado.
### Limitações do CloudShell
 
- **Acesso à internet limitado:** o CloudShell pode acessar serviços AWS e a internet pública, mas não recursos dentro de VPCs privadas (sem acesso a instâncias ou bancos em subnets privadas).
- **Não substitui um ambiente local completo:** para desenvolvimento sério, a CLI local é mais adequada.
- **Sessão expira:** sessões inativas são encerradas. Processos longos podem ser interrompidos.
### Quando usar CloudShell vs. CLI local
 
| Situação | Recomendação |
|---|---|
| Teste rápido de um comando | CloudShell |
| Exploração de APIs e serviços | CloudShell |
| Automação e scripts regulares | CLI local |
| CI/CD pipelines | CLI local (ou IAM Role no serviço de CI) |
| Ambientes sem instalação da CLI | CloudShell |
| Trabalho com arquivos locais | CLI local |
 
---
 
## 7. Prática: Seus Primeiros Comandos
 
Com a CLI instalada e configurada (ou via CloudShell), é hora de rodar os primeiros comandos. Estes três são fundamentais para verificar que tudo está funcionando e explorar a infraestrutura disponível.
 
### Verificar identidade: `aws sts get-caller-identity`
 
Este é o "Olá, mundo" da AWS CLI. Ele pergunta para a AWS: "Quem são eu, sob a perspectiva desta credencial?"
 
```bash
aws sts get-caller-identity
```
 
**Saída esperada:**
 
```json
{
    "UserId": "AIDAIOSFODNN7EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/franklin"
}
```
 
**O que cada campo significa:**
 
- **UserId:** identificador único do usuário ou role (diferente do Access Key ID).
- **Account:** o ID de 12 dígitos da sua conta AWS. Útil para confirmar que você está operando na conta certa — crítico quando se tem múltiplas contas.
- **Arn:** o ARN completo da identidade sendo usada. Confirma qual usuário IAM ou role está autenticado.
**Por que esse comando é útil na prática:**
 
- Confirmar que as credenciais estão configuradas corretamente.
- Verificar em qual conta você está antes de executar comandos destrutivos.
- Debugging: confirmar qual identidade está sendo usada quando uma operação é negada por falta de permissão.
- Em scripts de automação, verificar a identidade antes de prosseguir.
Se as credenciais estiverem inválidas ou não configuradas, você receberá um erro de autenticação ao invés da saída acima.
 
### Listar regiões disponíveis: `aws ec2 describe-regions`
 
Este comando lista todas as regiões AWS disponíveis para sua conta:
 
```bash
aws ec2 describe-regions
```
 
**Saída (resumida):**
 
```json
{
    "Regions": [
        {
            "Endpoint": "ec2.sa-east-1.amazonaws.com",
            "RegionName": "sa-east-1",
            "OptInStatus": "opt-in-not-required"
        },
        {
            "Endpoint": "ec2.us-east-1.amazonaws.com",
            "RegionName": "us-east-1",
            "OptInStatus": "opt-in-not-required"
        }
        ...
    ]
}
```
 
**Variações úteis:**
 
```bash
# Listar apenas os nomes das regiões em formato de lista simples
aws ec2 describe-regions \
  --query "Regions[*].RegionName" \
  --output text
 
# Saída em tabela, mais legível
aws ec2 describe-regions --output table
 
# Incluir regiões que exigem opt-in (desabilitadas por padrão)
aws ec2 describe-regions --all-regions --output table
```
 
**O campo `OptInStatus`** indica se a região está habilitada por padrão:
 
- `opt-in-not-required`: região habilitada para todas as contas automaticamente (regiões clássicas como `us-east-1`, `sa-east-1`).
- `opted-in`: região que você habilitou manualmente (ex: `ap-east-1` — Hong Kong).
- `not-opted-in`: região disponível mas não habilitada na sua conta.
### Comandos adicionais para explorar
 
Após os dois comandos acima, experimente:
 
```bash
# Listar zonas de disponibilidade da sua região padrão
aws ec2 describe-availability-zones \
  --query "AvailabilityZones[*].{Name:ZoneName,State:State}" \
  --output table
 
# Verificar quais serviços estão disponíveis em uma região específica
aws ssm get-parameters-by-path \
  --path /aws/service/global-infrastructure/regions/sa-east-1/services \
  --query "Parameters[*].Name" \
  --output text 2>/dev/null | tr '\t' '\n' | sort
 
# Ver sua região padrão configurada
aws configure get region
 
# Sobrescrever a região padrão em um comando específico
aws ec2 describe-availability-zones --region us-east-1
```
 
### Estrutura geral dos comandos AWS CLI
 
Todos os comandos seguem o mesmo padrão:
 
```
aws <serviço> <operação> [parâmetros]
```
 
- `aws ec2 describe-instances` — lista instâncias EC2
- `aws s3 ls` — lista buckets S3
- `aws rds describe-db-clusters` — lista clusters RDS
- `aws iam list-users` — lista usuários IAM
Para descobrir os comandos disponíveis de um serviço:
 
```bash
# Ver todos os comandos do serviço EC2
aws ec2 help
 
# Ver a documentação de um comando específico
aws ec2 describe-instances help
```
 
---
 
## Resumo da Semana 2
 
| Conceito | O que você precisa saber |
|---|---|
| Resource | Qualquer entidade criada na AWS (instância, banco, usuário, rede) |
| ARN | Identificador único global de qualquer recurso AWS |
| Tags | Pares chave-valor para organização, custo e automação |
| Shared Responsibility | AWS protege a infraestrutura; você protege sua configuração e dados |
| Precificação | Por hora/segundo (computação), por GB (storage/tráfego), por requisição |
| Free Tier | 3 tipos: Always Free, 12 Months Free, Trials — cada um com seus limites |
| AWS CLI | Ferramenta de linha de comando para operar a AWS via terminal |
| `aws configure` | Configura credenciais, região e formato de saída padrão |
| CloudShell | Terminal no browser, pré-autenticado, sem instalação necessária |
| `sts get-caller-identity` | Verifica qual identidade está sendo usada pela CLI |
| `ec2 describe-regions` | Lista regiões disponíveis na conta |
 
---