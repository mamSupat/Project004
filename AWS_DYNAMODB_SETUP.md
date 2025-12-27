# 🚀 วิธีสร้างตาราง DynamoDB ใน AWS

มี 3 วิธีในการสร้างตาราง DynamoDB สำหรับระบบแจ้งเตือน

---

## 🎯 วิธีที่ 1: ใช้สคริปต์ Node.js (แนะนำ)

**ข้อดี**: ไม่ต้องติดตั้ง AWS CLI, ใช้งานง่าย

### ขั้นตอน:

1. **ตรวจสอบไฟล์ `.env`** มี AWS Credentials:
```env
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

2. **รันสคริปต์**:
```powershell
.\setup-threshold-tables.ps1
```

3. **รอให้เสร็จ** จะเห็นข้อความ:
```
✅ สร้างตาราง SensorThresholds สำเร็จ!
✅ สร้างตาราง SensorNotifications สำเร็จ!
```

---

## 💻 วิธีที่ 2: ใช้ AWS CLI

**ข้อดี**: รวดเร็ว, เหมาะกับคนที่ใช้ AWS CLI อยู่แล้ว

### ติดตั้ง AWS CLI

#### Windows:
```powershell
# ดาวน์โหลดและติดตั้ง
winget install -e --id Amazon.AWSCLI

