/**
 * สคริปต์สำหรับสร้างตาราง DynamoDB สำหรับระบบแจ้งเตือน
 * รัน: node backend/scripts/setup-threshold-tables.js
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
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

// ตาราง SensorThresholds
const thresholdsTableParams = {
  TableName: "SensorThresholds",
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "deviceId", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "DeviceIdIndex",
      KeySchema: [{ AttributeName: "deviceId", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

// ตาราง SensorNotifications
const notificationsTableParams = {
  TableName: "SensorNotifications",
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "deviceId", AttributeType: "S" },
    { AttributeName: "timestamp", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
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
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
}

async function createTable(params: any): Promise<void> {
  const tableName = params.TableName;
  console.log(`\n🔍 ตรวจสอบตาราง ${tableName}...`);

  const exists = await checkTableExists(tableName);

  if (exists) {
    console.log(`✅ ตาราง ${tableName} มีอยู่แล้ว`);
    return;
  }

  console.log(`📝 สร้างตาราง ${tableName}...`);
  try {
    await client.send(new CreateTableCommand(params));
    console.log(`✅ สร้างตาราง ${tableName} สำเร็จ!`);
  } catch (error: any) {
    if (error.name === "ResourceInUseException") {
      console.log(`✅ ตาราง ${tableName} มีอยู่แล้ว`);
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("🚀 เริ่มสร้างตาราง DynamoDB สำหรับระบบแจ้งเตือน");
  console.log("=".repeat(60));

  try {
    // สร้างตาราง SensorThresholds
    await createTable(thresholdsTableParams);

    // สร้างตาราง SensorNotifications
    await createTable(notificationsTableParams);

    console.log("\n" + "=".repeat(60));
    console.log("✅ สร้างตารางทั้งหมดเสร็จสิ้น!");
    console.log("=".repeat(60));

    console.log("\nตารางที่สร้าง:");
    console.log("1. SensorThresholds - เก็บค่าขีดจำกัดของเซ็นเซอร์");
    console.log("2. SensorNotifications - เก็บประวัติการแจ้งเตือน");

    console.log("\n📝 ตัวอย่างการใช้งาน:");
    console.log("- POST /api/thresholds - สร้างค่าขีดจำกัดใหม่");
    console.log("- GET /api/thresholds/device/:deviceId - ดูค่าขีดจำกัดของอุปกรณ์");
    console.log("- GET /api/alerts/device/:deviceId - ดูการแจ้งเตือนของอุปกรณ์");
    console.log("- GET /api/alerts/unread - ดูการแจ้งเตือนที่ยังไม่ได้อ่าน");
  } catch (error) {
    console.error("\n❌ เกิดข้อผิดพลาด:", error);
    process.exit(1);
  }
}

main();
