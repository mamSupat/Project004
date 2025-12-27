# Setup AWS IoT Core - Enhanced for ESP32
# สร้าง IoT Thing และ Policy สำหรับ ESP32 devices
# =========================================
# Usage:
#   1. อัปเดต $thingName, $region ถ้าต้อง
#   2. Run: .\setup-iot-core-enhanced.ps1
#   3. ดาวน์โหลด certificates 3 ไฟล์ + Root CA
#   4. Upload ไป ESP32 ผ่าน USB/Serial (SPIFFS/LittleFS)
# =========================================

$region = "ap-southeast-2"
$thingName = "esp32-relay-01"
$policyName = "ESP32-IoT-Policy"
$certDir = "certificates"

# Create certificates directory
if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
    Write-Host "Created certificates directory: $certDir" -ForegroundColor Green
}

Write-Host "Setting up AWS IoT Core..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Region: $region" -ForegroundColor Cyan
Write-Host "Thing Name: $thingName" -ForegroundColor Cyan

# 1. Create IoT Policy
Write-Host "`n1. Creating IoT Policy: $policyName" -ForegroundColor Yellow
$policyDocument = '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect",
        "iot:Publish",
        "iot:Subscribe",
        "iot:Receive"
      ],
      "Resource": "*"
    }
  ]
}'

aws iot create-policy `
    --policy-name $policyName `
    --policy-document $policyDocument `
    --region $region 2>$null | Out-Null

Write-Host "Policy created: $policyName" -ForegroundColor Green

# 2. Create IoT Thing
Write-Host "`n2. Creating IoT Thing: $thingName" -ForegroundColor Yellow
aws iot create-thing `
    --thing-name $thingName `
    --region $region 2>$null | Out-Null

Write-Host "Thing created: $thingName" -ForegroundColor Green

# 3. Create Keys and Certificate
Write-Host "`n3. Creating certificates and keys..." -ForegroundColor Yellow
$certOutput = aws iot create-keys-and-certificate `
    --set-as-active `
    --certificate-pem-outfile "$certDir/$thingName-certificate.pem.crt" `
    --public-key-outfile "$certDir/$thingName-public.pem.key" `
    --private-key-outfile "$certDir/$thingName-private.pem.key" `
    --region $region `
    | ConvertFrom-Json

$certificateArn = $certOutput.certificateArn
Write-Host "Certificate created: $certificateArn" -ForegroundColor Green

# 3b. Download Root CA Certificate
Write-Host "`n3b. Downloading AWS Root CA certificate..." -ForegroundColor Yellow
$rootCaCertUrl = "https://www.amazontrust.com/repository/AmazonRootCA1.pem"
$rootCaCertPath = "$certDir/AmazonRootCA1.pem"
try {
    Invoke-WebRequest -Uri $rootCaCertUrl -OutFile $rootCaCertPath
    Write-Host "Root CA downloaded: $rootCaCertPath" -ForegroundColor Green
} catch {
    Write-Host "Failed to download Root CA" -ForegroundColor Red
}

# 4. Attach Policy to Certificate
Write-Host "`n4. Attaching policy to certificate..." -ForegroundColor Yellow
aws iot attach-policy `
    --policy-name $policyName `
    --target $certificateArn `
    --region $region 2>$null | Out-Null

Write-Host "Policy attached to certificate" -ForegroundColor Green

# 5. Attach Certificate to Thing
Write-Host "`n5. Attaching certificate to thing..." -ForegroundColor Yellow
aws iot attach-thing-principal `
    --thing-name $thingName `
    --principal $certificateArn `
    --region $region 2>$null | Out-Null

Write-Host "Certificate attached to thing" -ForegroundColor Green

# 6. Get IoT Endpoint
Write-Host "`n6. Getting IoT Endpoint..." -ForegroundColor Yellow
$endpoint = aws iot describe-endpoint `
    --endpoint-type iot:Data-ATS `
    --region $region `
    | ConvertFrom-Json

# 7. Create config file for ESP32
Write-Host "`n7. Creating config file for ESP32..." -ForegroundColor Yellow
$configContent = @"
// Copy this to ESP32 credentials.h

#define AWS_IOT_ENDPOINT "$($endpoint.endpointAddress)"
#define AWS_IOT_MQTT_PORT 8883

#define THING_NAME "$thingName"
#define AWS_REGION "$region"

// Certificate files to upload to SPIFFS:
// - $thingName-certificate.pem.crt
// - $thingName-private.pem.key
// - AmazonRootCA1.pem
"@

$configContent | Out-File "$certDir/ESP32_CONFIG.txt" -Encoding UTF8
Write-Host "Config file created: $certDir/ESP32_CONFIG.txt" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "AWS IoT Core setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IoT Endpoint: $($endpoint.endpointAddress)" -ForegroundColor Cyan
Write-Host "Thing Name: $thingName" -ForegroundColor Cyan
Write-Host "Region: $region" -ForegroundColor Cyan

Write-Host "`nCertificate Files Generated:" -ForegroundColor Yellow
Write-Host "   1. $thingName-certificate.pem.crt" -ForegroundColor White
Write-Host "   2. $thingName-private.pem.key" -ForegroundColor White
Write-Host "   3. AmazonRootCA1.pem" -ForegroundColor White
Write-Host "   4. ESP32_CONFIG.txt" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Green
Write-Host "   1. Upload 3 certificate files to ESP32 SPIFFS" -ForegroundColor White
Write-Host "   2. Update ESP32 WiFi credentials in code" -ForegroundColor White
Write-Host "   3. Flash ESP32 firmware" -ForegroundColor White
Write-Host "   4. Device will auto-connect to AWS IoT Core" -ForegroundColor White

Write-Host "`nEnvironment Variables (add to .env):" -ForegroundColor Yellow
Write-Host "   AWS_IOT_ENDPOINT=$($endpoint.endpointAddress)" -ForegroundColor White
Write-Host "   AWS_IOT_REGION=$region" -ForegroundColor White
Write-Host "   AWS_IOT_THING_NAME=$thingName" -ForegroundColor White
