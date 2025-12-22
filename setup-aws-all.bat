@echo off
echo ========================================
echo AWS Infrastructure Setup
echo ========================================
echo.
echo This will set up:
echo 1. DynamoDB Tables
echo 2. AWS IoT Core
echo 3. S3 Bucket
echo.
pause

echo.
echo [1/3] Setting up DynamoDB Tables...
powershell -ExecutionPolicy Bypass -File setup-dynamodb.ps1
echo.

echo [2/3] Setting up AWS IoT Core...
powershell -ExecutionPolicy Bypass -File setup-iot-core.ps1
echo.

echo [3/3] Setting up S3 Bucket...
powershell -ExecutionPolicy Bypass -File setup-s3.ps1
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Please update your .env file with the values shown above
pause
