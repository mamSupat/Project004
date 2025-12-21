/*
 * ESP32 - 2-Channel Relay Control via HTTP
 * ดึงสถานะรีเลย์จาก Backend และควบคุม GPIO 26, 27
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== WiFi Configuration =====
const char* WIFI_SSID = "Getzy";
const char* WIFI_PASSWORD = "Wipatsasicha7";

// ===== Backend API Configuration =====
const char* STATE_URL = "http://172.20.10.2:5000/api/relay/state";
const long POLL_INTERVAL = 1000;  // ดึงสถานะทุก 1 วิ

// ===== GPIO Relay Configuration =====
#define RELAY1_PIN 26
#define RELAY2_PIN 27
#define LED_PIN 2            // On-board LED mirror

// Many 2-channel relay modules are active-LOW
// Set true if "LOW = ON", false if "HIGH = ON"
bool RELAY_ACTIVE_LOW = false;

// ===== State Tracking =====
bool relay1On = false;
bool relay2On = false;
unsigned long lastPoll = 0;

void setRelay(int pin, bool on) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(pin, on ? LOW : HIGH);
  } else {
    digitalWrite(pin, on ? HIGH : LOW);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  
  Serial.println("\n\n[Setup] ESP32 2-Channel Relay Controller");
  
  // GPIO setup
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Turn off all relays at startup
  setRelay(RELAY1_PIN, false);
  setRelay(RELAY2_PIN, false);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("[GPIO] Initialized (relays OFF)");
  
  // Connect WiFi
  connectWiFi();
  
  Serial.println("[Setup] Ready!");
}

void loop() {
  unsigned long now = millis();
  
  // Poll backend every POLL_INTERVAL ms
  if (now - lastPoll >= POLL_INTERVAL) {
    lastPoll = now;
    fetchAndApplyRelayState();
  }
  
  delay(10);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }
  
  Serial.println("\n[WiFi] Connecting to " + String(WIFI_SSID) + "...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(250);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Connected!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] ❌ Failed, will retry...");
  }
}

void fetchAndApplyRelayState() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi disconnected, skipping poll");
    return;
  }
  
  HTTPClient http;
  http.begin(STATE_URL);
  http.setTimeout(5000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.print("[HTTP] State: ");
    Serial.println(payload);
    
    // Parse JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      bool newRelay1 = doc["relay1"] | "off";
      bool newRelay2 = doc["relay2"] | "off";
      
      // Handle string or boolean
      if (doc["relay1"].is<const char*>()) {
        newRelay1 = strcmp(doc["relay1"], "on") == 0;
      } else if (doc["relay1"].is<bool>()) {
        newRelay1 = doc["relay1"].as<bool>();
      }
      
      if (doc["relay2"].is<const char*>()) {
        newRelay2 = strcmp(doc["relay2"], "on") == 0;
      } else if (doc["relay2"].is<bool>()) {
        newRelay2 = doc["relay2"].as<bool>();
      }
      
      // Apply changes only if state changed
      if (newRelay1 != relay1On) {
        relay1On = newRelay1;
        setRelay(RELAY1_PIN, relay1On);
        Serial.println(String("[Relay] CH1: ") + (relay1On ? "ON" : "OFF"));
      }
      
      if (newRelay2 != relay2On) {
        relay2On = newRelay2;
        setRelay(RELAY2_PIN, relay2On);
        Serial.println(String("[Relay] CH2: ") + (relay2On ? "ON" : "OFF"));
      }
      
      // Mirror to on-board LED (ON if any relay is ON)
      digitalWrite(LED_PIN, (relay1On || relay2On) ? HIGH : LOW);
      
    } else {
      Serial.println("[HTTP] ❌ JSON parse error");
    }
  } else {
    Serial.print("[HTTP] ❌ Error code: ");
    Serial.println(httpCode);
  }
  
  http.end();
}
