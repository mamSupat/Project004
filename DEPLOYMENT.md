# IoT Sensor Management - Deployment Guide

## Backend Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended)
1. **IAM Permissions Required**: elasticbeanstalk:*, ec2:*, autoscaling:*, rds:*, cloudformation:*
   - If you don't have permission, contact AWS account admin

2. **Deploy via Console**:
   - Go to https://console.aws.amazon.com/elasticbeanstalk
   - Create Application: "iot-sensor-management"
   - Create Environment: 
     - Platform: Node.js 20 running on 64bit Amazon Linux 2
     - Upload file: `backend-deployment.zip`
   
3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<your-secure-jwt-secret>
   AWS_REGION=ap-southeast-1
   AWS_ACCESS_KEY_ID=<your-access-key-from-.env>
   AWS_SECRET_ACCESS_KEY=<your-secret-key-from-.env>
   DYNAMODB_SENSOR_DATA_TABLE=SensorData
   DYNAMODB_DEVICE_STATUS_TABLE=DeviceStatus
   DYNAMODB_NOTIFICATION_LOGS_TABLE=NotificationLogs
   DYNAMODB_USERS_TABLE=Users
   ```

### Option 2: EC2 + Docker

#### 2a. Create EC2 Instance
```bash
# 1. Go to AWS Console > EC2 > Launch Instance
# 2. Select: Ubuntu Server 22.04 LTS
# 3. Instance Type: t3.micro (free tier eligible)
# 4. Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
# 5. Create/select key pair for SSH access
```

#### 2b. Connect to EC2 and Deploy
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Clone or upload code
git clone https://github.com/jamelswift/Project004.git
cd Project004/backend

# Build Docker image
docker build -t iot-sensor-api .

# Run container
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<your-jwt-secret-from-.env> \
  -e AWS_REGION=ap-southeast-1 \
  -e AWS_ACCESS_KEY_ID=<your-access-key> \
  -e AWS_SECRET_ACCESS_KEY=<your-secret-key> \
  -e DYNAMODB_SENSOR_DATA_TABLE=SensorData \
  -e DYNAMODB_DEVICE_STATUS_TABLE=DeviceStatus \
  -e DYNAMODB_NOTIFICATION_LOGS_TABLE=NotificationLogs \
  -e DYNAMODB_USERS_TABLE=Users \
  iot-sensor-api

# Check logs
docker logs -f <container-id>
```

### Option 3: Railway.app (Simplest)
1. Go to https://railway.app
2. Create new project
3. Connect GitHub (Project004)
4. Select backend folder
5. Set environment variables
6. Deploy (automatic from git push)

---

## Frontend Deployment

### After Backend is Deployed

1. **Get Backend URL** from deployment (e.g., `http://iot-api.elasticbeanstalk.com`)

2. **Update Frontend Environment**:
   ```
   NEXT_PUBLIC_API_URL=http://your-backend-url
   ```

3. **Redeploy Frontend to Amplify**:
   ```bash
   cd frontend
   npm run build
   # Then push to GitHub
   git push
   # Amplify will auto-deploy from main branch
   ```

---

## Update ESP32 with Production URL

Edit `hardware/esp32-light-control.ino`:
```cpp
const char* STATE_URL = "http://your-production-backend-url/api/relay/state";
```

---

## Verify Production System

1. **Test Health Check**:
   ```bash
   curl https://your-backend-url/health
   ```

2. **Test Login**:
   ```bash
   curl -X POST https://your-backend-url/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Test Relay Control**:
   ```bash
   curl -X PUT https://your-backend-url/api/relay/state \
     -H "Content-Type: application/json" \
     -d '{"state":"on"}'
   ```

4. **Check DynamoDB**:
   - Go to AWS Console > DynamoDB
   - Verify tables (SensorData, DeviceStatus, NotificationLogs, Users)
   - Check data is being logged

---

## Notes

- **JWT_SECRET**: Change to a more secure value in production
- **AWS Credentials**: Consider using IAM roles instead of access keys
- **HTTPS**: Setup SSL certificate with ACM or Let's Encrypt
- **Monitoring**: Enable CloudWatch logs for debugging

