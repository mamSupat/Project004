# สคริปต์สำหรับสร้างตาราง DynamoDB สำหรับระบบแจ้งเตือน

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "สร้างตาราง DynamoDB สำหรับระบบแจ้งเตือน" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่าอยู่ในโฟลเดอร์ backend หรือไม่
if (-not (Test-Path "backend")) {
    Write-Host "❌ กรุณารันสคริปต์นี้จากโฟลเดอร์หลักของโปรเจค" -ForegroundColor Red
    exit 1
}

# เข้าไปยังโฟลเดอร์ backend
Set-Location backend

# ตรวจสอบว่ามี Node.js และ npm
Write-Host "🔍 ตรวจสอบ Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js ก่อน" -ForegroundColor Red
    exit 1
}

# ตรวจสอบว่ามีไฟล์ .env
if (-not (Test-Path "../.env")) {
    Write-Host "⚠️  ไม่พบไฟล์ .env กรุณาสร้างไฟล์ .env ก่อน" -ForegroundColor Yellow
    Write-Host "ตัวอย่างค่าที่ต้องการ:" -ForegroundColor Yellow
    Write-Host "  AWS_REGION=ap-southeast-1" -ForegroundColor Gray
    Write-Host "  AWS_ACCESS_KEY_ID=your_access_key" -ForegroundColor Gray
    Write-Host "  AWS_SECRET_ACCESS_KEY=your_secret_key" -ForegroundColor Gray
    exit 1
}

# Compile TypeScript
Write-Host ""
Write-Host "📦 Compiling TypeScript..." -ForegroundColor Yellow
npx tsc scripts/setup-threshold-tables.ts --module ES2022 --target ES2022 --moduleResolution node

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ การ compile TypeScript ล้มเหลว" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# รันสคริปต์
Write-Host ""
Write-Host "🚀 กำลังสร้างตาราง DynamoDB..." -ForegroundColor Yellow
node scripts/setup-threshold-tables.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ สร้างตารางเสร็จสิ้น!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📝 ขั้นตอนต่อไป:" -ForegroundColor Cyan
    Write-Host "1. เริ่มต้น Backend Server: npm start" -ForegroundColor White
    Write-Host "2. เข้าไปที่หน้า Dashboard -> Alerts" -ForegroundColor White
    Write-Host "3. ตั้งค่าขีดจำกัดสำหรับเซ็นเซอร์ต่างๆ" -ForegroundColor White
    Write-Host "4. ระบบจะแจ้งเตือนอัตโนมัติเมื่อค่าเกินขีดจำกัด" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ เกิดข้อผิดพลาดในการสร้างตาราง" -ForegroundColor Red
}

# กลับไปยังโฟลเดอร์หลัก
Set-Location ..
