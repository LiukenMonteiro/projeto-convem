import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../config/aws";

export class SQSService {
    async sendMessage(queueUrl: string, message: any): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        });

        await sqsClient.send(command);
    }
}