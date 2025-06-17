import { Link } from "expo-router";
import React, { ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";

export default function TabOneScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <UnderConstructionNotice />

      <Link href="/calendar/item" style={{ marginTop: 20 }}>
        <View style={{ width: "100%", padding: 14, backgroundColor: "#29947A", borderRadius: 300 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              textAlign: "center",
              fontFamily: "bold"
            }}
          >Ouvrir un cours</Text>
        </View>
      </Link>

      <Link href="/calendar/modal" style={{ marginTop: 20 }}>
        <View style={{ width: "100%", padding: 14, backgroundColor: "#29947A22", borderRadius: 300 }}>
          <Text
            style={{
              color: "#29947A",
              fontSize: 16,
              textAlign: "center",
              fontFamily: "bold"
            }}
          >Ouvrir une modal</Text>
        </View>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});
