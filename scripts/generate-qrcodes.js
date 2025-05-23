const axios = require('axios');
// URL da API da aplicação (API)
const API_URL = 'http://localhost:8080';

// Função para gerar QR Codes
async function generateQRCodes(count) {
    console.log(`Gerando ${count} QR Codes Pix...`);
    
    for (let i = 1; i <= count; i++) {
        try {
            // Gera um valor aleatório entre 5 e 100
            const value = parseFloat((Math.random() * 95 + 5).toFixed(2));

            // Faz a requisição para gerar o QR Code
            const response = await axios.post(`${API_URL}/pix/qrcode`, {
                value,
                description: `Teste QR Code #${i}`
        });

        console.log(`QR Code ${i} gerado com ID: ${response.data.id} - Valor: R$ ${value}`);
    } catch (error) {
            console.error(`Erro ao gerar QR Code ${i}:`, error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms entre as requisições para não sobrecarregar o servidor
    } 
    console.log('QR Codes gerados com sucesso!'); 
}

//gerando os 100 QRcODES
generateQRCodes(100);