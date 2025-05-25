#!/bin/bash
# Script para iniciar o backend da aplicação Convem

echo "Iniciando o backend da aplicação Convem..."

if [ ! - f "backend/.env" ]; then
    echo "Arquivo .env não encontrado!"
    echo "Copie o arquivo .env.example para .env e configure suas variáveis."
    exit 1
fi
#entra no diretorio do backend
cd backend
#verifica se as depedêncoas estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando depedências..."
    npm install
fi
#iniciando o servidor Express
echo "Iniciando o servidor na porta 8080..."
npm run dev