#include <Adafruit_NeoPixel.h>
#include "WiFi.h"
#include "HTTPClient.h"

const char *SSID = "";
const char *WiFiPassword = "";

String device_id = "";
bool light_on = false;

Adafruit_NeoPixel strip = Adafruit_NeoPixel(24, 4, NEO_GRB + NEO_KHZ800);

void setup() {
  // initialize serial:
  Serial.begin(9600);

  ConnectToWiFi();

  strip.begin();
  strip.show(); // Initialize all pixels to 'off'

  pinMode(2, OUTPUT);
}

void ConnectToWiFi()
{
 
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, WiFiPassword);
  Serial.print("Connecting to "); Serial.println(SSID);
 
  uint8_t i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print('.');
    delay(500);
 
    if ((++i % 16) == 0)
    {
      Serial.println(F(" still trying to connect"));
    }
  }
 
  Serial.print(F("Connected. My IP address is: "));
  Serial.println(WiFi.localIP());

  device_id = WiFi.macAddress();
  device_id.replace(":", "");
  device_id.toLowerCase();
  Serial.println(device_id);
}

void loop() {
  if ((WiFi.status() == WL_CONNECTED)) { //Check the current connection status
 
    HTTPClient http;
 
    http.begin("https://us-central1-loomi-3505a.cloudfunctions.net/shouldLightBeOnForDevice/" + device_id); //Specify the URL
    int httpCode = http.GET();                                        //Make the request
 
    if (httpCode > 0) { //Check for the returning code
        String payload = http.getString();
        Serial.println(httpCode);
        Serial.println(payload);
        if (payload.indexOf("true") != -1) {
          Serial.println("light on!");
          digitalWrite(2, HIGH);
          changeLEDBrightness(255);
        } else {
          Serial.println("light off!");
          digitalWrite(2, LOW);
          changeLEDBrightness(0);
        }
    } else {
      Serial.println("Error on HTTP request");
    }
 
    http.end(); //Free the resources
  }

  delay(30000);
}

void dimChange(int step_amt, int duration) {
  int num_steps = abs(255/step_amt);
  int delay_time = duration/num_steps;
  int b = step_amt > 0 ? 0 : 255;
  for (; b <= 255 && b >= 0; b += step_amt) {
    changeLEDBrightness(b);
    delay(delay_time);
  }
  changeLEDBrightness(step_amt > 0 ? 255 : 0);
}

void changeLEDBrightness(int b) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, b, b, b);
  }
  strip.show();
}
