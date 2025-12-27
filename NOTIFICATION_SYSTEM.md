# ระบบแจ้งเตือน (Notification & Alert System)

## 📋 ภาพรวม

ระบบแจ้งเตือนอัตโนมัติที่ตรวจสอบค่าเซ็นเซอร์และแจ้งเตือนเมื่อค่าที่วัดได้เกินค่าที่กำหนด (Threshold) ผ่าน Email และ Browser Notification

## ✨ คุณสมบัติ

- ✅ ตั้งค่าขีดจำกัด (Min/Max) สำหรับเซ็นเซอร์แต่ละประเภท
- ✅ รองรับหลายประเภทเซ็นเซอร์: อุณหภูมิ, ความชื้น, แสง, PM2.5, ฝน
- ✅ แจ้งเตือนผ่าน Email และ Browser Notification
- ✅ แสดงประวัติการแจ้งเตือนทั้งหมด
- ✅ ระดับความรุนแรง: Info, Warning, Error, Critical
- ✅ ตรวจสอบค่าเซ็นเซอร์แบบ Real-time

## 🚀 การติดตั้ง

### 1. สร้างตาราง DynamoDB

```powershell
# รันสคริปต์สร้างตาราง
.\setup-threshold-tables.ps1
```

ตารางที่จะถูกสร้าง:
- `SensorThresholds` - เก็บค่าขีดจำกัดของเซ็นเซอร์
- `SensorNotifications` - เก็บประวัติการแจ้งเตือน

### 2. ตั้งค่า Environment Variables

เพิ่มค่าเหล่านี้ใน `.env`:

```env
# DynamoDB Tables
DYNAMODB_THRESHOLDS_TABLE=SensorThresholds
DYNAMODB_NOTIFICATIONS_TABLE=SensorNotifications

# Email สำหรับรับการแจ้งเตือน
ADMIN_EMAIL=your-email@example.com
```

### 3. เริ่มต้น Backend Server

```powershell
cd backend
npm start
```

### 4. เริ่มต้น Frontend

```powershell
cd frontend
npm run dev
```

## 📱 การใช้งาน

### เข้าถึงหน้าจัดการแจ้งเตือน

1. เข้าสู่ระบบ Dashboard
2. ไปที่เมนู **"ระบบแจ้งเตือน"** หรือ `/dashboard/alerts`

### ตั้งค่าขีดจำกัด (Threshold)

#### 1. เลือกอุปกรณ์
- กรอก Device ID ที่ต้องการตั้งค่า (เช่น `ESP32_001`)

#### 2. เพิ่มค่าขีดจำกัดใหม่
1. เลือกประเภทเซ็นเซอร์ (อุณหภูมิ, ความชื้น, ฯลฯ)
2. กำหนดค่าต่ำสุด (Min) หรือค่าสูงสุด (Max)
3. เลือกช่องทางการแจ้งเตือน:
   - ✉️ Email Notification
   - 🔔 Browser Notification
4. กด **"เพิ่มค่าขีดจำกัด"**

#### 3. จัดการค่าขีดจำกัด
- **เปิด/ปิด**: เปิดหรือปิดการใช้งานแจ้งเตือน
- **ลบ**: ลบค่าขีดจำกัด

### ดูการแจ้งเตือน

1. ไปที่แท็บ **"การแจ้งเตือน"**
2. ดูรายการแจ้งเตือนทั้งหมด พร้อมข้อมูล:
   - ระดับความรุนแรง (Critical, Error, Warning, Info)
   - อุปกรณ์ที่แจ้งเตือน
   - ค่าปัจจุบัน vs ค่าที่กำหนด
   - เวลาที่แจ้งเตือน

3. การจัดการ:
   - ✅ ทำเครื่องหมายว่าอ่านแล้ว
   - 🗑️ ลบการแจ้งเตือน

### เปิดใช้งาน Browser Notification

1. คลิกปุ่ม **"เปิดการแจ้งเตือน"** บนหน้า Notification Center
2. อนุญาตการแจ้งเตือนใน Browser
3. ระบบจะส่งการแจ้งเตือนแบบ Real-time เมื่อค่าเกินขีดจำกัด

## 🎯 ตัวอย่างการตั้งค่า

### อุณหภูมิ (Temperature)
- **ค่าต่ำสุด**: 15°C (แจ้งเตือนเมื่ออากาศเย็นเกินไป)
- **ค่าสูงสุด**: 35°C (แจ้งเตือนเมื่ออากาศร้อนเกินไป)

### ความชื้น (Humidity)
- **ค่าต่ำสุด**: 30% (แจ้งเตือนเมื่ออากาศแห้งเกินไป)
- **ค่าสูงสุด**: 80% (แจ้งเตือนเมื่อความชื้นสูงเกินไป)

### PM2.5
- **ค่าสูงสุด**: 50 µg/m³ (แจ้งเตือนเมื่อฝุ่นมากเกินมาตรฐาน)

### แสง (Light)
- **ค่าต่ำสุด**: 100 Lux (แจ้งเตือนเมื่อแสงน้อยเกินไป)
- **ค่าสูงสุด**: 1000 Lux (แจ้งเตือนเมื่อแสงสว่างเกินไป)

