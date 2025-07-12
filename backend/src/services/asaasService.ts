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
         // https://sandbox.asaas.com/api/v3/payments
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
 async requestCashOut(value: number, pixKey: string, pixKeyType: string, description: string): Promise<any> {
    try {
      console.log('💸 Solicitando saque PIX via Asaas:', { value, pixKey, pixKeyType, description });
      
      // Mapear tipo de chave PIX para o formato aceito pelo Asaas
      const pixKeyTypeMap: any = {
        'CPF': 'CPF',
        'EMAIL': 'EMAIL',
        'PHONE': 'PHONE',
        'EVP': 'EVP',
        'CNPJ': 'CNPJ'
      };

      // Primeiro, precisamos obter ou criar dados bancários do destinatário
      // Em produção, isso seria obtido do cadastro do usuário
      const bankAccountData = await this.getOrCreateBankAccount(pixKey, pixKeyType);

      // Payload para transferência PIX
      const transferPayload = {
        value: value,
        bankAccount: {
          bank: {
            code: bankAccountData.bankCode || "450" // 450 é o código do Asaas PIX
          },
          accountName: bankAccountData.accountName || "Conta PIX",
          ownerName: bankAccountData.ownerName || "Beneficiário PIX",
          ownerBirthDate: bankAccountData.ownerBirthDate || "1990-01-01",
          cpfCnpj: this.extractCpfFromPixKey(pixKey, pixKeyType),
          agency: "0001", // Agência padrão para PIX
          account: "00000000", // Conta padrão para PIX
          accountDigit: "0", // Dígito padrão para PIX
          bankAccountType: "PAYMENT", // Tipo de conta para PIX
          pixAddressKey: {
            key: pixKey,
            type: pixKeyTypeMap[pixKeyType] || pixKeyType
          }
        },
        operationType: "PIX",
        description: description || "Saque PIX via API Convem",
        scheduleDate: new Date().toISOString().split('T')[0], // Transferência imediata
        externalReference: `CASHOUT_${Date.now()}` // Referência única
      };
      
      console.log('📤 Enviando payload de transferência:', JSON.stringify(transferPayload, null, 2));
      
      // Fazer a requisição de transferência
      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        transferPayload,
        { 
          headers: this.headers,
          timeout: 15000
        }
      );
      
      console.log('✅ Transferência PIX criada com sucesso:', response.data);
      
      return {
        id: response.data.id,
        value: value,
        pixKey: pixKey,
        pixKeyType: pixKeyType,
        status: response.data.status || 'PENDING',
        description: description,
        bankAccount: response.data.bankAccount,
        dateCreated: response.data.dateCreated,
        estimatedDate: response.data.estimatedDate,
        fee: response.data.fee || 0,
        transactionId: response.data.transactionId,
        externalReference: response.data.externalReference
      };
      
    } catch (error: any) {
      console.error('❌ Erro ao solicitar saque PIX:');
      
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📄 Dados do erro:', error.response.data);
        
        // Tratar erros específicos do Asaas
        if (error.response.status === 400) {
          const errorMessage = error.response.data.errors?.[0]?.description || 'Dados inválidos';
          throw new Error(`Erro de validação: ${errorMessage}`);
        }
        
        if (error.response.status === 401) {
          throw new Error('Token de API inválido ou expirado');
        }
        
        if (error.response.status === 403) {
          throw new Error('Sem permissão para realizar transferências');
        }
      }
      
      // Se falhar, usar mock como fallback (apenas para desenvolvimento)
      console.log('🔄 Usando mock como fallback para desenvolvimento...');
      return this.generateMockCashOut(value, pixKey, pixKeyType, description);
    }
  }

  // Método auxiliar para obter/criar dados bancários
  private async getOrCreateBankAccount(pixKey: string, pixKeyType: string): Promise<any> {
    // Em produção, isso consultaria o banco de dados do usuário
    // Por ora, retorna dados padrão baseados no tipo de chave
    
    const defaultData: any = {
      bankCode: "450", // Código Asaas PIX
      accountName: "Conta PIX",
      ownerBirthDate: "1990-01-01"
    };

    switch (pixKeyType) {
      case 'CPF':
        defaultData.ownerName = "Pessoa Física";
        defaultData.cpfCnpj = pixKey.replace(/\D/g, '');
        break;
      case 'CNPJ':
        defaultData.ownerName = "Pessoa Jurídica";
        defaultData.cpfCnpj = pixKey.replace(/\D/g, '');
        break;
      case 'EMAIL':
        defaultData.ownerName = "Titular Email";
        defaultData.cpfCnpj = "00000000000"; // CPF padrão para teste
        break;
      case 'PHONE':
        defaultData.ownerName = "Titular Telefone";
        defaultData.cpfCnpj = "00000000000"; // CPF padrão para teste
        break;
      case 'EVP':
        defaultData.ownerName = "Titular Chave Aleatória";
        defaultData.cpfCnpj = "00000000000"; // CPF padrão para teste
        break;
    }

    return defaultData;
  }

  // Extrai CPF da chave PIX quando possível
  private extractCpfFromPixKey(pixKey: string, pixKeyType: string): string {
    if (pixKeyType === 'CPF') {
      return pixKey.replace(/\D/g, '');
    }
    if (pixKeyType === 'CNPJ') {
      return pixKey.replace(/\D/g, '');
    }
    // Para outros tipos, retornar CPF padrão de teste
    return "00000000000";
  }

  // Mock para QR Code (fallback)
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

  // Mock para Cash Out (fallback)
  private generateMockCashOut(value: number, pixKey: string, pixKeyType: string, description: string): any {
    const { v4: uuidv4 } = require('uuid');
    
    return {
      id: uuidv4(),
      value,
      pixKey,
      pixKeyType,
      status: 'PENDING',
      description,
      fee: 1.90, // Taxa padrão PIX
      estimatedDate: new Date().toISOString(),
      transactionId: `MOCK_${Date.now()}`,
      externalReference: `CASHOUT_MOCK_${Date.now()}`
    };
  }

  // Consultar status de uma transferência
  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transfers/${transferId}`,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao consultar status da transferência:', error.response?.data || error.message);
      throw error;
    }
  }

  // Listar transferências
  async listTransfers(filters?: any): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.dateCreated) {
        params.append('dateCreated', filters.dateCreated);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/transfers?${params.toString()}`,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao listar transferências:', error.response?.data || error.message);
      throw error;
    }
  }
}