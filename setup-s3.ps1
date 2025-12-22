# Setup AWS S3 Bucket
# สร้าง S3 bucket สำหรับเก็บ sensor data และ logs

$region = "ap-southeast-2"
$bucketName = "iot-sensor-data-bucket-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Setting up AWS S3..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Create S3 Bucket
Write-Host "`n1. Creating S3 bucket: $bucketName" -ForegroundColor Yellow
aws s3api create-bucket `
    --bucket $bucketName `
    --region $region `
    --create-bucket-configuration LocationConstraint=$region

# 2. Enable versioning
Write-Host "`n2. Enabling versioning..." -ForegroundColor Yellow
aws s3api put-bucket-versioning `
    --bucket $bucketName `
    --versioning-configuration Status=Enabled `
    --region $region

# 3. Set lifecycle policy (delete old data after 90 days)
Write-Host "`n3. Setting lifecycle policy..." -ForegroundColor Yellow
$lifecyclePolicy = @"
{
  "Rules": [
    {
      "Id": "DeleteOldSensorData",
      "Status": "Enabled",
      "Prefix": "sensor-data/",
      "Expiration": {
        "Days": 90
      }
    },
    {
      "Id": "DeleteOldLogs",
      "Status": "Enabled",
      "Prefix": "device-logs/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
"@

$lifecyclePolicy | Out-File -FilePath "temp-lifecycle.json" -Encoding UTF8
aws s3api put-bucket-lifecycle-configuration `
    --bucket $bucketName `
    --lifecycle-configuration file://temp-lifecycle.json `
    --region $region
Remove-Item "temp-lifecycle.json"

# 4. Set bucket policy (allow backend access)
Write-Host "`n4. Setting bucket policy..." -ForegroundColor Yellow
$bucketPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackendAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):root"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$bucketName/*",
        "arn:aws:s3:::$bucketName"
      ]
    }
  ]
}
"@

$bucketPolicy | Out-File -FilePath "temp-policy.json" -Encoding UTF8
aws s3api put-bucket-policy `
    --bucket $bucketName `
    --policy file://temp-policy.json `
    --region $region
Remove-Item "temp-policy.json"

# 5. Create folder structure
Write-Host "`n5. Creating folder structure..." -ForegroundColor Yellow
"" | aws s3 cp - "s3://$bucketName/sensor-data/.keep"
"" | aws s3 cp - "s3://$bucketName/device-logs/.keep"
"" | aws s3 cp - "s3://$bucketName/backups/.keep"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ S3 bucket setup completed!" -ForegroundColor Green
Write-Host "`nBucket Name: $bucketName" -ForegroundColor Cyan
Write-Host "Region: $region" -ForegroundColor Cyan
Write-Host "`nAdd to .env file:" -ForegroundColor Yellow
Write-Host "S3_BUCKET_NAME=$bucketName" -ForegroundColor White
