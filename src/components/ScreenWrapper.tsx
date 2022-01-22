import React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
} from "react-native"

export const ScreenWrapper: React.FC = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          style={styles.container}
        >
          <View style={styles.container}>{children}</View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bottomSpacer: {
    height: 10,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
})
