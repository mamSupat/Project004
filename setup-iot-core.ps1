# Setup AWS IoT Core
# สร้าง IoT Thing และ Policy สำหรับ ESP32 devices

$region = "ap-southeast-2"
$thingName = "esp32-relay-01"
$policyName = "ESP32-IoT-Policy"

Write-Host "Setting up AWS IoT Core..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Create IoT Policy
Write-Host "`n1. Creating IoT Policy: $policyName" -ForegroundColor Yellow
$policyDocument = @"
{
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
}
"@

aws iot create-policy `
    --policy-name $policyName `
    --policy-document $policyDocument `
    --region $region

# 2. Create IoT Thing
Write-Host "`n2. Creating IoT Thing: $thingName" -ForegroundColor Yellow
aws iot create-thing `
    --thing-name $thingName `
    --region $region

# 3. Create Keys and Certificate
Write-Host "`n3. Creating certificates and keys..." -ForegroundColor Yellow
$certOutput = aws iot create-keys-and-certificate `
    --set-as-active `
    --certificate-pem-outfile "certificates/$thingName-certificate.pem.crt" `
    --public-key-outfile "certificates/$thingName-public.pem.key" `
    --private-key-outfile "certificates/$thingName-private.pem.key" `
    --region $region `
    | ConvertFrom-Json

$certificateArn = $certOutput.certificateArn

Write-Host "Certificate ARN: $certificateArn" -ForegroundColor Green

# 4. Attach Policy to Certificate
Write-Host "`n4. Attaching policy to certificate..." -ForegroundColor Yellow
aws iot attach-policy `
    --policy-name $policyName `
    --target $certificateArn `
    --region $region

# 5. Attach Certificate to Thing
Write-Host "`n5. Attaching certificate to thing..." -ForegroundColor Yellow
aws iot attach-thing-principal `
    --thing-name $thingName `
    --principal $certificateArn `
    --region $region

# 6. Get IoT Endpoint
Write-Host "`n6. Getting IoT Endpoint..." -ForegroundColor Yellow
$endpoint = aws iot describe-endpoint `
    --endpoint-type iot:Data-ATS `
    --region $region `
    | ConvertFrom-Json

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ AWS IoT Core setup completed!" -ForegroundColor Green
Write-Host "`nIoT Endpoint: $($endpoint.endpointAddress)" -ForegroundColor Cyan
Write-Host "Thing Name: $thingName" -ForegroundColor Cyan
Write-Host "Certificates saved in: ./certificates/" -ForegroundColor Cyan
Write-Host "`nAdd to .env file:" -ForegroundColor Yellow
Write-Host "AWS_IOT_ENDPOINT=https://$($endpoint.endpointAddress)" -ForegroundColor White
