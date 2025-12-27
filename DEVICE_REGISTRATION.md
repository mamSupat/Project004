# Device Registration & Management System

## Overview

The IoT Sensor Management system now includes an **automatic device registration** and **management** system. When hardware devices (like ESP32) connect to the system, they can:

1. **Auto-register** with the system
2. **Get automatically assigned names** (e.g., "หลอดไฟ #1", "เซ็นเซอร์ #1")
3. **Have their names and types edited** manually through the web interface
4. **Track online/offline status** in real-time

---

## Architecture

### Backend (Node.js/Express)

**File:** `backend/services/device-registration.service.ts`

**Key Methods:**
- `registerDevice(hardwareInfo)` - Registers new device with auto-naming
- `getAllDevices()` - Lists all registered devices
- `updateDeviceName(deviceId, name)` - Manually change device name
- `updateDeviceType(deviceId, type)` - Change device type (light/sensor/actuator)
- `updateDeviceStatus(deviceId, status)` - Update online/offline status
- `deleteDevice(deviceId)` - Remove device from system

**API Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/devices/register` | Register new device |
| GET | `/api/devices` | Get all devices |
| GET | `/api/devices/:id` | Get specific device |
| PUT | `/api/devices/:id/name` | Update device name |
| PUT | `/api/devices/:id/type` | Update device type |
| PUT | `/api/devices/:id/status` | Update device status |
| DELETE | `/api/devices/:id` | Delete device |

### Frontend (Next.js/React)

**Device Management Page:** `frontend/app/dashboard/devices/page.tsx`

**Features:**
- View all registered devices in a table
- See device status (Online/Offline)
- See device type and MAC address
- Edit device name and type with modal dialog
- Delete devices
- Refresh device list

**Route:** `/dashboard/devices`

---

## Hardware Integration (ESP32)

### Quick Start

1. **Include the registration helper:**
   ```cpp
   #include "device-registration.h"
   ```

2. **Configure your device:**
   ```cpp
   // In device-registration.h, update these:
   const char* BACKEND_URL = "http://your-server-ip:5000";  // Your backend URL
   const char* DEVICE_TYPE = "light";  // or "sensor", "actuator"
   const char* FIRMWARE_VERSION = "1.0.0";
   ```

3. **Register on startup:**
   ```cpp
   void setup() {
     Serial.begin(115200);
     
     // Connect to WiFi...
     while (WiFi.status() != WL_CONNECTED) {
       delay(500);
     }
     
     // Register device
     registerDevice();
     
     // ... rest of setup
   }
   ```

4. **Send sensor data:**
   ```cpp
   void loop() {
     // Read your sensors
     float temperature = readTemp();
     
     // Send data to backend
     sendSensorData("device-id", temperature);
   }
   ```

### Device Registration Request Format

**POST `/api/devices/register`**

```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",      // Required: Unique device identifier
  "ipAddress": "192.168.1.100",           // Optional: Device IP address
  "typeHint": "light",                    // Optional: "light", "sensor", "actuator"
  "firmwareVersion": "1.0.0"              // Optional: Firmware version
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "esp32-abc123def456",
    "name": "หลอดไฟ #1",                  // Auto-generated name
    "deviceType": "light",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "ipAddress": "192.168.1.100",
    "status": "online",
    "lastUpdate": "2024-01-15T10:30:45.000Z",
    "firmwareVersion": "1.0.0"
  }
}
```

---

## How Auto-Naming Works

When a device registers, the system **automatically generates a friendly name** based on:
1. Device type detected from `typeHint` parameter
2. Counter of how many devices of that type exist
3. Multilingual support (defaults to Thai)

### Auto-Name Examples:

**Light Devices:**
- First light: "หลอดไฟ #1" (Thai for "Light #1")
- Second light: "หลอดไฟ #2"
- Third light: "หลอดไฟ #3"

**Sensor Devices:**
- First sensor: "เซ็นเซอร์ #1" (Thai for "Sensor #1")
- Second sensor: "เซ็นเซอร์ #2"

**Actuator Devices:**
- First actuator: "ตัวแสดง #1" (Thai for "Actuator #1")

### Duplicate MAC Address Handling

If a device with the same MAC address tries to register twice:
- The second registration is **rejected**
- Returns HTTP 409 Conflict
- Existing device record is unchanged
- Device gets its previous ID and name back

---

## Manual Device Management

### Edit Device Name & Type

**Via Web Interface:**
1. Navigate to Dashboard → Devices
2. Click the **Edit** button (pencil icon) next to a device
3. Change device name and/or type
4. Click **Save Changes**

**Via API:**

Update name:
```bash
curl -X PUT http://localhost:5000/api/devices/esp32-abc123/name \
  -H "Content-Type: application/json" \
  -d '{"name": "Living Room Light"}'
```

Update type:
```bash
curl -X PUT http://localhost:5000/api/devices/esp32-abc123/type \
  -H "Content-Type: application/json" \
  -d '{"deviceType": "sensor"}'
```

### Delete Device

**Via Web Interface:**
1. Navigate to Dashboard → Devices
2. Click the **Delete** button (trash icon)
3. Confirm deletion

**Via API:**
```bash
curl -X DELETE http://localhost:5000/api/devices/esp32-abc123
```

---

## Device Status Tracking

Devices automatically track:
- **Online/Offline Status** - Updated when device sends heartbeat or data
- **Last Update Time** - Timestamp of last communication
- **IP Address** - Current IP address on network
- **MAC Address** - Unique hardware identifier

### Update Device Status from Hardware

```cpp
// Called when device connects
updateDeviceStatus("device-id", "online");

