#!/bin/bash
echo "🧹 Limpando TODAS as transações do DynamoDB..."

# Função para limpar uma tabela completamente
limpar_tabela() {
    local tabela=$1
    echo "Limpando tabela: $tabela"
    
    # Obter todos os IDs
    aws dynamodb scan --table-name $tabela --region sa-east-1 \
      --projection-expression "id" \
      --output text --query 'Items[].id.S' | \
      while read -r id; do
        if [ ! -z "$id" ] && [ "$id" != "None" ]; then
          aws dynamodb delete-item \
            --table-name $tabela --region sa-east-1 \
            --key "{\"id\":{\"S\":\"$id\"}}" 2>/dev/null
          echo "✓ Removido: $id"
        fi
      done
}

limpar_tabela "PixQrCodes"
limpar_tabela "PixCashOut"

echo "✅ Limpeza completa concluída!"
echo "📊 Verificando se tabelas estão vazias..."

# Verificar se está vazio
echo "QR Codes restantes: $(aws dynamodb scan --table-name PixQrCodes --region sa-east-1 --select COUNT --query 'Count')"
echo "Cash Outs restantes: $(aws dynamodb scan --table-name PixCashOut --region sa-east-1 --select COUNT --query 'Count')"
