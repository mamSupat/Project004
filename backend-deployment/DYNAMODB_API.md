# 🗄️ DynamoDB Integration - API Documentation

## 📊 ภาพรวมการเชื่อมต่อ

```
Frontend (Next.js/React)
        ↓ HTTP (fetch/axios)
Backend (Express.js API)
        ↓ AWS SDK
DynamoDB (SensorData, DeviceStatus, Users)
```

**⚠️ สำคัญ:** Frontend ห้ามต่อ DynamoDB ตรงๆ ต้องผ่าน Backend เท่านั้น (Security)

---

## 🔧 Setup & Configuration

### 1. ติดตั้ง Dependencies
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 2. ตั้งค่า AWS Credentials
แก้ไขไฟล์ `.env`:
```env
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

### 3. DynamoDB Tables Structure

#### Table: SensorData
- **Partition Key:** `deviceId` (String)
- **Sort Key:** `timestamp` (Number)
- **Attributes:** temperature, humidity, etc.

#### Table: DeviceStatus
- **Partition Key:** `deviceId` (String)
- **Attributes:** status, lastUpdate, etc.

---

## 📡 API Endpoints

### 1. GET - Sensor Data by DeviceId
```http
GET /api/dynamodb/sensor/:deviceId?limit=20
```

**ตัวอย่าง:**
```bash
curl http://localhost:5000/api/dynamodb/sensor/ESP32_001?limit=20
```

**Response:**
```json
{
  "success": true,
  "deviceId": "ESP32_001",
  "count": 20,
  "data": [
    {
      "deviceId": "ESP32_001",
      "timestamp": 1702800000000,
      "temperature": 25.5,
      "humidity": 65.2
    }
  ]
}
```

---

### 2. GET - Device Status
```http
GET /api/dynamodb/device/:deviceId
```

**ตัวอย่าง:**
```bash
curl http://localhost:5000/api/dynamodb/device/ESP32_001
```

**Response:**
```json
{
  "success": true,
  "device": {
    "deviceId": "ESP32_001",
    "status": "online",
    "lastUpdate": "2025-12-14T10:30:00Z"
  }
}
```

---

### 3. POST - Save Sensor Data
```http
POST /api/dynamodb/sensor
Content-Type: application/json
```

**Body:**
```json
{
  "deviceId": "ESP32_001",
  "temperature": 26.3,
  "humidity": 68.5
}
```

**ตัวอย่าง:**
```bash
curl -X POST http://localhost:5000/api/dynamodb/sensor \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"ESP32_001","temperature":26.3,"humidity":68.5}'
```

**Response:**
```json
{
  "success": true,
  "message": "Data saved to DynamoDB"
}
```

---

### 4. PUT - Update Device Status
```http
PUT /api/dynamodb/device/:deviceId
Content-Type: application/json
```

**Body:**
```json
{
  "status": "online"
}
```

**ตัวอย่าง:**
```bash
curl -X PUT http://localhost:5000/api/dynamodb/device/ESP32_001 \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'
```

**Response:**
```json
{
  "success": true,
  "deviceId": "ESP32_001",
  "status": "online"
}
```

---

### 5. GET - All Devices Status
```http
GET /api/dynamodb/devices
```

**ตัวอย่าง:**
```bash
curl http://localhost:5000/api/dynamodb/devices
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "devices": [
    {
      "deviceId": "ESP32_001",
      "status": "online",
      "lastUpdate": "2025-12-14T10:30:00Z"
    },
    {
      "deviceId": "ESP32_002",
      "status": "offline",
      "lastUpdate": "2025-12-14T09:15:00Z"
    }
  ]
}
```

---

## 🎨 Frontend Integration

### React/Next.js Example
```javascript
import { useState, useEffect } from 'react';

function SensorDashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูล Sensor จาก Backend
    fetch('http://localhost:5000/api/dynamodb/sensor/ESP32_001?limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSensorData(data.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Sensor Data (ESP32_001)</h2>
      {sensorData.map((item, i) => (
        <div key={i}>
          🌡️ Temp: {item.temperature}°C
          💧 Humidity: {item.humidity}%
          ⏰ Time: {new Date(item.timestamp).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 IAM Permissions Required

Backend ต้องมี IAM permissions เหล่านี้:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-2:*:table/SensorData",
        "arn:aws:dynamodb:ap-southeast-2:*:table/DeviceStatus"
      ]
    }
  ]
}
```

---

## 🧪 Testing

### 1. ทดสอบ Backend
```bash
# Start backend
cd backend
npm start

# ในอีก terminal ทดสอบ API
curl http://localhost:5000/api/dynamodb/sensor/ESP32_001
```

### 2. ดูผลใน Browser
เปิด: `http://localhost:5000/api/dynamodb/devices`

### 3. ทดสอบ Frontend
```bash
cd frontend
npm run dev
# เปิด http://localhost:3000
```

---

## ⚠️ Troubleshooting

### Error: "Missing credentials"
- ตรวจสอบ `.env` ว่ามี `AWS_ACCESS_KEY_ID` และ `AWS_SECRET_ACCESS_KEY`
- ตรวจสอบว่า credentials ถูกต้อง

### Error: 403 Forbidden
- IAM User/Role ไม่มี permission
- เพิ่ม policy ตามด้านบน

### Error: "Table not found"
- ตรวจสอบชื่อ table ใน DynamoDB Console
- ตรวจสอบ region ว่าตรงกับที่ตั้งใน `.env`

### Error: CORS
- ตรวจสอบว่า Backend เปิด CORS
- ตรวจสอบ URL ที่ Frontend เรียก

---

## 📚 Files Structure

```
backend/
├── config/
│   └── dynamodb.js           # DynamoDB client configuration
├── services/
│   └── dynamodb.service.js   # CRUD operations
├── server.js                 # API endpoints
├── .env                      # AWS credentials (ห้าม commit!)
└── .env.example              # Template
```

---

## 🚀 Next Steps

1. ✅ ทดสอบ Backend API ว่าเชื่อมต่อ DynamoDB ได้
2. ✅ ทดสอบดึงข้อมูลจาก Frontend
3. 🔄 เพิ่ม Real-time updates (WebSocket)
4. 📊 สร้าง Dashboard แสดงกราฟ
5. 🔔 เพิ่ม Alert/Notification system
