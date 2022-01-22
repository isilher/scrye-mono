#include <ArduinoBLE.h>
#include <Arduino.h>
#include <U8g2lib.h>

#ifdef U8X8_HAVE_HW_SPI
#include <SPI.h>
#endif
#ifdef U8X8_HAVE_HW_I2C
#include <Wire.h>
#endif

U8G2_SSD1306_64X32_1F_1_HW_I2C u8g2(U8G2_MIRROR, U8X8_PIN_NONE);

#define U8LOG_WIDTH 15
#define U8LOG_HEIGHT 3
uint8_t u8log_buffer[U8LOG_WIDTH*U8LOG_HEIGHT];
U8G2LOG u8g2log;

BLEService scryeService("b8d02d81-6329-ef96-8a4d-55b376d8b25a"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEStringCharacteristic messageCharacteristic("5a50528d-e5ba-4620-90ac-33e5b913684c", BLERead | BLEWrite, 128);

const int ledPin = 2; // pin to use for the LED

const int version = 7;

void u8g2_prepare(void) {
  u8g2.setFont(u8g2_font_baby_tr);
  u8g2.setFontRefHeightExtendedText();
  u8g2.setDrawColor(1);
  u8g2.setFontPosTop();
  u8g2.setFontDirection(0);

  u8g2log.begin(u8g2, U8LOG_WIDTH, U8LOG_HEIGHT, u8log_buffer);
  u8g2log.setLineHeightOffset(0);  // set extra space between lines in pixel, this can be negative
  u8g2log.setRedrawMode(1);   // 0: Update screen with newline, 1: Update screen for every char
}

void setup() {
  u8g2.begin();
  u8g2_prepare();

  Serial.begin(9600);
  while (!Serial);

  // set LED pin to output mode
  pinMode(ledPin, OUTPUT);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");

    while (1);
  }

  // set advertised name and service UUID:
  BLE.setDeviceName("SCRYE Mono");
  BLE.setLocalName("SCRYE Mono");
  BLE.setAdvertisedService(scryeService);

  // add the characteristic to the service
  scryeService.addCharacteristic(messageCharacteristic);

  // add service
  BLE.addService(scryeService);

  // set the initial value for the characeristic:
  messageCharacteristic.writeValue("");

  // start advertising
  BLE.advertise();

  Serial.println("SCRYE Mono v" + String(version));
  u8g2log.print("\fSCRYE Mono v" + String(version) + "\n");
}

void loop() {
  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();

  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());
    digitalWrite(ledPin, HIGH);         // will turn the LED on
    u8g2log.print("\fBLE connected\n");


    // while the central is still connected to peripheral:
    while (central.connected()) {
      // if the remote device wrote to the characteristic,
      // use the value to control the LED:
      if (messageCharacteristic.written()) {
        u8g2log.print(messageCharacteristic.value() + "\n");
        Serial.println("Received: " + String(messageCharacteristic.value()));
      }
    }

    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
    u8g2log.print("\f"); // Clear the screen and goto upper left corner.
    digitalWrite(ledPin, LOW);          // will turn the LED off
  }
}
