import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { AsaasService } from "../services/asaasService";
import { DynamoDBService } from "../services/dynamoDBService";
import { PixQRCode } from "../models/PixQRCode";

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