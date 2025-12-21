import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

// สร้าง DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2', // Sydney
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Document Client สำหรับใช้งานง่าย (แปลง format อัตโนมัติ)
export const dynamoDb = DynamoDBDocumentClient.from(client);

export default dynamoDb;
