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

//============================================================================= //
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
<!-- https://sandbox.asaas.com/api/v3/ -->
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

Filas Criadas:
cash-in-queue: Processa webhooks de pagamentos recebidos
cash-out-queue: Processa webhooks de transferências realizadas

🔄 Fluxos de Trabalho
 Fluxo Completo - Cash In
1. Cliente solicita QR Code
   └─▶ API cria no Asaas
       └─▶ Salva no DynamoDB com status "PENDING"

2. Cliente paga o PIX
   └─▶ Asaas detecta pagamento
       └─▶ Asaas envia webhook
           └─▶ API recebe webhook
               └─▶ Envia para SQS

3. Lambda processa fila SQS
   └─▶ Lê mensagem da fila
       └─▶ Extrai asaasId
           └─▶ Atualiza DynamoDB para "CONFIRMED"
🔄 Fluxo Completo - Cash Out
1. Cliente solicita saque
   └─▶ API cria transferência no Asaas
       └─▶ Salva no DynamoDB com status "PENDING"

2. Asaas processa transferência
   └─▶ Transferência concluída
       └─▶ Asaas envia webhook
           └─▶ API recebe webhook
               └─▶ Envia para SQS

3. Lambda processa fila SQS
   └─▶ Lê mensagem da fila
       └─▶ Extrai asaasId
           └─▶ Atualiza DynamoDB para "CONFIRMED"