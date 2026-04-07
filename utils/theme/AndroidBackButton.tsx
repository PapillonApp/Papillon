import React, { memo, useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useNavigation } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable } from "@/ui/components/NativeHeader";

export const AndroidBackButtonStyles = StyleSheet.create({
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
  if(Platform.OS !== "android") return null;
  const navigation = useNavigation();
  const handlePress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <NativeHeaderPressable onPressIn={handlePress}>
      <View style={AndroidBackButtonStyles.container}>
        <Icon size={26}>
          <Papicons name="arrowleft" />
        </Icon>
      </View>
    </NativeHeaderPressable>
  );
};

export default memo(AndroidBackButton);