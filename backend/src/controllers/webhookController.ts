import { CASH_IN_QUEUE_URL } from "../config/aws";
import { DynamoDBService } from "../services/dynamoDBService";
import { SQSService } from "../services/sqsService";
import { Request, Response } from "express";

const dynamoDBService = new DynamoDBService();
const sqsService = new SQSService();

//webhook do cash in (recebendo dinheiro)
export const receiveCashInWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = req.body;

    console.log('Webhook do Cash in recebido:', JSON.stringify(webhook)); // tipo cash in?

    await sqsService.sendMessage(CASH_IN_QUEUE_URL, webhook); //enviando para a fila SQS

    res.status(200).json({ message: 'Webhook Cash in recebido e enviado para processamento' });
  } catch (error) {
    console.log('Erro ao processar o webhook do cash in:', error);
    res.status(500).json({ error: 'Erro ao processar o webhook do cash in' });
  }
};

//webhook do cash out (sacando dinheiro)
export const receiveCashOutWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = req.body;

    console.log('Webhook do Cash out recebido:', JSON.stringify(webhook)); // tipo cash out?

    await sqsService.sendMessage(CASH_IN_QUEUE_URL, webhook); //enviando para a fila SQS

    res.status(200).json({ message: 'Webhook Cash out recebido e enviado para processamento' });
  } catch (error) {
    console.log('Erro ao processar o webhook do cash out:', error);
    res.status(500).json({ error: 'Erro ao processar o webhook do cash out' });
  }
};
