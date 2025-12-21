/*
 * ESP32 - Simple LED Control (ไม่ต้องใช้ WiFi)
 * เปิด-ปิด LED แบบอัตโนมัติด้วย delay
 */

const int LED_PIN = 2;  // GPIO2 (built-in LED บน ESP32)

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("ESP32 LED Control Started!");
  Serial.println("LED will blink every 2 seconds");
}

void loop() {
  // เปิดไฟ
  digitalWrite(LED_PIN, HIGH);
  Serial.println("💡 LED ON");
  delay(2000);  // รอ 2 วินาที
  
  // ปิดไฟ
  digitalWrite(LED_PIN, LOW);
  Serial.println("💡 LED OFF");
  delay(2000);  // รอ 2 วินาที
}
