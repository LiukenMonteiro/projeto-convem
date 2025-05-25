const axios = require('axios');

// URL da API
const API_URL = 'http://localhost:8080';

// Função para gerar QR Codes
async function generateQRCodes(count) {
  console.log(`Gerando ${count} QR Codes Pix...`);
  
  for (let i = 1; i <= count; i++) {
    try {
      // Gerar valor aleatório entre R$ 5,00 e R$ 100,00
      const value = parseFloat((Math.random() * 95 + 5).toFixed(2));
      
      // Validar se o valor é válido
      if (isNaN(value) || value <= 0) {
        console.error(`Erro ao gerar QR Code #${i}: Valor inválido`);
        continue;
      }
      
      // Enviar requisição para criar QR Code
      const response = await axios.post(`${API_URL}/pix/qrcode`, {
        value: value,
        description: `Teste QR Code #${i}`
      });
      
      console.log(`QR Code #${i} gerado com ID: ${response.data.id} - Valor: R$ ${value.toFixed(2)}`);
    } catch (error) {
      console.error(`Erro ao gerar QR Code #${i}:`, error.response?.data?.error || error.message);
      
      // Se der muitos erros consecutivos, parar
      if (i > 10 && error.response?.status === 500) {
        console.log('Muitos erros consecutivos, parando...');
        break;
      }
    }
    
    // Aguardar um pequeno intervalo para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('Geração de QR Codes concluída!');
}

// Gerar 100 QR Codes
generateQRCodes(100);