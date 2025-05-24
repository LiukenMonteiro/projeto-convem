#!/bin/bash

echo "Criando recursos AWS para o projeto Convem..."

# Verificar se o AWS CLI está instalado e configurado
if ! command -v aws &> /dev/null; then
    echo "AWS CLI não encontrado. Por favor, instale e configure o AWS CLI."
    exit 1
fi

# Obter o Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$REGION" ]; then
    echo "Erro: Não foi possível obter informações da conta AWS. Verifique suas credenciais."
    exit 1
fi

echo "Account ID: $AWS_ACCOUNT_ID"
echo "Região: $REGION"

echo "Criando tabelas no DynamoDB..."

# Criar tabela para QR Codes Pix
aws dynamodb create-table \
    --table-name PixQrCodes \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✓ Tabela PixQrCodes criada com sucesso"
else
    echo "⚠ Erro ao criar tabela PixQrCodes (pode já existir)"
fi

# Criar tabela para Cash Out
aws dynamodb create-table \
    --table-name PixCashOut \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✓ Tabela PixCashOut criada com sucesso"
else
    echo "⚠ Erro ao criar tabela PixCashOut (pode já existir)"
fi

echo "Criando filas SQS..."

# Criar fila para Cash In
CASHIN_QUEUE_URL=$(aws sqs create-queue \
    --queue-name cash-in-queue \
    --region $REGION \
    --query 'QueueUrl' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✓ Fila cash-in-queue criada: $CASHIN_QUEUE_URL"
else
    echo "⚠ Erro ao criar fila cash-in-queue (pode já existir)"
    CASHIN_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-in-queue --query 'QueueUrl' --output text)
fi

# Criar fila para Cash Out
CASHOUT_QUEUE_URL=$(aws sqs create-queue \
    --queue-name cash-out-queue \
    --region $REGION \
    --query 'QueueUrl' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✓ Fila cash-out-queue criada: $CASHOUT_QUEUE_URL"
else
    echo "⚠ Erro ao criar fila cash-out-queue (pode já existir)"
    CASHOUT_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-out-queue --query 'QueueUrl' --output text)
fi

echo ""
echo "==============================================="
echo "Recursos AWS criados com sucesso!"
echo "==============================================="
echo ""
echo "Adicione as seguintes variáveis ao seu arquivo .env:"
echo ""
echo "CASH_IN_QUEUE_URL=$CASHIN_QUEUE_URL"
echo "CASH_OUT_QUEUE_URL=$CASHOUT_QUEUE_URL"
echo "PIX_QR_CODES_TABLE=PixQrCodes"
echo "PIX_CASH_OUT_TABLE=PixCashOut"
echo "AWS_REGION=$REGION"
echo ""
echo "Próximos passos:"
echo "1. Atualize o arquivo .env com as URLs das filas"
echo "2. Execute ./deploy-lambdas.sh para implantar as funções Lambda"
echo "3. Configure os webhooks no Asaas para apontar para suas APIs"