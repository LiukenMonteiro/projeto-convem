import { Request, Response } from 'express';
import { SQSService } from '../services/sqsService';
import { CASH_IN_QUEUE_URL, CASH_OUT_QUEUE_URL } from '../config/aws';

const sqsService = new SQSService();

// Receber webhook de cash in
export const receiveCashInWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = req.body;
    
    console.log('🔔 Webhook de Cash In recebido:', JSON.stringify(webhook));
    
    // Enviar para a fila SQS REAL
    await sqsService.sendMessage(CASH_IN_QUEUE_URL, webhook);
    
    console.log('✅ Webhook enviado para SQS Cash In');
    
    res.status(200).json({ message: 'Webhook recebido e enviado para processamento' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook de cash in:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};

// Receber webhook de cash out
export const receiveCashOutWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = req.body;
    
    console.log('🔔 Webhook de Cash Out recebido:', JSON.stringify(webhook));
    
    // Enviar para a fila SQS REAL
    await sqsService.sendMessage(CASH_OUT_QUEUE_URL, webhook);
    
    console.log('✅ Webhook enviado para SQS Cash Out');
    
    res.status(200).json({ message: 'Webhook recebido e enviado para processamento' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook de cash out:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};