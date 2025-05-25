### Projeto-convem ###

# Projeto Convem - Integração Pix com Asaas

Sistema de integração com a API de Pix do Asaas para processamento de depósitos (cash in) e saques (cash out) utilizando Node.js com TypeScript e serviços AWS.

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Banco de Dados**: AWS DynamoDB
- **Filas**: AWS SQS
- **Processamento**: AWS Lambda
- **API de Pagamentos**: Asaas

## 📁 Estrutura do Projeto
projeto-convem/
├── backend/              # API Node.js com TypeScript
│   ├── src/
│   │   ├── controllers/  # Controladores das rotas
│   │   ├── services/     # Serviços de negócio
│   │   ├── models/       # Modelos de dados
│   │   ├── routes/       # Definição de rotas
│   │   └── config/       # Configurações
├── frontend/             # Interface Next.js
├── scripts/              # Scripts de teste
└── aws/                  # Recursos e funções AWS
└── lambda/           # Funções Lambda
// ============================================================================= //
## 🛠️ Configuração

### 1. Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta AWS configurada
- Conta no Asaas (sandbox para testes)

// ============================================================================= //
### 2. Instalação

bash
# Clonar o repositório
git clone <url-do-repositorio>
cd projeto-convem

# Configurar backend
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais

# Configurar frontend
cd ../frontend
npm install

# Voltar ao diretório raiz
cd ..

//=============================================================================//
### 3. Configuração AWS
# Criar recursos AWS
./aws/create-resources.sh

# Implantar funções Lambda
./aws/deploy-lambdas.sh

// ============================================================================= //
### 4. Executar o projeto
# Terminal 1 - Backend
./run-backend.sh

# Terminal 2 - Frontend  
./run-frontend.sh

// ============================================================================= //
#### TESTES
# Gerar 100 QR Codes
cd scripts
node generate-qrcodes.js

# Gerar 100 solicitações de saque
node generate-cashouts.js
 // ============================================================================= //

 📋 Funcionalidades
### Cash In (Depósitos)

✅ Geração de QR Code Pix
✅ Armazenamento no DynamoDB
✅ Recebimento de webhooks
✅ Processamento via Lambda
✅ Atualização de status

### Cash Out (Saques)

✅ Solicitação de saque Pix
✅ Armazenamento no DynamoDB
✅ Recebimento de webhooks
✅ Processamento via Lambda
✅ Atualização de status

### Frontend

✅ Listagem de transações
✅ Visualização de status
✅ Atualização em tempo real
✅ Interface responsiva

🔧 API Endpoints

GET    /                    # Status da API
POST   /pix/qrcode         # Gerar QR Code Pix
GET    /pix/qrcodes        # Listar QR Codes
POST   /pix/cashout        # Solicitar saque
GET    /pix/cashouts       # Listar saques
POST   /webhook/cashin     # Webhook de depósito
POST   /webhook/cashout    # Webhook de saque.
GET    /transactions       # Listar todas as transações


🏗️ Arquitetura
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend API    │────│   Asaas API     │
│   (Next.js)     │    │   (Node.js)      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌────────▼────────┐
                       │   DynamoDB      │
                       │                 │
                       └─────────────────┘
                                │
                                │
                       ┌────────▼────────┐
                       │   SQS Queues    │
                       │                 │
                       └─────────────────┘
                                │
                                │
                       ┌────────▼────────┐
                       │ Lambda Functions│
                       │                 │
                       └─────────────────┘

                       🔒 Segurança

Validação de entrada em todas as APIs
Sanitização de dados
Tratamento de erros
Logs de auditoria
Credenciais em variáveis de ambiente

🧹 Limpeza
Para remover todos os recursos AWS após os testes:
bash./aws/clean-resources.sh

📝 TODO

 Implementar autenticação
 Adicionar testes unitários
 Implementar rate limiting
 Adicionar métricas de monitoramento
 Implementar cache Redis
 Adicionar documentação da API (Swagger)

🤝 Contribuindo

Fork o projeto
Crie uma branch para sua feature
Commit suas mudanças
Push para a branch
Abra um Pull Request

📜 Licença
Este projeto está sob a licença MIT.

### 8.2 DISCUSSAO.md

```markdown
# Discussão sobre Controle de Saldo

## Introdução

O controle eficiente de saldo dos clientes é um dos aspectos mais críticos em sistemas de pagamento. Este documento analisa os principais desafios, estratégias e considerações para implementar um sistema robusto de controle financeiro.

## 🎯 Principais Desafios

### 1. Consistência de Dados

**Problema**: Manter a consistência do saldo quando há múltiplas transações simultâneas.

**Cenário**: Um cliente com saldo de R$ 100,00 tenta fazer dois saques de R$ 60,00 ao mesmo tempo.

**Soluções**:
- Uso de transações atômicas no banco de dados
- Implementação de locks pessimistas ou otimistas
- Versionamento de registros para detectar conflitos

### 2. Atomicidade das Operações

**Problema**: Garantir que operações complexas sejam executadas completamente ou não sejam executadas.

**Exemplo**: Durante um saque, é necessário:
1. Verificar saldo
2. Reduzir saldo
3. Criar registro de transação
4. Chamar API externa

**Solução**: Padrão Saga ou transações distribuídas

### 3. Conciliação Bancária

**Problema**: O saldo no sistema deve sempre corresponder aos valores reais nas contas bancárias.

**Desafios**:
- Delays na confirmação de transações
- Falhas de comunicação com APIs externas
- Transações parcialmente processadas

## 🛡️ Estratégias para Evitar Perdas Financeiras

### 1. Validação Rigorosa

```typescript
// Exemplo de validação antes de saque
async validateWithdrawal(userId: string, amount: number): Promise<boolean> {
  const account = await this.getAccount(userId);
  
  // Verificações básicas
  if (amount <= 0) throw new Error('Valor inválido');
  if (amount > account.availableBalance) throw new Error('Saldo insuficiente');
  
  // Verificações de limite
  const dailyWithdrawn = await this.getDailyWithdrawn(userId);
  if (dailyWithdrawn + amount > DAILY_LIMIT) {
    throw new Error('Limite diário excedido');
  }
  
  // Verificações de segurança
  if (amount > SINGLE_TRANSACTION_LIMIT) {
    throw new Error('Valor acima do limite por transação');
  }
  
  return true;
}