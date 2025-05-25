#!/bin/bash
echo "Limpando todas as transações do DynamoDB..."

# Função para limpar uma tabela
limpar_tabela() {
    local tabela=$1
    echo "Limpando tabela: $tabela"
    
    aws dynamodb scan --table-name $tabela --region sa-east-1 \
      --projection-expression "id" \
      --output text --query 'Items[].id.S' | \
      while read -r id; do
        if [ ! -z "$id" ]; then
          aws dynamodb delete-item \
            --table-name $tabela --region sa-east-1 \
            --key "{\"id\":{\"S\":\"$id\"}}"
          echo "Removido: $id"
        fi
      done
}

limpar_tabela "PixQrCodes"
limpar_tabela "PixCashOut"

echo "Limpeza concluída!"
