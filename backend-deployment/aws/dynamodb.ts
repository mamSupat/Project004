/**
 * DynamoDB Client Configuration
 * เชื่อมต่อกับ AWS DynamoDB
 */

import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import dotenv from 'dotenv';

dotenv.config();

// สร้าง Client Configuration
const clientConfig: DynamoDBClientConfig = {
  region: process.env.AWS_REGION || "ap-southeast-2", // Sydney
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test-key-id",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test-secret-key",
  } as AwsCredentialIdentity,
};

// สร้าง DynamoDB Client
const client = new DynamoDBClient(clientConfig);

// สร้าง Document Client (ใช้งานง่ายกว่า)
export const dynamoDb = DynamoDBDocumentClient.from(client);

// Export client ทั่วไปด้วย (สำหรับ advanced operations)
export const dynamoClient = client;

export default dynamoDb;
