import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PIX_CASH_OUT_TABLE, PIX_QR_CODES_TABLE } from "../config/aws";
import { PixQRCode } from "../models/PixQRCode";
import { PixCashOut } from "../models/PixCashOut";

//metodos do pixQRCOde
export class DynamoDBService {
    async createPixQRCode(qrCode: PixQRCode): Promise<void> {
        const command = new PutCommand({
            TableName: PIX_QR_CODES_TABLE,
            Item: qrCode
        });
        
        await docClient.send(command);
    }

    async getPixQRCode(id: string): Promise<PixQRCode | null> {
        const command = new GetCommand({
            TableName: PIX_QR_CODES_TABLE,
            Key: { id }
        });

        const response = await docClient.send(command);
        return response.Item as PixQRCode || null;
    }

    async UpdatePixQRCode(id: string, status: string): Promise<void> {
        const now = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: PIX_QR_CODES_TABLE,
            Key: { id },
            UpdateExpression: 'SET #status = :status, #processedAt = :processedAt',
            ExpressionAttributeNames:  {
                '#status': 'status',
                '#processedAt': 'processedAt'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':processedAt': now
            }
        });

        await docClient.send(command);
    }

    async listPixQRCodes(): Promise<PixQRCode[]> { //chama lista dos qrCodes
        const command = new ScanCommand({
            TableName: PIX_QR_CODES_TABLE
        });

        const response = await docClient.send(command);
        return (response.Items || []) as PixQRCode[];
    }

    //metodos do PixCashOut

    async createPixCashOut(cashOut: PixCashOut): Promise<void> {
        const command = new PutCommand({
            TableName: PIX_CASH_OUT_TABLE,
            Item: cashOut
        });

        await docClient.send(command)
    }

    async getPixCashOut(id: string): Promise<PixCashOut | null> {
        const command = new GetCommand({
            TableName: PIX_CASH_OUT_TABLE,
            Key: { id }
        });

        const response = await docClient.send(command);
        return response.Item as PixCashOut || null;
    }

    async UpdatePixCashOut(id: string, status: string): Promise<void> {
        const now = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: PIX_CASH_OUT_TABLE,
            Key: { id },
            UpdateExpression: 'SET #status = :status, #processedAt = :processedAt',
            ExpressionAttributeNames:  {
                '#status': 'status',
                '#processedAt': 'processedAt'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':processedAt': now
            }
        });

        await docClient.send(command);
    }

    async listPixCashOuts(): Promise<PixCashOut[]> { //chama lista dos cashOut
        const command = new ScanCommand({
            TableName: PIX_CASH_OUT_TABLE
        });

        const response = await docClient.send(command);
        return (response.Items || []) as PixCashOut[];
    }
    //metodos de listar as transaçoẽs

    async listTransactions(): Promise<any[]> {
        const qrCodes = await this.listPixQRCodes();
        const cashOuts = await this.listPixCashOuts();

        const transactions = [
            ...qrCodes.map(qr => ({ //todos
                id: qr.id,
                value: qr.value,
                status: qr.status,
                type: 'cashin',
                createdAt: qr.createdAt,
                processedAt: qr.processedAt,
            })),
            ...cashOuts.map(co => ({ //todos
                id: co.id,
                value: co.value,
                status: co.status,
                type: 'cashout',
                createdAt: co.createdAt,
                processedAt: co.processedAt,
            }))
        ];

        return transactions;
    }
}