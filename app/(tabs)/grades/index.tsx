import React, { ScrollView, StyleSheet } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Typography from "@/ui/components/Typography";

export default function TabOneScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <UnderConstructionNotice />

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
