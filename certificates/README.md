# AWS IoT Core Certificates

## Files for ESP32 (esp32-relay-01)

### Required for Device Connection:
- `esp32-relay-01-certificate.pem.crt` - Device certificate
- `esp32-relay-01-private.pem.key` - Private key (⚠️ KEEP SECRET)
- `AmazonRootCA1.pem` - Amazon Root CA (preferred for most devices)
- `AmazonRootCA3.pem` - Amazon Root CA (ECC alternative)

### Policy Information:
- **Policy Name**: wsn-iot-policy
- **Certificate ID**: d800b0d0f98b06f52fb628d4f28cda9af45fdd2c73cb46224afe13b736c2577e
- **Status**: Active
- **Region**: Asia Pacific (Singapore) - ap-southeast-1

## Setup Instructions

### 1. Backend ENV Configuration
Add to `backend/.env`:
```env
AWS_REGION=ap-southeast-1
AWS_IOT_ENDPOINT=<your-endpoint>.iot.ap-southeast-1.amazonaws.com
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### 2. Frontend ENV Configuration
Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_IOT_ENDPOINT=<your-endpoint>.iot.ap-southeast-1.amazonaws.com
```

### 3. ESP32 Configuration
Upload these files to your ESP32:
1. `esp32-relay-01-certificate.pem.crt`
2. `esp32-relay-01-private.pem.key`
3. `AmazonRootCA1.pem`

Configure in your Arduino/PlatformIO code:
```cpp
const char* MQTT_BROKER = "<your-endpoint>.iot.ap-southeast-1.amazonaws.com";
const int MQTT_PORT = 8883;
const char* CLIENT_ID = "esp32-relay-01";
const char* TOPIC_COMMAND = "esp32-relay-01/command";
const char* TOPIC_STATE = "esp32-relay-01/state";
```

## Security Notes
- ⚠️ **NEVER commit private keys to git**
- Add `*.key` to `.gitignore`
- Rotate certificates before expiration (Jan 1, 2050)
- Use IAM roles in production instead of access keys

## Testing
1. Use MQTT test client in AWS Console (ap-southeast-1)
2. Subscribe to `esp32-relay-01/#` wildcard topic
3. Test publish via backend API: `POST /api/iot/publish`
4. Test shadow update: `POST /api/iot/shadow`
