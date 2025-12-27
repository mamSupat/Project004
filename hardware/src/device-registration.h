/*
 * Device Registration Helper for IoT Sensor Management
 * 
 * This helper allows ESP32 devices to register with the IoT Management system
 * Automatically sends device info on startup or can be called manually
 * 
 * Usage:
 * - Include this file in your main.cpp
 * - Call registerDevice() in setup() after WiFi is connected
 * - Device will be assigned auto-name like "Light_001" or "Sensor_001"
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==================== Device Registration Settings ====================

// Backend server URL (update this to your server address)
const char* BACKEND_URL = "http://192.168.1.xxx:5000";  // Change to your server IP/domain

// Device type: "light", "sensor", or "actuator"
const char* DEVICE_TYPE = "light";  // Set based on your device type

// Optional: firmware version
const char* FIRMWARE_VERSION = "1.0.0";

// ==================== Helper Functions ====================

/**
 * Get the ESP32 MAC Address
 */
String getMacAddress() {
  uint8_t baseMac[6];
  esp_err_t ret = esp_efuse_mac_get_default(baseMac);
  if (ret == ESP_OK) {
    char macStr[18];
    snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
             baseMac[0], baseMac[1], baseMac[2], baseMac[3], baseMac[4], baseMac[5]);
    return String(macStr);
  }
  return "";
}

/**
 * Get the ESP32 Local IP Address
 */
String getLocalIP() {
  return WiFi.localIP().toString();
}

/**
 * Register device with the IoT Management system
 * This should be called once after WiFi is connected
 */
void registerDevice() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERROR: WiFi not connected. Cannot register device.");
    return;
  }

  HTTPClient http;
  String registrationUrl = String(BACKEND_URL) + "/api/devices/register";
  
  http.begin(registrationUrl);
  http.addHeader("Content-Type", "application/json");

  // Create registration payload
  JsonDocument doc;
  doc["macAddress"] = getMacAddress();
  doc["ipAddress"] = getLocalIP();
  doc["typeHint"] = DEVICE_TYPE;
  doc["firmwareVersion"] = FIRMWARE_VERSION;

  String payload;
  serializeJson(doc, payload);

  Serial.print("Registering device: ");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    Serial.print("Registration successful: ");
    Serial.println(response);

    // Parse response to get device ID and assigned name
    JsonDocument responseDoc;
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"]) {
      String deviceId = responseDoc["data"]["id"];
      String deviceName = responseDoc["data"]["name"];
      Serial.print("Device ID: ");
      Serial.println(deviceId);
      Serial.print("Assigned Name: ");
      Serial.println(deviceName);
      
      // Store device ID in SPIFFS or EEPROM for later use
      // (implementation depends on your storage mechanism)
    }
  } else if (httpCode == HTTP_CODE_CONFLICT) {
    // Device already registered (MAC address exists)
    String response = http.getString();
    Serial.println("Device already registered. Getting device info...");
    Serial.println(response);
  } else {
    Serial.print("Registration failed. HTTP Code: ");
    Serial.println(httpCode);
    Serial.print("Response: ");
    Serial.println(http.getString());
  }

  http.end();
}

/**
 * Update device status to "online"
 * Call this periodically or when device starts up
 */
void updateDeviceStatus(String deviceId, const char* status = "online") {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  String statusUrl = String(BACKEND_URL) + "/api/devices/" + deviceId + "/status";
  
  http.begin(statusUrl);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["status"] = status;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.PUT(payload);

  if (httpCode == HTTP_CODE_OK) {
    Serial.println("Device status updated successfully");
  } else {
    Serial.print("Failed to update device status. HTTP Code: ");
    Serial.println(httpCode);
  }

  http.end();
}

/**
 * Send sensor data to the backend
 * This can be called after reading sensor values
 */
void sendSensorData(String deviceId, float temperature, float humidity = 0, int brightness = 0) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  String dataUrl = String(BACKEND_URL) + "/api/sensor/data";
  
  http.begin(dataUrl);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["deviceId"] = deviceId;
  doc["type"] = DEVICE_TYPE;
  doc["temperature"] = temperature;
  if (humidity > 0) {
    doc["humidity"] = humidity;
  }
  if (brightness > 0) {
    doc["brightness"] = brightness;
  }
  doc["timestamp"] = millis();

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);

  if (httpCode != HTTP_CODE_OK) {
    Serial.print("Failed to send sensor data. HTTP Code: ");
    Serial.println(httpCode);
  }

  http.end();
}

// ==================== Usage Example ====================
/*
In your main.cpp setup() function:

void setup() {
  Serial.begin(115200);
  
  // ... your WiFi setup code ...
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  
  // Register device with IoT Management system
  registerDevice();
  
  // ... rest of setup ...
}

In your main loop or sensor reading section:

void loop() {
  // ... your main code ...
  
  // Example: Send temperature every 10 seconds
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 10000) {
    float tempValue = readTemperatureSensor();
    sendSensorData("your-device-id", tempValue);
    lastRead = millis();
  }
}
*/
