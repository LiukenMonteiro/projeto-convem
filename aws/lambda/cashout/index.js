"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
//configuração cliente
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
//tabela
const tableName = process.env.PIX_CASH_OUT_TABLE || "PixCashOut";
const handler = async (event) => {
    console.log("Processando eventos SQS para Cash Out:", JSON.stringify(event));
    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);
            console.log("Processando mensagem:", JSON.stringify(body));
            // Verifica se a mensagem contém informações de transferência
            if (!body.transfer || body.transfer.id) {
                console.warn("Mensagem não contém informações de transferência:", JSON.stringify(body));
                continue;
            }
            let status = "PENDING";
            if (body.event === "TRANSFER_CONFIRMED" || body.event === "TRANSFER_COMPLETED") {
                status = "CONFIRMED";
            }
            else if (body.event === "TRANSFER_FAILED" || body.event === "TRANSFER_CANCELLED") {
                status = "FAILED";
            }
            // Atualizando o status da transferência no DynamoDB
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: tableName,
                Key: { id: body.transfer.id },
                UpdateExpression: "SET #status = :status, #processeddAtt = :processedAt",
                ExpressionAttributeNames: { "#status": "status", "#processeddAtt": "processedAt" },
                ExpressionAttributeValues: { ":status": status, ":processedAt": new Date().toISOString() },
            });
            await docClient.send(command);
            console.log(`Atualizando status da transferência ${body.transfer.id} para ${status}`);
        }
        catch (error) {
            console.error("Erro ao processar mensagem SQS:", error);
        }
    }
};
exports.handler = handler;
