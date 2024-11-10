import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  ScrollView, Platform,
} from "react-native";
import { DeviceMotion } from "expo-sensors";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import * as Brightness from "expo-brightness";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { X } from "lucide-react-native";
import ScanIcon from "@/components/Restaurant/ScanIcon";
import type { Screen } from "@/router/helpers/types";

const BETA_THRESHOLD_LOW = -0.2;
const BETA_THRESHOLD_HIGH = -0.15;
const ANIMATION_DURATION = 500;

const RestaurantQrCode: Screen<"RestaurantQrCode"> = ({ route, navigation }) => {
  const [currentState, setCurrentState] = useState<
    "neutral" | "tiltedUp" | "tiltedDown"
  >("neutral");
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const theme = useTheme();
  const { colors } = theme;

  const qrcodes = route.params.QrCodes;
  const [activeIndex, setActiveIndex] = useState(0);
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (100));
    setActiveIndex(Math.max(0, Math.min(index, qrcodes ? qrcodes.length - 1 : 0)));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={navigation.goBack}
          style={[styles.headerButton, { backgroundColor: "#ffffff30" }]}
        >
          <X size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status !== "granted") {
          navigation.goBack();
          return;
        }
      }
      try { await Brightness.setBrightnessAsync(1); } catch (e) { console.warn("Brightness error:", e); }
    })();
    return () => { Brightness.setBrightnessAsync(0.5); };
  }, [navigation]);


  useEffect(() => {
    const subscription = DeviceMotion.addListener(({ rotation }) => {
      let newState: "neutral" | "tiltedUp" | "tiltedDown" = "neutral";

      if (!rotation || typeof rotation.beta === "undefined") {
        return;
      }

      if (rotation.beta < BETA_THRESHOLD_LOW) {
        newState = "tiltedDown";
      } else if (rotation.beta > BETA_THRESHOLD_HIGH) {
        newState = "tiltedUp";
      }

      if (newState !== currentState) {
        setCurrentState(newState);
        const finalRotation = newState === "tiltedDown" ? 180 : 0;

        opacity.value = withTiming(0, {
          duration: ANIMATION_DURATION / 2,
          easing: Easing.out(Easing.ease),
        }, () => {
          rotate.value = withTiming(finalRotation, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
          }, () => {
            opacity.value = withTiming(1, {
              duration: ANIMATION_DURATION / 2,
              easing: Easing.in(Easing.ease),
            });
          });
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentState, opacity, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.qrCodeContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={200}
          decelerationRate="fast"
          scrollEnabled={qrcodes?.length > 1}
          onScroll={handleScroll}
        >
          { qrcodes && qrcodes?.map((code, index) => (
            <View key={index} style={styles.qrCodeInnerContainer}>
              <QRCode
                value={code.toString()}
                size={170}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
          ))}
        </ScrollView>
      </View>
      { qrcodes && qrcodes.length > 1 && (
        <View style={styles.dotsContainer}>
          {qrcodes.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
      <Animated.View style={[styles.instructionContainer, animatedStyle]}>
        <ScanIcon color={colors.primary} />
        <Text style={styles.instructionText}>
          Orientez le code QR vers le scanner de la borne
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    backgroundColor: "black",
  },
  headerButton: {
    padding: 8,
    borderRadius: 50,
    margin: 5,
  },
  qrCodeContainer: {
    height: 200,
    width: 200,
    borderRadius: 15,
    marginTop: 75,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
  },
  qrCodeInnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 200,
  },
  instructionContainer: {
    marginTop: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 200,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ffffff",
  },
  inactiveDot: {
    backgroundColor: "#ffffff25",
  },
});

export default RestaurantQrCode;
