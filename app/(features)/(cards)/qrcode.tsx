import Barcode, { Format } from "@aramir/react-native-barcode";
import { Phone } from "@getpapillon/papicons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import Reanimated, {
  FlipInEasyX,
  runOnJS,
  useSharedValue,
  withSpring,
  ZoomInDown,
} from "react-native-reanimated";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { Services } from "@/stores/account/types";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

export default function QRCodePage() {

  const search = useLocalSearchParams();
  const qr = String(search.qrcode);
  const type = String(search.type || "QR");
  const service = Number(search.service || Services.TURBOSELF);

  const { t } = useTranslation();

  const translationY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const finalTranslation = Dimensions.get("window").height / 2;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translationY.value = e.translationY < 0 ? e.translationY / 10 : e.translationY;
      if (e.translationY < 0) { return; }
      opacity.value = 1 - Math.min(Math.abs(e.translationY) / 300, 0.7);
      scale.value = 1 - Math.min(Math.abs(e.translationY) / 600, 0.4);
    })
    .onEnd((e) => {
      if (e.translationY > 150) {
        translationY.value = withSpring(finalTranslation, { damping: 150, stiffness: 1500 });
        opacity.value = withSpring(0, { damping: 150, stiffness: 1500 });
        scale.value = withSpring(0.6, { damping: 150, stiffness: 1500 });
        setTimeout(() => {
          runOnJS(router.back)();
        }, 200);
        return;
      }
      translationY.value = withSpring(0, { damping: 150, stiffness: 1500 });
      opacity.value = withSpring(1, { damping: 150, stiffness: 1500 });
      scale.value = withSpring(1, { damping: 150, stiffness: 1500 });
    });


  return (
    <GestureDetector
      gesture={panGesture}
    >
      <BlurView style={{ flex: 1, backgroundColor: Platform.OS === "ios" ? undefined : "#000" }}
        tint={"dark"}
      >
        <Reanimated.View
          entering={ZoomInDown.springify()}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            transform: [{ translateY: translationY }, { scale: scale }],
            opacity: opacity,
            padding: 20,
          }}
        >
          <Reanimated.View
            style={{
              aspectRatio: 1,
              width: "100%",
              backgroundColor: "#FFF",
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
              shadowRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              borderRadius: 25,
            }}
            entering={FlipInEasyX.springify().delay(100)}
          >
            {type === "QR" ? (
              <QRCode
                value={qr}
                size={Dimensions.get("window").width * 0.8}
                backgroundColor={"transparent"}
                color={"#000"}
              />
            ) : (
              <Barcode
                value={qr}
                format={type as Format}
                background={"transparent"}
              />
            )}
          </Reanimated.View>

          <Stack
            style={{ width: 240 }}
            hAlign="center"
          >
            <Phone fill={"#FFFFFF"} />
            <Typography variant="body2"
              align="center"
              color="#FFFFFF"
            >{t("Profile_Cards_Scan_Orientation")}</Typography>
          </Stack>
        </Reanimated.View>
        <OnboardingBackButton icon={"Cross"}
          position={"right"}
        />
      </BlurView>
    </GestureDetector>
  );
}