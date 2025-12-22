# AWS Infrastructure Setup Guide

## Prerequisites
- AWS CLI installed and configured
- AWS credentials with appropriate permissions
- PowerShell (Windows)

## Quick Setup

### Option 1: Setup Everything
```bash
.\setup-aws-all.bat
```

### Option 2: Setup Individual Services

#### 1. DynamoDB Tables
```powershell
.\setup-dynamodb.ps1
```

Creates:
- **Users** - User authentication data
- **SensorData** - Time-series sensor readings
- **DeviceStatus** - Device status and relay states
- **NotificationLogs** - Notification history

#### 2. AWS IoT Core
```powershell
.\setup-iot-core.ps1
```

Creates:
- IoT Thing (esp32-relay-01)
- IoT Policy (ESP32-IoT-Policy)
- Certificates and keys for device authentication
- IoT endpoint configuration

**Output:** Certificates saved in `./certificates/` folder

#### 3. AWS S3
```powershell
.\setup-s3.ps1
```

Creates:
- S3 bucket for sensor data and logs
- Lifecycle policies (auto-delete old data)
- Folder structure:
  - `sensor-data/` - Sensor readings (90 days retention)
  - `device-logs/` - Device logs (30 days retention)
  - `backups/` - Data backups

## Backend Integration

### Environment Variables

Add to `backend/.env`:

```env
# DynamoDB
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_SENSOR_DATA_TABLE=SensorData
DYNAMODB_DEVICE_STATUS_TABLE=DeviceStatus
DYNAMODB_NOTIFICATION_LOGS_TABLE=NotificationLogs
DYNAMODB_USERS_TABLE=Users

# IoT Core
AWS_IOT_ENDPOINT=https://xxxxx-ats.iot.ap-southeast-2.amazonaws.com

# S3
S3_BUCKET_NAME=iot-sensor-data-bucket-xxxx
```

### Backend Services

#### IoT Service (`services/iot.service.ts`)
```typescript
import { publishToTopic, getThingShadow, updateThingShadow } from './services/iot.service';

// Publish message to ESP32
await publishToTopic('esp32/relay/control', { relay1: 'on', relay2: 'off' });

// Get device shadow
const shadow = await getThingShadow('esp32-relay-01');

// Update device state
await updateThingShadow('esp32-relay-01', { relay1: 'on' });
```

#### S3 Service (`services/s3.service.ts`)
```typescript
import { uploadSensorData, uploadDeviceLogs, getPresignedUrl } from './services/s3.service';

// Upload sensor data
await uploadSensorData('esp32-01', { temperature: 25, humidity: 60 });

// Upload device logs
await uploadDeviceLogs('esp32-01', 'Device started successfully');

// Get temporary download URL
const { url } = await getPresignedUrl('sensor-data/esp32-01/2025-12-21.json');
```

## Testing

### Test DynamoDB Connection
```powershell
.\test-login.ps1
```

### Test IoT Core
```bash
# Publish test message
aws iot-data publish --topic "esp32/test" --payload "Hello from AWS CLI" --region ap-southeast-2
```

### Test S3 Upload
```bash
# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

## Cleanup

### Delete DynamoDB Tables
```powershell
aws dynamodb delete-table --table-name Users --region ap-southeast-2
aws dynamodb delete-table --table-name SensorData --region ap-southeast-2
aws dynamodb delete-table --table-name DeviceStatus --region ap-southeast-2
aws dynamodb delete-table --table-name NotificationLogs --region ap-southeast-2
```

### Delete IoT Thing
```powershell
# Detach and delete certificates first
aws iot list-thing-principals --thing-name esp32-relay-01
# Then delete the thing
aws iot delete-thing --thing-name esp32-relay-01
```

### Delete S3 Bucket
```powershell
# Empty bucket first
aws s3 rm s3://your-bucket-name --recursive
# Then delete bucket
aws s3api delete-bucket --bucket your-bucket-name --region ap-southeast-2
```

## Troubleshooting

### AWS CLI Not Found
Install AWS CLI: https://aws.amazon.com/cli/

### Permission Denied
Ensure your AWS credentials have these permissions:
- DynamoDB: Full access
- IoT: Full access
- S3: Full access
- IAM: Read access (for getting account ID)

### Region Issues
All services should use the same region: `ap-southeast-2`

## Cost Estimation

**Free Tier (12 months):**
- DynamoDB: 25 GB storage + 25 RCU/WCU
- IoT Core: 250,000 messages/month
- S3: 5 GB storage + 20,000 GET requests

**After Free Tier:**
- DynamoDB: ~$1-5/month (depends on usage)
- IoT Core: ~$1-3/month
- S3: ~$0.50-2/month

## Next Steps

1. Run setup scripts
2. Update `.env` file with generated values
3. Configure ESP32 with IoT certificates
4. Start backend: `.\start-backend.ps1`
5. Test API endpoints
