import { CASH_IN_QUEUE_URL } from "../config/aws";
import { DynamoDBService } from "../services/dynamoDBService";
import { SQSService } from "../services/sqsService";
import { Request, Response } from "express";


const dynamoDBService = new DynamoDBService();
const sqsService = new SQSService();

//webhook do cash in
export const receiveCashInWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const webhook = req.body;

        await sqsService.sendMessage(CASH_IN_QUEUE_URL,webhook); //enviando o webhook para a fila SQS

        console.log('Webhook do Cash in recebido:', JSON.stringify(webhook));    
    } catch (error) {
        console.log('Erro ao processar o webhook do cash in:', error);
        res.status(500).json({ error: 'Erro ao processar o webhook do cash in' });
    }
};