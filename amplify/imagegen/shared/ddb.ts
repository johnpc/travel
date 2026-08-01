/**
 * DynamoDB edge: persist the generated image key onto the Destination row
 * (impure; mocked in handler tests). The Lambda writes straight to the table
 * under its IAM role, bypassing AppSync (mirrors the reference stack).
 * DESTINATION_TABLE is injected by backend.ts.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/** Set imagePath on a Destination row by id. */
export async function setDestinationImage(
  table: string,
  id: string,
  imagePath: string,
): Promise<void> {
  await doc.send(
    new UpdateCommand({
      TableName: table,
      Key: { id },
      UpdateExpression: 'SET imagePath = :p, updatedAt = :u',
      ExpressionAttributeValues: { ':p': imagePath, ':u': new Date().toISOString() },
    }),
  );
}
