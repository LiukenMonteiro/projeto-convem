const axios = require('axios');

const API_URL = 'http://localhost:8080';

const PIX_KEY_TYPES = ['CPF', 'EMAIL', 'PHONE', 'EVP'];

function generateRandomPixKey(type, index) {
    switch (type ) {
        case 'CPF':
            return `123.456.789-${String(index).padStart(2, '0')}`;
        case 'EMAIL':
            return `teste${index}@exemplo.com`;
        case 'PHONE':
            return `+5511999${String(index % 10000).padStart(4, '0')}`;
        case 'EVP':
            return `${Math.random().toString(36).substring(2, 15)}`;
        default:
            return `chave_${index}`;
    }
}

async function generateCashouts(count) {
    console.log(`Gerando ${count} solicitações de saque Pix...`);

    for (let i= 1; i <= count; i++) {
        try {

            const value = parseFloat((Math.random() * 95 + 5).toFixed(2));

            const pixKeyType = PIX_KEY_TYPES[Math.floor(Math.random() * PIX_KEY_TYPES.length)];

            const pixKey = generateRandomPixKey(pixKeyType, i);

            const response = await axios.post(`${API_URL}/pix/cashout`, {
                value,
                pixKey,
                pixKeyType,
                description: `Teste de saque Pix #${i}`
            });

            console.log(`Saque #${i} solicatado com ID: ${response.data.id} - Valor: R$ ${value} - Chave: ${pixKey} (${pixKeyType})`); 
        } catch (error) {
            console.error(`Erro ao solicitar saque #${i}:`, error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms entre as requisições para não sobrecarregar o servidor
    }
    console.log('Geração de solicitações de saque concluída!');
}

generateCashouts(100);