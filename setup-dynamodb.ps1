# สร้าง DynamoDB Tables สำหรับ IoT Sensor Management
# Run this script to create all required DynamoDB tables

$region = "ap-southeast-2"

Write-Host "Creating DynamoDB Tables in region: $region" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Users Table
Write-Host "`n1. Creating Users table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name Users `
    --attribute-definitions `
        AttributeName=userId,AttributeType=S `
        AttributeName=email,AttributeType=S `
    --key-schema `
        AttributeName=userId,KeyType=HASH `
    --global-secondary-indexes `
        "[{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $region

# 2. SensorData Table
Write-Host "`n2. Creating SensorData table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name SensorData `
    --attribute-definitions `
        AttributeName=deviceId,AttributeType=S `
        AttributeName=timestamp,AttributeType=N `
    --key-schema `
        AttributeName=deviceId,KeyType=HASH `
        AttributeName=timestamp,KeyType=RANGE `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $region

# 3. DeviceStatus Table
Write-Host "`n3. Creating DeviceStatus table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name DeviceStatus `
    --attribute-definitions `
        AttributeName=deviceId,AttributeType=S `
        AttributeName=timestamp,AttributeType=N `
    --key-schema `
        AttributeName=deviceId,KeyType=HASH `
        AttributeName=timestamp,KeyType=RANGE `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $region

# 4. NotificationLogs Table
Write-Host "`n4. Creating NotificationLogs table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name NotificationLogs `
    --attribute-definitions `
        AttributeName=notificationId,AttributeType=S `
        AttributeName=timestamp,AttributeType=N `
    --key-schema `
        AttributeName=notificationId,KeyType=HASH `
        AttributeName=timestamp,KeyType=RANGE `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $region

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ All tables created successfully!" -ForegroundColor Green
Write-Host "Note: Tables may take a few moments to become ACTIVE" -ForegroundColor Cyan

# List all tables
Write-Host "`nCurrent DynamoDB Tables:" -ForegroundColor Yellow
aws dynamodb list-tables --region $region
