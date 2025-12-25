# Render Deployment Setup

ไอดี IoT Sensor Management ขึ้น [Render.com](https://render.com)

## 📋 Prerequisites
- GitHub account พร้อม repo นี้
- Render account
- AWS account (สำหรับ DynamoDB)

## 🚀 ขั้นตอนการตั้งค่า

### 1️⃣ Prepare GitHub Repository
```bash
git add .
git commit -m "chore: add Render config (render.yaml, .env.example)"
git push origin main
```

### 2️⃣ Create Render Services

#### A. Backend API Service
1. ไปที่ [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. เลือก **GitHub** connect
3. Select repo → `io-t-sensor-management.test`
4. ตั้งค่า:
   - **Name**: `iot-backend`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Starter (หรือ Pro ถ้า need scaling)
   - **Environment**: Node
5. **Add Environment Variables** (สำคัญ!):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: สุ่มยาว 32+ ตัวอักษร (บันทึกไว้!)
   - `JWT_REFRESH_SECRET`: สุ่มยาว 32+ ตัวอักษร
   - `AWS_REGION`: `ap-southeast-2`
   - `AWS_ACCESS_KEY_ID`: IAM key
   - `AWS_SECRET_ACCESS_KEY`: IAM secret
   - `DYNAMODB_USERS_TABLE`: `Users`
   - `DYNAMODB_DEVICE_STATUS_TABLE`: `DeviceStatus`
   - `DYNAMODB_SENSOR_DATA_TABLE`: `SensorData`
   - `FRONTEND_ORIGIN`: `https://iot-frontend.onrender.com` (จะแก้ หลังสร้าง frontend)
   - Email/IoT/S3 ENV (ถ้าใช้งาน)
6. Click **Create Web Service** → รอ deploy ~2-3 นาที

#### B. Frontend Static Site (Optional ถ้าใช้ Render)
1. **New +** → **Static Site**
2. Select repo เดียวกัน
3. ตั้งค่า:
   - **Name**: `iot-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/out`
4. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://iot-backend.onrender.com` (แก้ชื่อ backend service)
5. Click **Create Static Site**

### 3️⃣ ตรวจสอบหลังดีพลอย

#### Backend
```bash
# Health check
curl https://iot-backend.onrender.com/health
# ต้องได้ { "status": "ok", "timestamp": "..." }

# Login test
curl -X POST https://iot-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  --include  # เพื่อดู Set-Cookie
```

#### Frontend
```bash
# ตรวจว่าเปิด https://iot-frontend.onrender.com
# ลอง login ด้วยข้อมูลทดสอบ
```

### 4️⃣ Custom Domains (Optional)
1. Backend: ไป **Settings** → **Custom Domains** → Add `api.yourdomain.com`
2. Frontend: ไป **Settings** → **Custom Domains** → Add `app.yourdomain.com`
3. Update DNS records ตรงกับคำแนะนำของ Render
4. อัปเดต ENV variables:
   - Backend: `FRONTEND_ORIGIN=https://app.yourdomain.com`
   - Frontend: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

### 5️⃣ Auto-Deploy on Push
- Default: ทุกครั้ง push ไป main → Render deploy อัตโนมัติ
- ถ้าต้อง manual: ไป Render Dashboard → Service → **Deploy** button

## 🔐 Security Checklist

✅ JWT_SECRET/REFRESH_SECRET ยาว 32+ ตัว
✅ AWS credentials ใช้ IAM user dedicated (ไม่ใช้ root)
✅ DynamoDB tables มี encryption + backups
✅ FRONTEND_ORIGIN ตรงกับ frontend domain
✅ Render services มี TLS (HTTPS) อัตโนมัติ
✅ ไม่ commit JWT secrets ลง GitHub (ใช้ Render secrets)

## 🐛 Troubleshooting

### "No open ports detected"
- ตรวจว่า PORT ใน env ตรง 3000 หรือ 5000
- ตรวจ server.ts ว่า `listen(PORT, '0.0.0.0')`
- ลอง redeploy จาก Render Dashboard

### CORS error
- ตรวจว่า `FRONTEND_ORIGIN` env ตรงกับ frontend domain
- ตรวจ browser console `/api/auth/*` ได้ `Set-Cookie` หรือไม่

### DynamoDB errors
- ตรวจ AWS credentials มี permission `dynamodb:*` บน tables
- ตรวจว่า table names ตรง `DYNAMODB_*_TABLE` env vars

## 📝 Notes

- Render free tier ใช้ได้ แต่ sleep ถ้า inactive 15+ นาที
- สำหรับ production: upgrade ไป **Pro Plan** ($12/mo per service)
- Backend + Frontend total ~$24/mo (ถ้าใช้ Pro)

## 🔄 CI/CD with GitHub Actions (Advanced)

ถ้าต้องการ automatic deployment เมื่อ push ไป main:

1. สร้าง `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Render deployment
        run: |
          curl -X POST https://api.render.com/deploy/srv-<SERVICE_ID>?key=${{ secrets.RENDER_DEPLOY_KEY }}
```

2. ไปที่ Render Service → **Settings** → **API Key** → copy
3. ไปที่ GitHub → **Settings** → **Secrets** → Add `RENDER_DEPLOY_KEY`

---

ตัวอย่างอื่นๆ ดูใน [Render Docs](https://render.com/docs)
