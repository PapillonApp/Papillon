import React, { memo } from "react";
import { StyleSheet, TouchableNativeFeedback, View } from "react-native";
import { useRouter } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    marginRight: 12,
    marginLeft: -6,
    marginBottom: -3,
    overflow: "hidden",
  },
});

const AndroidBackButton = () => {
  const router = useRouter();

  return (
    <TouchableNativeFeedback
      onPress={router.back}
      useForeground
    >
      <View style={styles.container}>
        <Icon size={26}>
          <Papicons name="arrowleft" />
        </Icon>
      </View>
    </TouchableNativeFeedback>
  );
};

export default memo(AndroidBackButton);