import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQSHandler, SQSEvent } from "aws-lambda";


//configuração cliente
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

//tabela
const tableName = process.env.PIX_QR_CODES_TABLE || 'pixQrCodes';

export const handler: SQSHandler = async (event: SQSEvent) => {
    console.log('Processando evento SQS para Cash In', JSON.stringify(event));

    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body)
            console.log('Processando mensagem', JSON.stringify(body));
        
            // Verifica se a mensagem contém informações de pagamento
            if (!body.payment || !body.payment.id) {
            console.warn('Mensagem não contém informações de pagamento', JSON.stringify(body));
            continue;
            }
            let status = 'PENDING';
            if (body.event === 'PAYMENT_CONFIRMED' || body.event === 'PAYMENT_RECEIVED') {
                status = 'CONFIRMED';
            } else if (body.event === 'PAYMENT_FAILED' || body.event === 'PAYMENT_CANCELLED'){
                status = 'FAILED';
            }

            // atualizando o status do pagamento no DynamoDB
            const command = new UpdateCommand({
                TableName: tableName,
                Key: { id: body.payment.id },
                UpdateExpression: 'SET #status = :status, #processedAt = :processedAt',
                ExpressionAttributeNames: { '#status': 'status', '#processedAt': 'processedAt'},
                ExpressionAttributeValues: {':status': status, ':processedAt': new Date().toISOString() },
            });

        await docClient.send(command);
        console.log(`Atualizando status de pagamento para ${body.payment.id} para ${status}`);
        
    } catch (error) {
        console.error('Erro ao processar mensagem', error);
    }
}
    
};
