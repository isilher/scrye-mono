import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { BleManager, State } from "react-native-ble-plx"
import { Bridge } from "./src/components"

export const bleManager = new BleManager()

export default function App() {
  const [bleState, setBleState] = useState(State.Unknown)

  // Subscribe to manager status
  useEffect(() => {
    const stateListener = bleManager.onStateChange(setBleState, true)

    return () => stateListener.remove()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 72 }}>🧐</Text>
      <Text style={{ fontSize: 32 }}>SCRYE mono</Text>
      <Text>BLE {bleState}</Text>

      {bleState === State.PoweredOn && <Bridge bleManager={bleManager} />}

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
