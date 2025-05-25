"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
//configuração cliente
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
//tabela
const tableName = process.env.PIX_QR_CODES_TABLE || 'pixQrCodes';
const handler = async (event) => {
    console.log('Processando evento SQS para Cash In', JSON.stringify(event));
    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);
            console.log('Processando mensagem', JSON.stringify(body));
            // Verifica se a mensagem contém informações de pagamento
            if (!body.payment || !body.payment.id) {
                console.warn('Mensagem não contém informações de pagamento', JSON.stringify(body));
                continue;
            }
            let status = 'PENDING';
            if (body.event === 'PAYMENT_CONFIRMED' || body.event === 'PAYMENT_RECEIVED') {
                status = 'CONFIRMED';
            }
            else if (body.event === 'PAYMENT_FAILED' || body.event === 'PAYMENT_CANCELLED') {
                status = 'FAILED';
            }
            // atualizando o status do pagamento no DynamoDB
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: tableName,
                Key: { id: body.payment.id },
                UpdateExpression: 'SET #status = :status, #processedAt = :processedAt',
                ExpressionAttributeNames: { '#status': 'status', '#processedAt': 'processedAt' },
                ExpressionAttributeValues: { ':status': status, ':processedAt': new Date().toISOString() },
            });
            await docClient.send(command);
            console.log(`Atualizando status de pagamento para ${body.payment.id} para ${status}`);
        }
        catch (error) {
            console.error('Erro ao processar mensagem SQS', error);
        }
    }
};
exports.handler = handler;
