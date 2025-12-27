# 🎯 Device Registration System - Quick Reference

## API Endpoints Cheat Sheet

### Register Device
```
POST /api/devices/register
Body: { macAddress, ipAddress?, typeHint?, firmwareVersion? }
Returns: { success, data: { id, name, deviceType, status, ... } }
```

### List All Devices
```
GET /api/devices
Returns: { success, data: [{ id, name, deviceType, status, ... }, ...] }
```

### Get Single Device
```
GET /api/devices/:id
Returns: { success, data: { id, name, deviceType, ... } }
```

### Update Device Name
```
PUT /api/devices/:id/name
Body: { name: "New Name" }
Returns: { success, message, data: updated_device }
```

### Update Device Type
```
PUT /api/devices/:id/type
Body: { deviceType: "light" | "sensor" | "actuator" }
Returns: { success, message, data: updated_device }
```

### Update Device Status
```
PUT /api/devices/:id/status
Body: { status: "online" | "offline" }
Returns: { success, message, data: updated_device }
```

### Delete Device
```
DELETE /api/devices/:id
Returns: { success, message: "Device deleted successfully" }
```

---

## ESP32 Integration (3 Steps)

### 1️⃣ Include Header
```cpp
#include "device-registration.h"
```

### 2️⃣ Configure
```cpp
const char* BACKEND_URL = "http://192.168.1.100:5000";
const char* DEVICE_TYPE = "light";  // or "sensor", "actuator"
```

### 3️⃣ Register in Setup
```cpp
void setup() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  
  registerDevice();  // That's it!
}
```

---

## Data Types

### Device Object
```typescript
{
  id: string;              // "esp32-abc123"
  name: string;            // "หลอดไฟ #1"
  deviceType: "light" | "sensor" | "actuator";
  macAddress: string;      // "AA:BB:CC:DD:EE:FF"
  ipAddress: string;       // "192.168.1.100"
  status: "online" | "offline";
  lastUpdate: string;      // ISO timestamp
  createdAt: string;       // ISO timestamp
  firmwareVersion: string; // "1.0.0"
}
```

### Registration Request
```typescript
{
  macAddress: string;      // Required ⚠️
  ipAddress?: string;      // Optional
  typeHint?: string;       // Optional (defaults to "sensor")
  firmwareVersion?: string; // Optional (defaults to "1.0.0")
}
```

---

## Auto-Name Examples

| Device Type | Count | Auto-Name |
|-------------|-------|-----------|
| Light | 1st | หลอดไฟ #1 |
| Light | 2nd | หลอดไฟ #2 |
| Sensor | 1st | เซ็นเซอร์ #1 |
| Sensor | 2nd | เซ็นเซอร์ #2 |
| Actuator | 1st | ตัวแสดง #1 |

---

## Web UI Paths

| Route | Purpose | Features |
|-------|---------|----------|
| `/dashboard/devices` | Device Management | List, Edit, Delete devices |
| `/dashboard/alerts` | Thresholds & Alerts | Configure thresholds, view alerts |
| `/dashboard/control` | Control Devices | Send commands to devices |

---

## Common cURL Tests

### Register Manually
```bash
curl -X POST http://localhost:5000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"macAddress":"AA:BB:CC:DD:EE:FF","typeHint":"light"}'
```

### Rename Device
```bash
curl -X PUT http://localhost:5000/api/devices/esp32-abc123/name \
  -H "Content-Type: application/json" \
  -d '{"name":"Kitchen Light"}'
```

### Check Status
```bash
curl http://localhost:5000/api/devices/esp32-abc123
```

### Delete Device
```bash
curl -X DELETE http://localhost:5000/api/devices/esp32-abc123
```

---

## Error Codes

| Code | Issue | Solution |
|------|-------|----------|
| 400 | Missing macAddress | Add `macAddress` to request |
| 404 | Device not found | Check device ID spelling |
| 409 | MAC already registered | Use different MAC or delete first |
| 500 | Server error | Check backend logs |

---

## Server.ts Import
```typescript
import { deviceRegistrationService } from './services/device-registration.service.js';
```

---

## Frontend Component Location
```
frontend/app/dashboard/devices/page.tsx
- Uses: Card, Table, Badge, Button, Dialog, Select
- Fetches: GET /api/devices
- Updates: PUT /api/devices/:id/*
- Deletes: DELETE /api/devices/:id
```

---

## Service Methods (Backend)

```typescript
// Register
await deviceRegistrationService.registerDevice({
  macAddress, ipAddress, typeHint, firmwareVersion
});

// Read
await deviceRegistrationService.getAllDevices();
await deviceRegistrationService.getDeviceById(deviceId);

// Update
await deviceRegistrationService.updateDeviceName(deviceId, name);
await deviceRegistrationService.updateDeviceType(deviceId, type);
await deviceRegistrationService.updateDeviceStatus(deviceId, status);

// Delete
await deviceRegistrationService.deleteDevice(deviceId);
```

---

## ESP32 Functions

```cpp
// Get Info
String getMacAddress();
String getLocalIP();

// Register
void registerDevice();

// Update
void updateDeviceStatus(String deviceId, const char* status = "online");

// Send Data
void sendSensorData(String deviceId, float temp, 
                    float humidity = 0, int brightness = 0);
```

---

## DynamoDB Table Info

| Attribute | Key Type | Index |
|-----------|----------|-------|
| id | Partition | Primary |
| deviceType | - | GSI (TypeIndex) |
| lastUpdate | - | GSI (TypeIndex) |

---

## Status Codes Returned

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Operation completed |
| 201 | Created | Device registered |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | Device doesn't exist |
| 409 | Conflict | MAC address already exists |
| 500 | Server Error | Database/service issue |

---

## Quick Troubleshooting

```
❌ Device not showing up?
✓ Check ESP32 serial output for errors
✓ Verify BACKEND_URL matches your server IP
✓ Ensure backend is running (npm run dev)

❌ Can't edit device name?
✓ Check browser console for errors
✓ Verify backend API is responding
✓ Clear browser cache and reload

❌ Device shows offline?
✓ Check ESP32 WiFi connection
✓ Verify device is sending data
✓ Check lastUpdate timestamp

❌ MAC address already registered?
✓ Device likely registered before
✓ Delete old device if desired
✓ Or restart ESP32 to use same ID
```

---

## Key Files

```
Backend Service:
  backend/services/device-registration.service.ts

Backend Routes:
  backend/server.ts (lines 748-927)

Frontend Page:
  frontend/app/dashboard/devices/page.tsx

Hardware Library:
  hardware/src/device-registration.h

Documentation:
  DEVICE_REGISTRATION.md
  ESP32_DEVICE_REGISTRATION.md
  IMPLEMENTATION_SUMMARY.md
```

---

**Remember:** 
- 🔑 **macAddress** is the unique identifier
- 🏷️ **name** can be edited anytime
- 📱 **deviceType** determines behavior in thresholds
- 🟢 **status** is auto-updated by system

**Questions?** Check DEVICE_REGISTRATION.md or ESP32_DEVICE_REGISTRATION.md

---
**Version:** 1.0.0 | **Last Updated:** January 15, 2024
