# ESP32 Device Registration Quick Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Update Configuration

In `hardware/src/device-registration.h`, find and update these lines:

```cpp
// Change this to your backend server address
const char* BACKEND_URL = "http://192.168.1.xxx:5000";

// Set the device type
const char* DEVICE_TYPE = "light";  // or "sensor", "actuator"
```

### Step 2: Include in Your Main Code

In `hardware/src/main.cpp`, add at the top:

```cpp
#include "device-registration.h"
```

### Step 3: Call Register on Startup

In your `setup()` function, after WiFi connects:

```cpp
void setup() {
  Serial.begin(115200);
  
  // ... WiFi connection code ...
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  
  // 👇 Add this line:
  registerDevice();
  
  // ... rest of setup ...
}
```

### Step 4: Upload and Check Serial Monitor

1. Upload code to ESP32
2. Open Serial Monitor (115200 baud)
3. You should see registration message like:
   ```
   Registering device: {"macAddress":"AA:BB:CC:DD:EE:FF","ipAddress":"192.168.1.100",...}
   Registration successful: {"success":true,"data":{"id":"esp32-abc123",...}
   Device ID: esp32-abc123
   Assigned Name: หลอดไฟ #1
   ```

### Step 5: Verify in Web Interface

1. Go to `http://localhost:3000/dashboard/devices`
2. You should see your device in the list
3. Status should show as 🟢 **Online**

✅ **Done!** Your device is now registered and manageable through the web interface.

---

## 📊 Send Sensor Data

### Send Temperature Data

```cpp
float temp = 25.5;  // Your temperature reading
sendSensorData("esp32-abc123", temp);
```

### Send with Multiple Values

```cpp
float temp = 25.5;
float humidity = 60.0;
int brightness = 800;
sendSensorData("esp32-abc123", temp, humidity, brightness);
```

### Periodically Send Data

```cpp
void loop() {
  // Read sensor every 10 seconds
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 10000) {
    float temperature = readTemperature();  // Your function
    sendSensorData("esp32-abc123", temperature);
    lastRead = millis();
  }
  
  delay(100);
}
```

---

## 🔧 Complete Example Code

Here's a complete minimal example:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "device-registration.h"

// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\nStarting IoT Device...");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Register with IoT system
    registerDevice();
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void loop() {
  // Example: Read temperature sensor every 10 seconds
  static unsigned long lastRead = 0;
  
  if (millis() - lastRead > 10000) {
    if (WiFi.status() == WL_CONNECTED) {
      // Read your sensor
      float temperature = 25.5;  // Replace with actual sensor reading
      
      // Send to backend
      Serial.print("Sending temperature: ");
      Serial.println(temperature);
      // sendSensorData("your-device-id", temperature);
    }
    lastRead = millis();
  }
  
  delay(1000);
}
```

---

## 🔌 Hardware Wiring Example (Light Control)

### Components Needed:
- ESP32 dev board
- 2-channel relay module
- 5V power supply
- Light bulb or LED
- AC/DC power circuit

### Connection Diagram:
```
ESP32 Pin 26 ──────→ Relay CH1 Control
ESP32 Pin 27 ──────→ Relay CH2 Control
ESP32 GND ─────────→ Relay GND
Relay COM ─────────→ Light + (AC/DC)
Relay NO ──────────→ Light - (AC/DC)
```

### Example Control Code:
```cpp
const int RELAY_PIN_1 = 26;
const int RELAY_PIN_2 = 27;

void setup() {
  pinMode(RELAY_PIN_1, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  digitalWrite(RELAY_PIN_1, LOW);  // OFF initially
  digitalWrite(RELAY_PIN_2, LOW);
}

void turnLightOn() {
  digitalWrite(RELAY_PIN_1, HIGH);
  Serial.println("Light ON");
}

void turnLightOff() {
  digitalWrite(RELAY_PIN_1, LOW);
  Serial.println("Light OFF");
}
```

---

## ❌ Troubleshooting

### Device Not Registering?

**Check 1:** WiFi Connected?
```cpp
Serial.println(WiFi.localIP());  // Should show an IP like 192.168.1.100
```

**Check 2:** Backend Running?
```bash
# In backend folder:
npm run dev
# Should show: Server running at http://localhost:5000
```

**Check 3:** Correct Server Address?
```cpp
const char* BACKEND_URL = "http://192.168.1.xxx:5000";
// 👆 Replace xxx with your computer's IP on the network
// Find it with: ipconfig (Windows) or ifconfig (Linux/Mac)
```

**Check 4:** Serial Output
- Should see messages like:
  - "WiFi connected!"
  - "Registering device: {...}"
  - "Registration successful: {...}"

### Getting 404 Error?

- Backend might not be running
- Check if `/api/devices/register` endpoint exists
- Try `curl http://localhost:5000/api/devices` from terminal

### Getting Connection Refused?

- Backend might be running on wrong IP
- Check `BACKEND_URL` has correct IP and port 5000
- Try pinging the backend: `ping 192.168.1.xxx`

---

## 📝 Required Libraries

Make sure these are installed in PlatformIO:

```ini
# In platformio.ini:
lib_deps =
  WiFi
  HTTPClient
  ArduinoJson
```

Or install via Arduino IDE:
- Sketch → Include Library → Manage Libraries
- Search for "ArduinoJson" by Benoit Blanchon - Install

---

## 🎯 Next Steps

1. ✅ Device registers successfully
2. ✅ Appears in web interface
3. ⏳ Send sensor data periodically
4. ⏳ Set thresholds in web interface
5. ⏳ Receive alerts when thresholds exceeded
6. ⏳ Control device remotely (turn light on/off)

---

## 📞 Common Commands for Testing

### From Terminal (Linux/Mac/PowerShell):

Register a device manually:
```bash
curl -X POST http://localhost:5000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "ipAddress": "192.168.1.100",
    "typeHint": "light",
    "firmwareVersion": "1.0.0"
  }'
```

Get all devices:
```bash
curl http://localhost:5000/api/devices
```

Update device name:
```bash
curl -X PUT http://localhost:5000/api/devices/esp32-abc123/name \
  -H "Content-Type: application/json" \
  -d '{"name": "Living Room Light"}'
```

---

**Good luck! 🚀 Your device should be online in seconds!**
