import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface TableConfig {
  name: string;
  keySchema: any[];
  attributeDefinitions: any[];
  globalSecondaryIndexes?: any[];
}

const tables: TableConfig[] = [
  {
    name: process.env.DYNAMODB_SENSOR_DATA_TABLE || "SensorData",
    keySchema: [
      { AttributeName: "sensorId", KeyType: "HASH" },
      { AttributeName: "timestamp", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "sensorId", AttributeType: "S" },
      { AttributeName: "timestamp", AttributeType: "S" },
      { AttributeName: "deviceId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "DeviceIdIndex",
        KeySchema: [
          { AttributeName: "deviceId", KeyType: "HASH" },
          { AttributeName: "timestamp", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    name: process.env.DYNAMODB_DEVICE_STATUS_TABLE || "DeviceStatus",
    keySchema: [{ AttributeName: "deviceId", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "deviceId", AttributeType: "S" },
      { AttributeName: "lastUpdate", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "LastUpdateIndex",
        KeySchema: [{ AttributeName: "lastUpdate", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    name: process.env.DYNAMODB_NOTIFICATION_LOGS_TABLE || "NotificationLogs",
    keySchema: [
      { AttributeName: "notificationId", KeyType: "HASH" },
      { AttributeName: "timestamp", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "notificationId", AttributeType: "S" },
      { AttributeName: "timestamp", AttributeType: "S" },
      { AttributeName: "deviceId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "DeviceIdTimestampIndex",
        KeySchema: [
          { AttributeName: "deviceId", KeyType: "HASH" },
          { AttributeName: "timestamp", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    name: process.env.DYNAMODB_USERS_TABLE || "Users",
    keySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "EmailIndex",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
];

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

async function createTable(config: TableConfig): Promise<void> {
  const exists = await tableExists(config.name);

  if (exists) {
    console.log(`✅ Table "${config.name}" already exists`);
    return;
  }

  console.log(`📝 Creating table "${config.name}"...`);

  const command = new CreateTableCommand({
    TableName: config.name,
    KeySchema: config.keySchema,
    AttributeDefinitions: config.attributeDefinitions,
    BillingMode: "PROVISIONED",
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: config.globalSecondaryIndexes,
  });

  try {
    await client.send(command);
    console.log(`✅ Table "${config.name}" created successfully`);
  } catch (error: any) {
    console.error(`❌ Error creating table "${config.name}":`, error.message);
    throw error;
  }
}

async function setupDynamoDB(): Promise<void> {
  console.log("🚀 Starting DynamoDB table setup...\n");
  console.log(`Region: ${process.env.AWS_REGION || "ap-southeast-1"}`);
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log("");

  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const table of tables) {
    try {
      const exists = await tableExists(table.name);
      if (exists) {
        existing++;
      } else {
        await createTable(table);
        created++;
      }
    } catch (error) {
      failed++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`✅ Created: ${created}`);
  console.log(`♻️  Already existed: ${existing}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n⚠️  Some tables failed to create. Check AWS credentials and permissions.");
    process.exit(1);
  } else {
    console.log("\n🎉 All DynamoDB tables are ready!");
  }
}

setupDynamoDB().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});
