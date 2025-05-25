const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'sa-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function deleteAllItems(tableName) {
  console.log(`🗑️ Deletando todos os itens da tabela: ${tableName}`);
  
  try {
    let count = 0;
    let lastEvaluatedKey = undefined;
    
    do {
      const scanParams = {
        TableName: tableName,
        ProjectionExpression: 'id'
      };
      
      if (lastEvaluatedKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const scanResult = await docClient.send(new ScanCommand(scanParams));
      
      if (scanResult.Items && scanResult.Items.length > 0) {
        for (const item of scanResult.Items) {
          await docClient.send(new DeleteCommand({
            TableName: tableName,
            Key: { id: item.id }
          }));
          count++;
          console.log(`✓ Deletado item ${count}: ${item.id}`);
        }
      }
      
      lastEvaluatedKey = scanResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    console.log(`✅ Total deletado da tabela ${tableName}: ${count} itens`);
  } catch (error) {
    console.error(`❌ Erro ao deletar da tabela ${tableName}:`, error);
  }
}

async function main() {
  console.log('🧹 Iniciando limpeza completa do DynamoDB...');
  
  await deleteAllItems('PixQrCodes');
  await deleteAllItems('PixCashOut');
  
  console.log('🎉 Limpeza concluída!');
}

main();

// node delete-all-items.js
