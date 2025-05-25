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


projeto-convem