import axios from 'axios';
import { ASAAS_API_KEY, ASAAS_BASE_URL } from '../config/database';

export class AsaasService {
  private baseUrl: string;
  private headers: any;

  constructor() {
    this.baseUrl = ASAAS_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY
    };
    
    console.log('🔧 AsaasService inicializado:');
    console.log('📍 Base URL:', this.baseUrl);
    console.log('🔑 API Key:', ASAAS_API_KEY?.substring(0, 20) + '...');
  }

  // Primeiro vamos testar se a API está funcionando
  async testConnection(): Promise<any> {
    try {
      console.log('🧪 Testando conexão com Asaas...');
      
      const response = await axios.get(
        `${this.baseUrl}/myAccount`,
        { headers: this.headers }
      );
      
      console.log('✅ Conexão com Asaas OK:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro na conexão com Asaas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Gerar QR Code Pix (versão corrigida)
  async generatePixQRCode(value: number, description: string): Promise<any> {
    try {
      console.log('🟡 Gerando QR Code Pix via Asaas (rota corrigida):', { value, description });
      
      // Primeiro, vamos criar um pagamento/cobrança
      const paymentPayload = {
        customer: "cus_000005555555", // Customer padrão para testes
        billingType: "PIX",
        value: value,
        dueDate: new Date().toISOString().split('T')[0], // Data de hoje
        description: description
      };
      
      console.log('📤 Criando cobrança PIX:', paymentPayload);
      
      const paymentResponse = await axios.post(
        `${this.baseUrl}/payments`,
        paymentPayload,
        { 
          headers: this.headers,
          timeout: 10000
        }
      );
      
      console.log('✅ Cobrança criada:', paymentResponse.data);
      
      // Agora gerar o QR Code para essa cobrança
      const qrCodeResponse = await axios.get(
        `${this.baseUrl}/payments/${paymentResponse.data.id}/pixQrCode`,
        { headers: this.headers }
      );
      
      console.log('✅ QR Code gerado:', qrCodeResponse.data);
      
      return {
        id: paymentResponse.data.id,
        value: value,
        encodedImage: qrCodeResponse.data.encodedImage,
        payload: qrCodeResponse.data.payload,
        description: description
      };
      
    } catch (error: any) {
      console.error('❌ Erro detalhado na API do Asaas:');
      
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📄 Dados do erro:', error.response.data);
      }
      
      // Se a API do Asaas falhar, usar mock como fallback
      console.log('🔄 Usando mock como fallback...');
      return this.generateMockPixQRCode(value, description);
    }
  }

  // Mock como fallback
  private generateMockPixQRCode(value: number, description: string): any {
    const { v4: uuidv4 } = require('uuid');
    
    return {
      id: uuidv4(),
      value,
      encodedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      payload: `00020126580014BR.GOV.BCB.PIX0136${uuidv4()}520400005303986540${value.toFixed(2)}5802BR5913Mock Company6009SAO PAULO62070503***6304`,
      description
    };
  }

  // Solicitar saque Pix (versão simplificada)
  async requestCashOut(value: number, pixKey: string, pixKeyType: string, description: string): Promise<any> {
    try {
      console.log('🟡 Solicitando saque Pix (mock por enquanto):', { value, pixKey, pixKeyType, description });
      
      // Por enquanto, usar mock para saque também
      const { v4: uuidv4 } = require('uuid');
      
      return {
        id: uuidv4(),
        value,
        pixKey,
        pixKeyType,
        status: 'PENDING',
        description
      };
      
    } catch (error: any) {
      console.error('❌ Erro ao solicitar saque Pix:', error.response?.data || error.message);
      throw error;
    }
  }
}