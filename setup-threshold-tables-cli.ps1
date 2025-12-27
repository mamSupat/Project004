# สคริปต์สร้างตาราง DynamoDB ด้วย AWS CLI
# ต้องติดตั้ง AWS CLI และ configure credentials ก่อน

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "สร้างตาราง DynamoDB ด้วย AWS CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบ AWS CLI
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ไม่พบ AWS CLI กรุณาติดตั้งก่อน: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# ตรวจสอบ AWS Credentials
Write-Host ""
Write-Host "🔍 ตรวจสอบ AWS Credentials..." -ForegroundColor Yellow
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS Credentials ถูกต้อง" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS Credentials ไม่ถูกต้อง กรุณารัน: aws configure" -ForegroundColor Red
    exit 1
}

$REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "ap-southeast-1" }
Write-Host "📍 Region: $REGION" -ForegroundColor Cyan

# ฟังก์ชันตรวจสอบตารางมีอยู่หรือไม่
function Test-TableExists {
    param([string]$TableName)
    try {
        aws dynamodb describe-table --table-name $TableName --region $REGION 2>$null | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ==================== สร้างตาราง SensorThresholds ====================
Write-Host ""
Write-Host "📝 สร้างตาราง SensorThresholds..." -ForegroundColor Yellow

if (Test-TableExists -TableName "SensorThresholds") {
    Write-Host "✅ ตาราง SensorThresholds มีอยู่แล้ว" -ForegroundColor Green
} else {
    aws dynamodb create-table `
        --table-name SensorThresholds `
        --attribute-definitions `
            AttributeName=id,AttributeType=S `
            AttributeName=deviceId,AttributeType=S `
        --key-schema `
            AttributeName=id,KeyType=HASH `
        --global-secondary-indexes `
            "[{
                \"IndexName\": \"DeviceIdIndex\",
                \"KeySchema\": [{\"AttributeName\": \"deviceId\", \"KeyType\": \"HASH\"}],
                \"Projection\": {\"ProjectionType\": \"ALL\"},
                \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
            }]" `
        --provisioned-throughput `
            ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region $REGION

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ สร้างตาราง SensorThresholds สำเร็จ!" -ForegroundColor Green
    } else {
        Write-Host "❌ ไม่สามารถสร้างตาราง SensorThresholds" -ForegroundColor Red
    }
}

# ==================== สร้างตาราง SensorNotifications ====================
Write-Host ""
Write-Host "📝 สร้างตาราง SensorNotifications..." -ForegroundColor Yellow

if (Test-TableExists -TableName "SensorNotifications") {
    Write-Host "✅ ตาราง SensorNotifications มีอยู่แล้ว" -ForegroundColor Green
} else {
    aws dynamodb create-table `
        --table-name SensorNotifications `
        --attribute-definitions `
            AttributeName=id,AttributeType=S `
            AttributeName=deviceId,AttributeType=S `
            AttributeName=timestamp,AttributeType=S `
        --key-schema `
            AttributeName=id,KeyType=HASH `
        --global-secondary-indexes `
            "[{
                \"IndexName\": \"DeviceIdIndex\",
                \"KeySchema\": [
                    {\"AttributeName\": \"deviceId\", \"KeyType\": \"HASH\"},
                    {\"AttributeName\": \"timestamp\", \"KeyType\": \"RANGE\"}
                ],
                \"Projection\": {\"ProjectionType\": \"ALL\"},
                \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
            }]" `
        --provisioned-throughput `
            ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region $REGION

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ สร้างตาราง SensorNotifications สำเร็จ!" -ForegroundColor Green
    } else {
        Write-Host "❌ ไม่สามารถสร้างตาราง SensorNotifications" -ForegroundColor Red
    }
}

# รอให้ตารางพร้อมใช้งาน
Write-Host ""
Write-Host "⏳ รอให้ตารางพร้อมใช้งาน..." -ForegroundColor Yellow
aws dynamodb wait table-exists --table-name SensorThresholds --region $REGION
aws dynamodb wait table-exists --table-name SensorNotifications --region $REGION

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ สร้างตารางเสร็จสิ้น!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "📊 ตรวจสอบตารางที่สร้าง:" -ForegroundColor Cyan
aws dynamodb list-tables --region $REGION

Write-Host ""
Write-Host "🌐 ดูตารางใน AWS Console:" -ForegroundColor Cyan
Write-Host "https://console.aws.amazon.com/dynamodb/home?region=$REGION#tables:" -ForegroundColor Blue