## 📡 API Endpoints

### Thresholds Management

#### สร้าง Threshold
```http
POST /api/thresholds
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "sensorType": "temperature",
  "minValue": 15,
  "maxValue": 35,
  "enabled": true,
  "notifyEmail": true,
  "notifyBrowser": true
}
```

#### ดึง Thresholds ของ Device
```http
GET /api/thresholds/device/:deviceId
```

#### อัปเดต Threshold
```http
PUT /api/thresholds/:id
Content-Type: application/json

{
  "enabled": false
}
```

#### ลบ Threshold
```http
DELETE /api/thresholds/:id
```

### Notifications Management

#### ดึงการแจ้งเตือนของ Device
```http
GET /api/alerts/device/:deviceId?limit=50
```

#### ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
```http
GET /api/alerts/unread
```

#### ทำเครื่องหมายว่าอ่านแล้ว
```http
PUT /api/alerts/:id/read
```

#### ลบการแจ้งเตือน
```http
DELETE /api/alerts/:id
```

## 🔄 การทำงานของระบบ

1. **ESP32 ส่งข้อมูล** → Backend รับข้อมูลเซ็นเซอร์
2. **ตรวจสอบ Threshold** → เปรียบเทียบค่ากับขีดจำกัดที่ตั้งไว้
3. **สร้างการแจ้งเตือน** → ถ้าค่าเกินขีดจำกัด สร้าง notification
4. **ส่งการแจ้งเตือน**:
   - 📧 ส่ง Email (ถ้าเปิดใช้งาน)
   - 🔔 ส่ง Browser Notification (ถ้าเปิดใช้งาน)
5. **บันทึกประวัติ** → เก็บลง DynamoDB สำหรับดูภายหลัง

## 🎨 ระดับความรุนแรง (Severity Levels)

| Level | เงื่อนไข | สี | การแจ้งเตือน |
|-------|---------|-----|--------------|
| **Critical** | เกิน > 50% | 🔴 แดง | เสียงและ vibration |
| **Error** | เกิน 30-50% | 🟠 ส้ม | เสียงและ vibration |
| **Warning** | เกิน 10-30% | 🟡 เหลือง | เสียง |
| **Info** | เกิน < 10% | 🔵 น้ำเงิน | ปกติ |

## 💡 Tips & Best Practices

### 1. ตั้งค่าที่เหมาะสม
- อย่าตั้งค่าขีดจำกัดที่แคบเกินไป (จะแจ้งเตือนบ่อย)
- ตั้งค่าตามสภาพแวดล้อมจริง

### 2. Email Notification
- ใช้สำหรับการแจ้งเตือนที่สำคัญ (Critical, Error)
- ตั้งค่า Email ใน Environment Variables

### 3. Browser Notification
- เหมาะสำหรับการแจ้งเตือนแบบ Real-time
- ต้องเปิด Browser อยู่ตลอดเวลา

### 4. การจัดการ Notification
- ทำเครื่องหมายอ่านแล้วเป็นประจำ
- ลบการแจ้งเตือนเก่าๆ ที่ไม่ต้องการแล้ว

## 🐛 การแก้ไขปัญหา

### ไม่ได้รับการแจ้งเตือน

1. ตรวจสอบว่า Threshold ถูกเปิดใช้งาน (enabled: true)
2. ตรวจสอบว่าค่าเซ็นเซอร์เกินขีดจำกัดจริง
3. ตรวจสอบ Browser Notification Permission
4. ดู Console Log ของ Backend

### Email ไม่ส่ง

1. ตรวจสอบ `ADMIN_EMAIL` ใน `.env`
2. ตรวจสอบ Email Service Configuration

### ตาราง DynamoDB ไม่สร้าง

1. ตรวจสอบ AWS Credentials ใน `.env`
2. ตรวจสอบ AWS IAM Permissions
3. รันสคริปต์อีกครั้ง: `.\setup-threshold-tables.ps1`

## 📚 โครงสร้างไฟล์

```
backend/
├── services/
│   └── threshold.service.ts    # Logic สำหรับ Threshold & Notification
├── scripts/
│   └── setup-threshold-tables.ts  # สคริปต์สร้างตาราง

frontend/
├── app/
│   └── dashboard/
│       └── alerts/
│           └── page.tsx         # หน้าจัดการแจ้งเตือน
├── components/
│   ├── threshold-settings.tsx   # UI ตั้งค่า Threshold
│   └── notification-center.tsx  # UI แสดงการแจ้งเตือน
├── lib/
│   └── notifications.ts         # API Functions
└── types/
    └── index.ts                 # TypeScript Types

setup-threshold-tables.ps1       # สคริปต์ติดตั้ง
```

## 🔐 Security

- ✅ Authentication required สำหรับ API ทั้งหมด
- ✅ ข้อมูลถูกเก็บใน DynamoDB ที่ปลอดภัย
- ✅ Email และการแจ้งเตือนส่งเฉพาะผู้ที่มีสิทธิ์

## 🎓 เอกสารเพิ่มเติม

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Email Service Setup](./EMAIL_SETUP.md)

---

สร้างโดย IoT Sensor Management System
Last Updated: December 2025
