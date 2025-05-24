#!/bin/bash

echo "⚠️  ATENÇÃO: Este script irá excluir TODOS os recursos AWS do projeto!"
echo "Isso inclui:"
echo "- Tabelas DynamoDB (PixQrCodes e PixCashOut)"
echo "- Filas SQS (cash-in-queue e cash-out-queue)"
echo "- Funções Lambda (process-cashin e process-cashout)"
echo ""

read -p "Deseja continuar? (digite 'CONFIRMAR' para prosseguir): " confirm

if [ "$confirm" != "CONFIRMAR" ]; then
    echo "Operação cancelada."
    exit 0
fi

echo "Iniciando limpeza dos recursos..."

# Excluir event source mappings das funções Lambda
echo "Removendo triggers SQS das funções Lambda..."
for uuid in $(aws lambda list-event-source-mappings --query "EventSourceMappings[?contains(FunctionArn, 'process-cashin') || contains(FunctionArn, 'process-cashout')].UUID" --output text); do
    echo "Removendo mapping $uuid..."
    aws lambda delete-event-source-mapping --uuid $uuid
done

# Excluir funções Lambda
echo "Excluindo funções Lambda..."
aws lambda delete-function --function-name process-cashin || echo "Função process-cashin não encontrada"
aws lambda delete-function --function-name process-cashout || echo "Função process-cashout não encontrada"

# Excluir filas SQS
echo "Excluindo filas SQS..."
CASHIN_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-in-queue --query 'QueueUrl' --output text 2>/dev/null)
if [ ! -z "$CASHIN_QUEUE_URL" ]; then
    aws sqs delete-queue --queue-url $CASHIN_QUEUE_URL
    echo "✓ Fila cash-in-queue excluída"
fi

CASHOUT_QUEUE_URL=$(aws sqs get-queue-url --queue-name cash-out-queue --query 'QueueUrl' --output text 2>/dev/null)
if [ ! -z "$CASHOUT_QUEUE_URL" ]; then
    aws sqs delete-queue --queue-url $CASHOUT_QUEUE_URL
    echo "✓ Fila cash-out-queue excluída"
fi

# Excluir tabelas DynamoDB
echo "Excluindo tabelas DynamoDB..."
aws dynamodb delete-table --table-name PixQrCodes || echo "Tabela PixQrCodes não encontrada"
aws dynamodb delete-table --table-name PixCashOut || echo "Tabela PixCashOut não encontrada"

echo ""
echo "==============================================="
echo "Limpeza concluída!"
echo "==============================================="
echo ""
echo "Todos os recursos AWS do projeto foram removidos."
echo "Verifique no console da AWS se há recursos restantes."