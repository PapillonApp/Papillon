import { useRouter } from "expo-router";
import { useState } from "react";
import React, { ScrollView, StyleSheet } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
    
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <Stack gap={16} hAlign="center">
        <UnderConstructionNotice />

        <Button
          title="Click Me"
          onPress={() => router.navigate("/demo")}
        />

        <Button
          title="Papillon DevMode"
          onPress={() => router.navigate("/devmode")}
        />

        <Button
          title="Load something"
          inline
          loading={loading}
          variant="outline"
          onPress={() => setLoading(!loading)}
        />
      </Stack>
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
