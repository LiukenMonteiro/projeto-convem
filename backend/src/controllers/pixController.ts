import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { AsaasService } from "../services/asaasService";
import { DynamoDBService } from "../services/dynamoDBService";
import { PixQRCode } from "../models/PixQRCode";
import { PixCashOut } from "../models/PixCashOut";

const dynamoDBService = new DynamoDBService();
const asaasService = new AsaasService();

//Gerando o qr codePIx
export const generatePixQRCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { value, description } = req.body;

        if (!value || typeof value !== 'number' || value <=0) {
            res.status(400).json({ error: 'O valor é obrigatório e deve ser maior que zero' })
            return;
        }

        //chamando a api Asaas do QRCode já criada.
        const asaasResponse = await asaasService.generatePixQRCode(value, description || 'Depósito pix');

        const qrCode: PixQRCode = { //criando registro no DynamoDB
            id: uuidv4(),
            value,
            qrCodeImage: asaasResponse.encodedImage,
            qrCodeText: asaasResponse.payload,
            status: 'PENDING',
            asaasId: asaasResponse.id,
            description: description,
            createdAt: new Date().toISOString()
        };

        await dynamoDBService.createPixQRCode(qrCode);

        res.status(201).json(qrCode);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        res.status(500).json({  error: 'Erro ao gerar QR Code Pix' });
    }
}; 

 // SOlicitar um saque Pix
 export const requestCashOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const { value, pixKey, pixKeyType } = req.body;

        if (!value || typeof value !== 'number' || value <= 0) {
            res.status(400).json({ error: 'O valor é obrigatório e deve ser maior que zero' });
            return;
        }

        if (!pixKey || !pixKeyType) {
            res.status(400).json({ error: 'A chave pix e o tipo de chave são obrigatórios' });
            return;
        }

        // chamando a api Asaas do pra solicitar o pix
        const asaasResponse = await asaasService.requestCashOut(
            value, 
            pixKey, 
            pixKeyType,
            'Saque Pix via API COnvem'
        );

        //registro no banco de dados DynamoDB
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
     await dynamoDBService.createPixCashOut(cashOut);
        res.status(201).json(cashOut);
    } catch (error) {
        console.error('Erro ao solicitar saque:', error);
        res.status(500).json({ error: 'Erro ao solicitar saque Pix' });
 }
};