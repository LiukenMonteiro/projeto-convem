import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PIX_CASH_OUT_TABLE, PIX_QR_CODES_TABLE } from "../config/aws";
import { PixQRCode } from "../models/PixCashOut";

//metodos do pixQRCOde
export class DynamoDBService {
    async createdPixQRCode(qrCode: PixQRCode): Promise<void> {
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
    
}