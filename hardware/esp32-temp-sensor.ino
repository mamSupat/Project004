/*
 * ESP32 - Temperature Sensor (DHT22) + LED Control
 * ส่งค่าอุณหภูมิไปยัง Backend และควบคุม LED
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ===== WiFi Configuration =====
const char* ssid = "Getzy";
const char* password = "Wipatsasicha7";

// ===== Backend API Configuration =====
const char* apiUrl = "http://YOUR_BACKEND_URL/api";

// ===== Device Configuration =====
const char* lightDeviceId = "LIGHT_001";
const char* sensorId = "TEMP_001";
const int LED_PIN = 2;
const int DHT_PIN = 4;  // GPIO4 สำหรับ DHT22

// ===== DHT Sensor =====
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// ===== Timing =====
unsigned long lastLightCheck = 0;
unsigned long lastSensorSend = 0;
const long lightCheckInterval = 2000;   // ตรวจสอบไฟทุก 2 วินาที
const long sensorSendInterval = 30000;  // ส่งข้อมูลเซ็นเซอร์ทุก 30 วินาที

bool currentLedState = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // เริ่ม DHT Sensor
  dht.begin();
  
  // เชื่อมต่อ WiFi
  connectWiFi();
  
  Serial.println("\n✅ System Ready!");
  Serial.println("📊 Checking light status every 2s");
  Serial.println("🌡️  Sending temperature every 30s");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // ตรวจสอบสถานะไฟทุก 2 วินาที
  if (currentMillis - lastLightCheck >= lightCheckInterval) {
    lastLightCheck = currentMillis;
    checkLightStatus();
  }
  
  // ส่งข้อมูลเซ็นเซอร์ทุก 30 วินาที
  if (currentMillis - lastSensorSend >= sensorSendInterval) {
    lastSensorSend = currentMillis;
    sendSensorData();
  }
  
  delay(10);
}

void connectWiFi() {
  Serial.println("\n[WiFi] Connecting...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Connected!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
  }
}

void checkLightStatus() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(apiUrl) + "/devices";
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(4096);
    
    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      JsonArray devices = doc.as<JsonArray>();
      
      for (JsonObject device : devices) {
        if (strcmp(device["deviceId"], lightDeviceId) == 0) {
          const char* status = device["status"];
          
          if (strcmp(status, "on") == 0) {
            if (!currentLedState) {
              digitalWrite(LED_PIN, HIGH);
              currentLedState = true;
              Serial.println("[LED] 💡 ON");
            }
          } else {
            if (currentLedState) {
              digitalWrite(LED_PIN, LOW);
              currentLedState = false;
              Serial.println("[LED] 💡 OFF");
            }
          }
          break;
        }
      }
    }
  }
  
  http.end();
}

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  // อ่านค่าจาก DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("[Sensor] ❌ Failed to read DHT sensor");
    return;
  }
  
  Serial.println("\n[Sensor] 📊 Reading data:");
  Serial.print("  🌡️  Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("  💧 Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  
  // ส่งข้อมูลอุณหภูมิ
  sendToBackend("TEMP_001", temperature, "°C");
  
  // ส่งข้อมูลความชื้น
  sendToBackend("HUMIDITY_001", humidity, "%");
}

void sendToBackend(const char* sensorId, float value, const char* unit) {
  HTTPClient http;
  String url = String(apiUrl) + "/sensors";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // สร้าง JSON
  DynamicJsonDocument doc(256);
  doc["sensorId"] = sensorId;
  doc["value"] = value;
  doc["unit"] = unit;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  int httpCode = http.POST(jsonPayload);
  
  if (httpCode == 200 || httpCode == 201) {
    Serial.print("[API] ✅ Sent ");
    Serial.print(sensorId);
    Serial.println(" data");
  } else {
    Serial.print("[API] ❌ Error: ");
    Serial.println(httpCode);
  }
  
  http.end();
}