// Called when device disconnects or goes to sleep
updateDeviceStatus("device-id", "offline");
```

### Status Indicators in UI

- 🟢 **Online** - Device actively communicating
- 🔴 **Offline** - Device hasn't communicated recently

---

## Database Schema (DynamoDB)

**Table:** `DeviceStatus`

```
Partition Key: id (Device ID)
Global Secondary Index: TypeIndex (deviceType, lastUpdate)

Attributes:
- id: string                          // Device ID
- name: string                        // Display name (editable)
- deviceType: string                  // "light", "sensor", "actuator"
- macAddress: string                  // Unique identifier
- ipAddress: string                   // Current IP
- status: "online" | "offline"       // Current status
- lastUpdate: timestamp               // Last communication
- createdAt: timestamp                // Registration time
- firmwareVersion: string             // Device firmware
```

---

## Common Use Cases

### Use Case 1: New Light Fixture Connected

1. ESP32 with light control circuit powers up
2. Calls `registerDevice()` in setup
3. System auto-creates "หลอดไฟ #1" in database
4. Appears in Dashboard → Devices list
5. User can now set time-based schedules for this light

### Use Case 2: Replace Broken Sensor

1. Remove broken sensor from Device list (delete)
2. Install new sensor with same firmware
3. New sensor powers up and registers
4. Gets auto-name "เซ็นเซอร์ #1" (reusing the counter)
5. Old thresholds need to be recreated for new device

### Use Case 3: Rename Device for Clarity

1. Navigate to Dashboard → Devices
2. Click Edit on "หลอดไฟ #2"
3. Change name to "Kitchen Light"
4. Save changes
5. Device now appears as "Kitchen Light" in all dropdowns
6. Existing thresholds still apply (linked by device ID)

### Use Case 4: Change Device Type

1. Originally registered as "sensor" but actually a "light"
2. Go to Dashboard → Devices
3. Edit device and change type from "sensor" to "light"
4. Time-picker controls now available in Alerts → Threshold Settings
5. Min/max value inputs hidden for this device

---

## Troubleshooting

### Device Not Appearing in List

**Possible Causes:**
1. ESP32 not connected to WiFi
2. Backend server not running
3. Incorrect `BACKEND_URL` in device-registration.h
4. Firewall blocking port 5000

**Solution:**
- Check ESP32 serial output for registration messages
- Verify backend is running: `npm run dev` in backend/
- Test connectivity: `ping your-backend-ip`

### Duplicate Devices Registered

**Issue:** Same physical device appears multiple times

**Cause:** MAC address collision or manual duplicate registration

**Solution:**
- Delete duplicate devices manually via web interface
- Ensure MAC address is uniquely identifying the hardware

### Device Shows as Offline

**Possible Causes:**
1. Device lost WiFi connection
2. Device crashed or restarted
3. Last heartbeat timeout (>5 minutes)

**Solution:**
- Check device logs/serial output
- Verify WiFi credentials in device firmware
- Ensure device is sending periodic data/heartbeats

---

## API Response Examples

### Successful Registration
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "esp32-a1b2c3d4e5f6",
    "name": "หลอดไฟ #1",
    "deviceType": "light",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "ipAddress": "192.168.1.100",
    "status": "online",
    "lastUpdate": "2024-01-15T10:30:45Z",
    "firmwareVersion": "1.0.0"
  }
}
```

### Duplicate Device Registration (409 Conflict)
```json
{
  "success": false,
  "error": "Device with this MAC address already registered",
  "data": {
    "id": "esp32-a1b2c3d4e5f6",
    "name": "หลอดไฟ #1"
  }
}
```

### Get All Devices
```json
{
  "success": true,
  "data": [
    {
      "id": "esp32-1",
      "name": "หลอดไฟ #1",
      "deviceType": "light",
      "macAddress": "AA:BB:CC:DD:EE:FF",
      "ipAddress": "192.168.1.100",
      "status": "online",
      "lastUpdate": "2024-01-15T10:30:45Z"
    },
    {
      "id": "esp32-2",
      "name": "เซ็นเซอร์ #1",
      "deviceType": "sensor",
      "macAddress": "AA:BB:CC:DD:EE:00",
      "ipAddress": "192.168.1.101",
      "status": "offline",
      "lastUpdate": "2024-01-15T10:20:00Z"
    }
  ]
}
```

---

## Next Steps

1. ✅ Device registration endpoints implemented
2. ✅ Device management UI created
3. ⏳ Test device registration with actual ESP32
4. ⏳ Add device heartbeat/keep-alive mechanism
5. ⏳ Create notification for new device connected
6. ⏳ Implement device groups/rooms organization

---

## Files Modified/Created

| File | Type | Purpose |
|------|------|---------|
| `backend/server.ts` | Modified | Added 7 device registration API endpoints |
| `backend/services/device-registration.service.ts` | Created | Device registration business logic |
| `frontend/app/dashboard/devices/page.tsx` | Created | Device management UI |
| `hardware/src/device-registration.h` | Created | ESP32 registration helper library |
| `DEVICE_REGISTRATION.md` | Created | This documentation |

---

**Last Updated:** January 15, 2024
**Version:** 1.0.0
