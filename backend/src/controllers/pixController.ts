import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
interface PixQRCode {
  id: string;
  value: number;
  qrCodeImage: string;
  qrCodeText: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  asaasId: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

interface PixCashOut {
  id: string;
  value: number;
  pixKey: string;
  pixKeyType: 'CPF' | 'EMAIL' | 'PHONE' | 'EVP';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  asaasId: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

// Armazenamento em memória (substitui o DynamoDB)
const qrCodes: PixQRCode[] = [];
const cashOuts: PixCashOut[] = [];

// Mock do serviço Asaas
const mockAsaasService = {
  async generatePixQRCode(value: number, description: string) {
    console.log('🟡 Gerando QR Code Pix (mock):', { value, description });
    
    return {
      id: uuidv4(),
      value,
      encodedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      payload: `00020126580014BR.GOV.BCB.PIX0136${uuidv4()}520400005303986540${value.toFixed(2)}5802BR5913Mock Company6009SAO PAULO62070503***6304`,
      description
    };
  },

  async requestCashOut(value: number, pixKey: string, pixKeyType: string, description: string) {
    console.log('🟡 Solicitando saque Pix (mock):', { value, pixKey, pixKeyType, description });
    
    return {
      id: uuidv4(),
      value,
      pixKey,
      pixKeyType,
      status: 'PENDING',
      description
    };
  }
};

// Gerar QR Code Pix
export const generatePixQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, description } = req.body;

    console.log('📥 Recebendo solicitação de QR Code:', { value, description });

    if (!value || typeof value !== 'number' || value <= 0) {
      res.status(400).json({ error: 'O valor é obrigatório e deve ser maior que zero' });
      return;
    }

    // Chamar mock do Asaas
    const asaasResponse = await mockAsaasService.generatePixQRCode(value, description || 'Depósito Pix');

    // Criar o registro
    const qrCode: PixQRCode = {
      id: uuidv4(),
      value,
      qrCodeImage: asaasResponse.encodedImage,
      qrCodeText: asaasResponse.payload,
      status: 'PENDING',
      asaasId: asaasResponse.id,
      description: description,
      createdAt: new Date().toISOString()
    };

    // Salvar em memória
    qrCodes.push(qrCode);

    console.log('✅ QR Code criado com sucesso:', qrCode.id);

    res.status(201).json(qrCode);
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ error: 'Erro ao gerar QR Code Pix' });
  }
};

// Solicitar saque Pix
export const requestCashOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, pixKey, pixKeyType } = req.body;

    console.log('📥 Recebendo solicitação de saque:', { value, pixKey, pixKeyType });

    if (!value || typeof value !== 'number' || value <= 0) {
      res.status(400).json({ error: 'O valor é obrigatório e deve ser maior que zero' });
      return;
    }

    if (!pixKey || !pixKeyType) {
      res.status(400).json({ error: 'A chave Pix e o tipo de chave são obrigatórios' });
      return;
    }

    // Chamar mock do Asaas
    const asaasResponse = await mockAsaasService.requestCashOut(
      value, 
      pixKey, 
      pixKeyType, 
      'Saque Pix via API Convem'
    );

    // Criar o registro
    const cashOut: PixCashOut = {
      id: uuidv4(),
      value,
      pixKey,
      pixKeyType: pixKeyType as any,
      status: 'PENDING',
      asaasId: asaasResponse.id,
      description: 'Saque Pix via API Convem',
      createdAt: new Date().toISOString()
    };

    // Salvar em memória
    cashOuts.push(cashOut);

    console.log('✅ Saque criado com sucesso:', cashOut.id);

    res.status(201).json(cashOut);
  } catch (error) {
    console.error('❌ Erro ao solicitar saque:', error);
    res.status(500).json({ error: 'Erro ao solicitar saque Pix' });
  }
};

// Listar QR Codes
export const listPixQRCodes = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Listando QR Codes. Total:', qrCodes.length);
    res.status(200).json({ qrCodes });
  } catch (error) {
    console.error('❌ Erro ao listar QR Codes:', error);
    res.status(500).json({ error: 'Erro ao listar QR Codes' });
  }
};

// Listar saques
export const listPixCashOuts = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Listando saques. Total:', cashOuts.length);
    res.status(200).json({ cashOuts });
  } catch (error) {
    console.error('❌ Erro ao listar saques:', error);
    res.status(500).json({ error: 'Erro ao listar saques' });
  }
};

// Listar todas as transações
export const listTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = [
      ...qrCodes.map(qr => ({
        id: qr.id,
        value: qr.value,
        status: qr.status,
        type: 'cashin',
        createdAt: qr.createdAt,
        processedAt: qr.processedAt
      })),
      ...cashOuts.map(co => ({
        id: co.id,
        value: co.value,
        status: co.status,
        type: 'cashout',
        createdAt: co.createdAt,
        processedAt: co.processedAt
      }))
    ];

    console.log('📋 Listando transações. Total:', transactions.length);
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('❌ Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
};