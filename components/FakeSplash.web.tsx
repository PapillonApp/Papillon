import { SplashScreen } from "expo-router";
import React from "react";
import { Image, View } from "react-native";

const FakeSplash = ({ isAppReady, instant }: { isAppReady: boolean; instant?: boolean }) => {
  if (instant && isAppReady) {
    SplashScreen.hideAsync();
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: "#29947A",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

export default FakeSplash;
