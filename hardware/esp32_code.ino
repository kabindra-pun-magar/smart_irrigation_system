#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define RAINPIN 34
#define LDRPIN 35

const char* ssid = "YourWiFi";
const char* password = "YourPassword";
String server = "http://YOUR_COMPUTER_IP:5000/predict";  // Flask backend

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  dht.begin();
  pinMode(RAINPIN, INPUT);
  pinMode(LDRPIN, INPUT);
}

void loop() {
  if(WiFi.status() == WL_CONNECTED) {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int rain = analogRead(RAINPIN);
    int light = analogRead(LDRPIN);

    // Sample static values for soil nutrients (replace later with real sensors)
    float nitrogen = 30.0;
    float phosphorus = 20.0;
    float potassium = 40.0;
    float ph = 6.5;

    String jsonData = "{\"nitrogen\":" + String(nitrogen) +
                      ",\"phosphorus\":" + String(phosphorus) +
                      ",\"potassium\":" + String(potassium) +
                      ",\"ph\":" + String(ph) +
                      ",\"humidity\":" + String(hum) +
                      ",\"rainfall\":" + String(rain) +
                      ",\"wind_speed\":2.5" +
                      ",\"solar_radiation\":" + String(light) + "}";

    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonData);

    if(httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error sending data");
    }

    http.end();
  }
  delay(10000); // send every 10 seconds
}
