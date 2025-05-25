import {  DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { LambdaClient } from '@aws-sdk/client-lambda';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    region: process.env.AWS_REGION || 'sa-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
};

//Meu cliente aws
const dynamoClient = new DynamoDBClient(config);
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sqsClient = new SQSClient(config);
const lambdaClient = new LambdaClient(config);

//tabelas DynamoDB
const PIX_QR_CODES_TABLE = process.env.PIX_QR_CODES_TABLE || 'pixQrCodes';
const PIX_CASH_OUT_TABLE = process.env.PIX_CASH_OUT_TABLE || 'pixCashOut';

// filas SQS
const CASH_IN_QUEUE_URL = process.env.CASH_IN_QUEUE_URL || '';
const CASH_OUT_QUEUE_URL = process.env.CASH_OUT_QUEUE_URL || '';

export {
    docClient,
    dynamoClient,
    sqsClient,
    lambdaClient,
    PIX_QR_CODES_TABLE,
    PIX_CASH_OUT_TABLE,
    CASH_IN_QUEUE_URL,
    CASH_OUT_QUEUE_URL
}