# หรือดาวน์โหลดจาก
# https://awscli.amazonaws.com/AWSCLIV2.msi
```

#### ตรวจสอบการติดตั้ง:
```powershell
aws --version
```

### Configure AWS Credentials

```powershell
aws configure
```

กรอกข้อมูล:
```
AWS Access Key ID: your_access_key
AWS Secret Access Key: your_secret_key
Default region name: ap-southeast-1
Default output format: json
```

### รันสคริปต์สร้างตาราง

```powershell
.\setup-threshold-tables-cli.ps1
```

---

## 🖱️ วิธีที่ 3: AWS Console (Manual)

**ข้อดี**: เห็น UI ชัดเจน, เหมาะกับมือใหม่

### ขั้นตอนสร้างตาราง

#### 1. เข้า AWS Console

1. ไปที่ https://console.aws.amazon.com/dynamodb
2. Login ด้วย AWS Account
3. เลือก Region: **ap-southeast-1** (Singapore)

#### 2. สร้างตาราง SensorThresholds

1. คลิก **"Create table"**
2. กรอกข้อมูล:

**Basic Settings:**
```
Table name: SensorThresholds
Partition key: id (String)
```

**Table Settings:**
- เลือก **"Customize settings"**
- **Read/write capacity settings**: Provisioned
  - Read capacity: 5
  - Write capacity: 5

**Secondary indexes:**
1. คลิก **"Create global index"**
2. กรอก:
   ```
   Index name: DeviceIdIndex
   Partition key: deviceId (String)
   Projected attributes: All
   Read capacity: 5
   Write capacity: 5
   ```

3. คลิก **"Create index"**
4. คลิก **"Create table"**

#### 3. สร้างตาราง SensorNotifications

1. คลิก **"Create table"** อีกครั้ง
2. กรอกข้อมูล:

**Basic Settings:**
```
Table name: SensorNotifications
Partition key: id (String)
```

**Table Settings:**
- เลือก **"Customize settings"**
- **Read/write capacity settings**: Provisioned
  - Read capacity: 5
  - Write capacity: 5

**Secondary indexes:**
1. คลิก **"Create global index"**
2. กรอก:
   ```
   Index name: DeviceIdIndex
   Partition key: deviceId (String)
   Sort key: timestamp (String)
   Projected attributes: All
   Read capacity: 5
   Write capacity: 5
   ```

3. คลิก **"Create index"**
4. คลิก **"Create table"**

#### 4. รอให้ตารางพร้อมใช้งาน

- Status จะเปลี่ยนจาก **Creating** → **Active** (ประมาณ 1-2 นาที)

---

## 📋 ตรวจสอบว่าสร้างสำเร็จ

### ผ่าน AWS Console:
1. ไปที่ DynamoDB → Tables
2. ควรเห็น 2 ตาราง:
   - ✅ SensorThresholds
   - ✅ SensorNotifications

### ผ่าน AWS CLI:
```powershell
aws dynamodb list-tables --region ap-southeast-1
```

### ผ่าน Node.js:
```powershell
cd backend
node -e "
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'ap-southeast-1' });
client.send(new ListTablesCommand({})).then(data => console.log(data.TableNames));
"
```

---

## 🔧 โครงสร้างตาราง

### ตาราง 1: SensorThresholds

| Attribute | Type | Description |
|-----------|------|-------------|
| **id** | String | Primary Key (HASH) |
| deviceId | String | รหัสอุปกรณ์ |
| sensorType | String | ประเภทเซ็นเซอร์ |
| minValue | Number | ค่าต่ำสุด |
| maxValue | Number | ค่าสูงสุด |
| enabled | Boolean | เปิด/ปิดใช้งาน |
| notifyEmail | Boolean | แจ้งเตือนทาง Email |
| notifyBrowser | Boolean | แจ้งเตือนบน Browser |
| createdAt | String | วันที่สร้าง |
| updatedAt | String | วันที่อัปเดต |

**Global Secondary Index:**
- DeviceIdIndex: deviceId (HASH)

### ตาราง 2: SensorNotifications

| Attribute | Type | Description |
|-----------|------|-------------|
| **id** | String | Primary Key (HASH) |
| deviceId | String | รหัสอุปกรณ์ |
| sensorType | String | ประเภทเซ็นเซอร์ |
| currentValue | Number | ค่าปัจจุบัน |
| thresholdValue | Number | ค่าขีดจำกัด |
| thresholdType | String | min/max |
| message | String | ข้อความแจ้งเตือน |
| severity | String | ระดับความรุนแรง |
| timestamp | String | เวลาที่แจ้งเตือน |
| read | Boolean | อ่านแล้ว/ยังไม่อ่าน |

**Global Secondary Index:**
- DeviceIdIndex: deviceId (HASH), timestamp (RANGE)

---

## 💰 ค่าใช้จ่าย (Pricing)

### AWS Free Tier (ฟรีตลอดไป):
- ✅ 25 GB storage
- ✅ 25 Read Capacity Units (RCU)
- ✅ 25 Write Capacity Units (WCU)

### การตั้งค่าของเรา:
- 2 ตาราง × (5 RCU + 5 WCU) = 10 RCU + 10 WCU
- **ยังอยู่ใน Free Tier!** 🎉

---

## 🐛 แก้ไขปัญหา

### Access Denied / UnauthorizedException

**สาเหตุ**: IAM User ไม่มีสิทธิ์

**วิธีแก้**:
1. ไปที่ AWS Console → IAM → Users
2. เลือก User ที่ใช้
3. คลิก **"Add permissions"**
4. เพิ่ม Policy: **AmazonDynamoDBFullAccess**

### ตารางสร้างไม่สำเร็จ

**ตรวจสอบ**:
1. ✅ AWS Credentials ถูกต้อง
2. ✅ Region ถูกต้อง (ap-southeast-1)
3. ✅ ชื่อตารางไม่ซ้ำกับที่มีอยู่

### ตารางสร้างแล้วแต่ใช้งานไม่ได้

**รอให้ Active**:
- ต้องรอให้ Status เป็น **Active** ก่อน (1-2 นาที)

---

## 📚 ขั้นตอนถัดไป

หลังจากสร้างตารางเสร็จแล้ว:

1. **เริ่ม Backend**:
```powershell
cd backend
npm start
```

2. **เริ่ม Frontend**:
```powershell
cd frontend
npm run dev
```

3. **เข้าใช้งาน**:
- ไปที่ http://localhost:3000
- Login เข้าระบบ
- คลิก **"Alerts"** ในเมนู
- เริ่มตั้งค่าขีดจำกัด!

---

## 🔗 ลิงก์ที่เป็นประโยชน์

- [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb)
- [AWS CLI Installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

---

**สร้างโดย**: IoT Sensor Management System  
**อัปเดต**: December 2025
