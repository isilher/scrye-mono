import React, { useEffect, useState } from "react"
import { Pressable, View, Text, TextInput } from "react-native"
import { BleManager, Device, Subscription } from "react-native-ble-plx"
import { encode } from "base-64"

const SCRYE_MONO_SERVICE = "b8d02d81-6329-ef96-8a4d-55b376d8b25a"
const MESSAGE_CHARACTERISTIC = "5a50528d-e5ba-4620-90ac-33e5b913684c"

export const Bridge: React.FC<{ bleManager: BleManager }> = ({
  bleManager,
}) => {
  const [scrye, setScrye] = useState<Device>()
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState("test")

  const updateConnection = () => {
    if (!scrye) return setConnected(false)
    scrye.isConnected().then(setConnected)
  }

  // Find SCRYE mono
  useEffect(() => {
    let disconnectedListener: Subscription

    bleManager.startDeviceScan(
      [SCRYE_MONO_SERVICE],
      {},
      (error, scannedDevice) => {
        if (error) console.error("🐙", error)
        if (scannedDevice?.localName === "SCRYE Mono") {
          setScrye(scannedDevice)

          updateConnection()

          disconnectedListener = scannedDevice.onDisconnected(() =>
            setConnected(false)
          )
        }
      }
    )

    return () => {
      bleManager.stopDeviceScan()
      if (disconnectedListener) disconnectedListener.remove()
    }
  }, [])

  return (
    <View style={{ width: "90%" }}>
      {!!scrye && !connected && (
        <Pressable
          style={{
            padding: 10,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "lightblue",
            marginVertical: 10,
          }}
          onPress={() =>
            scrye
              .connect()
              .then((connectedDevice) =>
                connectedDevice
                  .discoverAllServicesAndCharacteristics()
                  .then(updateConnection)
              )
          }
        >
          <Text>Connect</Text>
        </Pressable>
      )}

      {!!scrye && connected && (
        <>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={{
                borderColor: "blue",
                borderWidth: 1,
                flex: 1,
                marginRight: 10,
                padding: 10,
                marginVertical: 10,
              }}
              value={message}
              onChangeText={setMessage}
            />
            <Pressable
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "lightblue",
                marginVertical: 10,
              }}
              onPress={() =>
                scrye.writeCharacteristicWithResponseForService(
                  SCRYE_MONO_SERVICE,
                  MESSAGE_CHARACTERISTIC,
                  encode(message)
                )
              }
            >
              <Text>Send</Text>
            </Pressable>
          </View>

          <Pressable
            style={{
              padding: 10,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "lightblue",
              marginVertical: 10,
            }}
            onPress={() => scrye.cancelConnection().then(updateConnection)}
          >
            <Text>Disconnect</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}
