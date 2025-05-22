import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQSHandler, SQSEvent } from "aws-lambda";

//configuração cliente
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1"});
const docClient = DynamoDBDocumentClient.from(client);

//tabela
const tableName = process.env.PIX_CASH_OUT_TABLE || "PixCashOut";

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log("Processando eventos SQS para Cash Out:", JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      console.log("Processando mensagem:", JSON.stringify(body));

      // Verifica se a mensagem contém informações de transferência
      if (!body.transfer || body.transfer.id) {
        console.warn("Mensagem não contém informações de transferência:", JSON.stringify(body));continue;
      }
      let status = "PENDING";
      if ( body.event === "TRANSFER_CONFIRMED" || body.event === "TRANSFER_COMPLETED") {
        status = "CONFIRMED";
      } else if ( body.event === "TRANSFER_FAILED" || body.event === "TRANSFER_CANCELLED" ) {
        status = "FAILED";
      }

      // Atualizando o status da transferência no DynamoDB
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id: body.transfer.id },
        UpdateExpression: "SET #status = :status, #processeddAtt = :processedAt",
        ExpressionAttributeNames: { "#status": "status", "#processeddAtt": "processedAt" },
        ExpressionAttributeValues: { ":status": status, ":processedAt": new Date().toISOString()},
      });

      await docClient.send(command);
      console.log( `Atualizando status da transferência ${body.transfer.id} para ${status}`);
    } catch (error) {
      console.error("Erro ao processar mensagem SQS:", error);
    }
  }
};
