#!/bin/bash

echo "Iniciando o frontend da aplicação Convem..."

#entra no diretorio do frontend
cd frontend

#verifica se as depedêncoas estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

#iniciando o servidor Next.js
echo "Iniciando o servidor na porta 3000..."
npm run dev