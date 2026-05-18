# O que é Cloud e AWS?

## Introdução

Antes de aprender serviços como EC2, RDS ou IAM, é essencial entender a base da computação em nuvem. Sem isso, AWS vira apenas um painel cheio de botões.

Cloud computing mudou a forma como empresas constroem software: em vez de comprar servidores físicos, configurar datacenters e investir pesado em infraestrutura própria, agora é possível provisionar recursos sob demanda e pagar apenas pelo uso.

Nesta primeira parte, o objetivo é entender o que é cloud, como a AWS organiza sua infraestrutura, por que ela domina o mercado e quais cuidados de segurança são obrigatórios ao criar sua primeira conta.

---

### O que é Cloud Computing

Cloud computing é o uso de recursos de TI pela internet sob demanda.

Em vez de comprar On-Premises (infraestrutura própria interna) (**CAPEX**), você aluga infraestrutura e paga conforme consumo (**OPEX**).

Principais vantagens:

* Provisionamento em minutos
* Escalabilidade rápida
* Pagamento por uso
* Alta disponibilidade
* Menor investimento inicial

**Mentalidade correta:** cloud não é somente "um servidor em outro lugar", mas um modelo operacional de TI que oferece flexibilidade, agilidade e menor custo inicial.

---

### On-Premises vs Cloud

**On-premises:** a empresa compra, instala e mantém toda infraestrutura.

Responsabilidades incluem:

* Hardware
* Rede
* Segurança física
* Backup
* Escalabilidade
* Manutenção

**Cloud:** AWS assume infraestrutura física; você foca no que está acima.

Diferenças principais:

* On-prem = controle máximo, custo inicial alto
* Cloud = flexibilidade, elasticidade e custo variável

Cloud não substitui tudo: ambientes regulados, sistemas legados e workloads previsíveis ainda podem justificar on-prem.

---

### Modelos de serviço: IaaS, PaaS e SaaS

Cloud possui diferentes níveis de abstração:

* **IaaS (Infrastructure as a Service):** você gerencia sistema operacional e aplicação.
  Exemplo AWS: EC2, EBS, VPC.

* **PaaS (Platform as a Service):** você entrega código e a plataforma gerencia infraestrutura.
  Exemplo AWS: Elastic Beanstalk, RDS, Lambda.

* **SaaS (Software as a Service):** software pronto para uso.
  Exemplo: Gmail, Slack, Zoom. Que não são AWS, mas ilustram o conceito. A AWS tem serviços SaaS como WorkSpaces e QuickSight, mas o foco dessa série é em IaaS e PaaS.

**Regra prática:**
Entre mais baixo nível (IaaS) e mais alto nível (SaaS), há um trade-off:
* Mais controle = mais responsabilidade.
* Mais abstração = mais produtividade.

Mas nem sempre o mais alto nível é melhor. Depende do caso de uso, requisitos de controle e expertise da equipe.

---

### Por que AWS é líder

A AWS lidera cloud por 4 fatores:

* Entrou primeiro no mercado (2006)
* Maior portfólio de serviços
* Infraestrutura global massiva
* Ecossistema maduro (documentação, comunidade, parceiros)

Principais concorrentes:

* Microsoft Azure - Começou em 2010, forte em empresas que já usam Microsoft.
* Google Cloud - Começou em 2011, forte em dados e machine learning, mas vem ganhando espaço em enterprise.

Mesmo assim, a AWS segue como principal referência em cloud enterprise.

---

### Regiões e Availability Zones (AZs)

A infraestrutura AWS é organizada em:

* **Regiões:** áreas geográficas isoladas
  Ex.: `sa-east-1` (São Paulo), `us-east-1` (Virginia), `eu-west-1` (Irlanda) entre outras.

* **Availability Zones (AZs):** datacenters fisicamente separados dentro da mesma região. Cada AZ tem energia, refrigeração e rede independentes. Exemplo: `us-east-1a`, `us-east-1b`, `us-east-1c`.

Propósito de regiões: proximidade com usuários, requisitos regulatórios e resiliência geográfica.

Propósito de AZs: alta disponibilidade e tolerância a falhas. Se um datacenter falhar, os outros continuam operando.

**Boa prática:** sistemas críticos devem operar em múltiplas AZs. Exemplo: um banco de dados em `us-east-1a` e outro em `us-east-1b` para garantir que se um falhar, o outro continue funcionando.

---

### Root User: nunca use no dia a dia

Ao criar sua conta AWS, você recebe acesso ao **Root User**.

Esse usuário possui controle total:

* Encerrar conta
* Alterar billing
* Deletar tudo
* Ignorar permissões IAM

Por isso:

* Ative MFA imediatamente
* Não use Root no dia a dia
* Crie um usuário IAM administrativo (veremos isso na próxima parte)

**Root = chave mestra. Use apenas em emergências.**

---

### Como Criar uma conta AWS

1. Acesse [aws.amazon.com](https://aws.amazon.com/) e clique em "Create an AWS Account"
![Imagem do site da AWS com destaque para o botão "Create an AWS Account"](/posts/home-aws.jpg)

2. Você será redirecionado para a página de criação de conta. Preencha seu email, senha e nome da conta.
![Imagem do formulário de criação de conta AWS](/posts/aws-register.png)

3. Siga as etapas de verificação, após todo o processo, você terá acesso ao console AWS.
![Imagem do console AWS após criação de conta](/posts/aws-console.jpg)


### Como Criar um Billing Alarm para monitorar custos e evitar surpresas na fatura:

![Meme sobre faturas AWS](/posts/aws-meme-bill.jpeg)

Um dos maiores medos ao usar cloud é receber uma fatura exorbitante no final do mês. Muitos profissionais durante o processo de aprendizado acabam esquecendo de desligar recursos ou criam algo que consome mais do que o esperado, e isso pode gerar custos altos.

Para evitar isso, a AWS oferece a opção de criar alarmes de faturamento que notificam quando seus custos atingem um limite definido.

1. Na barra de busca, procure Billing and Cost Management.
![Imagem do console AWS com destaque para a barra de busca e o resultado "Billing and Cost Management"](/posts/aws-search-billing-and-cost-management.png)

2. No menu lateral, clique em Budgets.
![Imagem do menu lateral do console AWS com destaque para a opção "Budgets"](/posts/aws-menu-lateral-budget.png)

3. Clique em Create budget 
![Imagem do processo de criação de budget no console AWS](/posts/aws-create-budget.png)

4. Use a template (Usar um modelo) → Zero spend budget (alerta quando qualquer gasto for detectado) ou Monthly cost budget com $5 de limite.
![Imagem do formulário de criação de budget com destaque para a opção "Zero spend budget"](/posts/aws-configuration-form.png)

5. Adicione seu e-mail para notificação e finalize a criação do budget.
![Imagem do formulário de criação de budget com destaque para o campo de e-mail de notificação](/posts/aws-billing-allert-success.png)