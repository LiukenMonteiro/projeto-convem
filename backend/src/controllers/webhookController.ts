import { Request, Response } from 'express';

// Receber webhook de cash in
export const receiveCashInWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = req.body;
    
    console.log('🔔 Webhook de Cash In recebido (mock):', JSON.stringify(webhook));
    
    // Simular processamento
    setTimeout(() => {
      console.log('✅ Webhook de Cash In processado (mock)');
    }, 1000);
    
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
    
    console.log('🔔 Webhook de Cash Out recebido (mock):', JSON.stringify(webhook));
    
    // Simular processamento
    setTimeout(() => {
      console.log('✅ Webhook de Cash Out processado (mock)');
    }, 1000);
    
    res.status(200).json({ message: 'Webhook recebido e enviado para processamento' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook de cash out:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};
