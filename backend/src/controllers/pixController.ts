import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../services/dynamoDBService';
import { AsaasService } from '../services/asaasService';
import { PixQRCode } from '../models/PixQRCode';
import { PixCashOut } from '../models/PixCashOut';

const dynamoDBService = new DynamoDBService();
const asaasService = new AsaasService();

// Gerar QR Code Pix
// Gerar QR Code Pix (versão corrigida)
export const generatePixQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, description } = req.body;

    console.log('📥 Recebendo solicitação de QR Code (AWS DynamoDB):', { value, description });

    // Validação mais rigorosa
    if (!value || typeof value !== 'number' || value <= 0 || isNaN(value)) {
      res.status(400).json({ error: 'O valor é obrigatório e deve ser um número válido maior que zero' });
      return;
    }

    // Chamar a API do Asaas para gerar o QR Code
    const asaasResponse = await asaasService.generatePixQRCode(value, description || 'Depósito Pix');

    // Criar o registro com validações
    const qrCode: PixQRCode = {
      id: uuidv4(),
      value: parseFloat(value.toString()), // Garantir que é número
      qrCodeImage: asaasResponse.encodedImage || '',
      qrCodeText: asaasResponse.payload || '',
      status: 'PENDING',
      asaasId: asaasResponse.id || uuidv4(),
      description: description || 'Depósito Pix',
      createdAt: new Date().toISOString()
    };

    // Salvar no DynamoDB REAL
    await dynamoDBService.createPixQRCode(qrCode);

    console.log('✅ QR Code criado com sucesso no DynamoDB:', qrCode.id);

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

    console.log('📥 Recebendo solicitação de saque (AWS DynamoDB):', { value, pixKey, pixKeyType });

    if (!value || typeof value !== 'number' || value <= 0) {
      res.status(400).json({ error: 'O valor é obrigatório e deve ser maior que zero' });
      return;
    }

    if (!pixKey || !pixKeyType) {
      res.status(400).json({ error: 'A chave Pix e o tipo de chave são obrigatórios' });
      return;
    }

    // Chamar a API do Asaas para solicitar o saque (ainda mock)
    const asaasResponse = await asaasService.requestCashOut(
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

    // Salvar no DynamoDB REAL
    await dynamoDBService.createPixCashOut(cashOut);

    console.log('✅ Saque criado com sucesso no DynamoDB:', cashOut.id);

    res.status(201).json(cashOut);
  } catch (error) {
    console.error('❌ Erro ao solicitar saque:', error);
    res.status(500).json({ error: 'Erro ao solicitar saque Pix' });
  }
};

// Listar QR Codes
export const listPixQRCodes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const qrCodes = await dynamoDBService.listPixQRCodes();
    console.log('📋 Listando QR Codes do DynamoDB. Total:', qrCodes.length);
    res.status(200).json({ qrCodes });
  } catch (error) {
    console.error('❌ Erro ao listar QR Codes:', error);
    res.status(500).json({ error: 'Erro ao listar QR Codes' });
  }
};

// Listar saques
export const listPixCashOuts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cashOuts = await dynamoDBService.listPixCashOuts();
    console.log('📋 Listando saques do DynamoDB. Total:', cashOuts.length);
    res.status(200).json({ cashOuts });
  } catch (error) {
    console.error('❌ Erro ao listar saques:', error);
    res.status(500).json({ error: 'Erro ao listar saques' });
  }
};

// Listar todas as transações
export const listTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await dynamoDBService.listTransactions();
    console.log('📋 Listando transações do DynamoDB. Total:', transactions.length);
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('❌ Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
};

// Testar conexão com Asaas
export const testAsaas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await asaasService.testConnection();
    res.status(200).json({ message: 'Asaas funcionando', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Erro no Asaas', details: error });
  }
};