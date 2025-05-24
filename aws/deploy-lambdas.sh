#!/bin/bash

echo "Implantando funções Lambda..."

# Verificar se estamos no diretório correto
if [ ! -d "lambda" ]; then
    echo "Erro: Execute este script do diretório aws/"
    exit 1
fi

# Obter informações da AWS
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$REGION" ]; then
    echo "Erro: Não foi possível obter informações da conta AWS."
    exit 1
fi

# Nome da role de execução para Lambda (você precisará criar esta role)
LAMBDA_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/lambda-execution-role"

echo "Compilando e empacotando função Lambda para Cash In..."
cd lambda/cashin

# Instalar dependências
npm init -y 2>/dev/null
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-lambda 2>/dev/null

# Criar package.json para Lambda
cat > package.json << EOF
{
  "name": "cashin-lambda",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.421.0",
    "@aws-sdk/lib-dynamodb": "^3.421.0",
    "aws-lambda": "^1.0.7"
  }
}
EOF

# Compilar TypeScript para JavaScript
npx tsc index.ts --target ES2018 --module commonjs --outDir .

# Criar ZIP
zip -r cashin-lambda.zip index.js node_modules/ package.json

echo "Implantando função Lambda para Cash In..."

# Verificar se a função já existe
if aws lambda get-function --function-name process-cashin &>/dev/null; then
    echo "Atualizando função existente..."
    aws lambda update-function-code \
        --function-name process-cashin \
        --zip-file fileb://cashin-lambda.zip
else
    echo "Criando nova função..."
    aws lambda create-function \
        --function-name process-cashin \
        --runtime nodejs18.x \
        --role $LAMBDA_ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://cashin-lambda.zip \
        --environment Variables='{PIX_QR_CODES_TABLE=PixQrCodes}' \
        --timeout 60
fi

cd ../cashout

echo "Compilando e empacotando função Lambda para Cash Out..."

# Instalar dependências
npm init -y 2>/dev/null
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-lambda 2>/dev/null

# Criar package.json para Lambda
cat > package.json << EOF
{
  "name": "cashout-lambda",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.421.0",
    "@aws-sdk/lib-dynamodb": "^3.421.0",
    "aws-lambda": "^1.0.7"
  }
}
EOF

# Compilar TypeScript para JavaScript
npx tsc index.ts --target ES2018 --module commonjs --outDir .

# Criar ZIP
zip -r cashout-lambda.zip index.js node_modules/ package.json

echo "Implantando função Lambda para Cash Out..."

# Verificar se a função já existe
if aws lambda get-function --function-name process-cashout &>/dev/null; then
    echo "Atualizando função existente..."
    aws lambda update-function-code \
        --function-name process-cashout \
        --zip-file fileb://cashout-lambda.zip
else
    echo "Criando nova função..."
    aws lambda create-function \
        --function-name process-cashout \
        --runtime nodejs18.x \
        --role $LAMBDA_ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://cashout-lambda.zip \
        --environment Variables='{PIX_CASH_OUT_TABLE=PixCashOut}' \
        --timeout 60
fi

# Voltar ao diretório aws
cd ..

echo "Configurando triggers SQS para as funções Lambda..."

# Obter URLs das filas
CASHIN_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-in-queue --query 'QueueUrl' --output text)
CASHOUT_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-out-queue --query 'QueueUrl' --output text)

# Obter ARNs das filas
CASHIN_QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url $CASHIN_QUEUE_URL --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)
CASHOUT_QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url $CASHOUT_QUEUE_URL --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

# Criar event source mappings
echo "Criando trigger SQS para função de Cash In..."
aws lambda create-event-source-mapping \
    --function-name process-cashin \
    --event-source-arn $CASHIN_QUEUE_ARN \
    --batch-size 10 \
    --maximum-batching-window-in-seconds 5 || echo "Trigger já existe ou erro na criação"

echo "Criando trigger SQS para função de Cash Out..."
aws lambda create-event-source-mapping \
    --function-name process-cashout \
    --event-source-arn $CASHOUT_QUEUE_ARN \
    --batch-size 10 \
    --maximum-batching-window-in-seconds 5 || echo "Trigger já existe ou erro na criação"

echo ""
echo "==============================================="
echo "Funções Lambda implantadas com sucesso!"
echo "==============================================="
echo ""
echo "IMPORTANTE: Certifique-se de que a role IAM 'lambda-execution-role' existe"
echo "com as permissões necessárias para DynamoDB e SQS."