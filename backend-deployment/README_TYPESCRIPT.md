# Backend TypeScript - IoT Sensor Management

ระบบ Backend ที่เขียนด้วย **TypeScript** สำหรับการจัดการอุปกรณ์ IoT และข้อมูล Sensor ผ่าน AWS DynamoDB

## 📁 โครงสร้างไฟล์

```
backend/
├── aws/
│   └── dynamodb.ts          # DynamoDB Client Configuration
├── services/
│   ├── sensor.service.ts    # Sensor Data Operations
│   └── device.service.ts    # Device Management Operations
├── server.ts                # Express API Server
├── tsconfig.json            # TypeScript Configuration
├── package.json             # Dependencies
├── .env                     # Environment Variables
└── .env.example             # Environment Template
```

## 🚀 Installation & Setup

### 1. ติดตั้ง Dependencies
```bash
npm install
# หรือ
pnpm install
```

### 2. ตั้งค่า Environment Variables
คัดลอก `.env.example` ไป `.env` แล้วเติม AWS Credentials:

```env
# AWS Configuration
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIA_YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY

# DynamoDB Tables
DYNAMODB_SENSOR_DATA_TABLE=SensorData
DYNAMODB_DEVICE_STATUS_TABLE=DeviceStatus
DYNAMODB_NOTIFICATION_LOGS_TABLE=NotificationLogs
DYNAMODB_USERS_TABLE=Users

# Server
PORT=5000
```

### 3. Compile TypeScript
```bash
npm run build
# หรือ watch mode:
npm run dev
```

## 📡 API Endpoints

### Sensor Data API
- `GET /api/sensor/data?deviceId=ESP32_001&limit=20` - ดึงข้อมูล Sensor
- `GET /api/sensor/all?limit=50` - ดึงข้อมูล Sensor ทั้งหมด
- `GET /api/sensor/timerange?deviceId=xxx&startTime=xxx&endTime=xxx` - ช่วงเวลา

### Device Status API
- `GET /api/device/status/:deviceId` - สถานะอุปกรณ์
- `GET /api/device/all` - อุปกรณ์ทั้งหมด
- `POST /api/device/update` - อัปเดตสถานะ
- `POST /api/device/create` - สร้างอุปกรณ์ใหม่

## 🏗️ TypeScript Features

### Type Safety
ทั้งหมดมี Type Definitions ที่ชัดเจน:
```typescript
interface SensorData {
  deviceId: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
}

interface DeviceStatus {
  deviceId: string;
  name: string;
  type: string;
  status: "on" | "off" | "online" | "offline" | string;
}
```

### Service Layer Pattern
```typescript
class SensorService {
  async getSensorData(deviceId: string, limit: number = 20): Promise<SensorData[]>
  async getAllSensorData(limit: number = 50): Promise<SensorData[]>
  async getSensorDataByTimeRange(deviceId: string, startTime: number, endTime: number): Promise<SensorData[]>
}
```

### Error Handling
```typescript
try {
  const data = await sensorService.getSensorData(deviceId, limit);
  res.json({ success: true, data });
} catch (error: any) {
  res.status(500).json({ 
    success: false, 
    error: error.message 
  });
}
```

## 🔧 Development

### Build
```bash
npm run build      # Compile TypeScript to JavaScript
npm run dev        # Development with watch mode
npm start          # Run compiled code
```

### Testing
```bash
# Test Sensor API
curl http://localhost:5000/api/sensor/data?deviceId=ESP32_001

# Test Device API
curl http://localhost:5000/api/device/all

# Health Check
curl http://localhost:5000/health
```

## 🔐 AWS IAM Permissions

DynamoDB ต้องมี Permissions นี้:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-southeast-2:*:table/*"
    }
  ]
}
```

## 📦 Dependencies

- **express** - Web Framework
- **typescript** - Type Safety
- **@aws-sdk/client-dynamodb** - AWS DynamoDB Client
- **@aws-sdk/lib-dynamodb** - DynamoDB Document Client
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment Variables

## 🎯 Best Practices

✅ **Type Safety** - ทุก function มี type annotations
✅ **Error Handling** - try-catch ทั้งหมด endpoints
✅ **Environment Config** - Credentials ผ่าน .env เท่านั้น
✅ **Service Layer** - Separation of concerns
✅ **Validation** - Check required parameters
✅ **Logging** - Console logs สำหรับ debugging

## ⚠️ Important Notes

1. **Never commit AWS Credentials** - ใช้ .env ไฟล์
2. **Frontend → Backend → DynamoDB** - ไม่ต้อง Direct connection
3. **Type Checking** - `npm run build` จะ check types
4. **Error Responses** - ทั้งหมดมี `success: boolean` field

## 🚀 Production Deployment

### AWS Lambda
```bash
npm run build
# Deploy dist/ folder to Lambda
```

### EC2 / DigitalOcean
```bash
npm install --production
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["npm", "start"]
```

## 📊 Monitoring

ตรวจสอบ CloudWatch Logs:
```bash
aws logs tail /aws/lambda/iot-sensor-api --follow
```

---

**Made with TypeScript ❤️**
