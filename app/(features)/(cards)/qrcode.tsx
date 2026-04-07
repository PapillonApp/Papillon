import Barcode, { Format } from "@aramir/react-native-barcode";
import { Phone } from "@getpapillon/papicons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import Reanimated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { getEDClassName } from "@/services/ecoledirecte/qrcode";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Avatar from "@/ui/components/Avatar";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { getInitials } from "@/utils/chats/initials";
import {
  ANONYMOUS_PROFILE_BLUR_RADIUS,
  getDisplayInitials,
  getDisplayPersonName,
  useAnonymousMode,
} from "@/utils/privacy/anonymize";

export default function QRCodePage() {

  const search = useLocalSearchParams();
  const qr = String(search.qrcode);
  const type = String(search.type || "QR");
  const service = Number(search.service || Services.TURBOSELF);
  const clientId = String(search.clientId || "");

  const { t } = useTranslation();
  const anonymousMode = useAnonymousMode();
  const accounts = useAccountStore((state) => state.accounts);
  const account = useMemo(
    () => accounts.find((item) => item.services.some((entry) => entry.id === clientId)),
    [accounts, clientId]
  );
  const serviceAccount = useMemo(
    () => account?.services.find((entry) => entry.id === clientId),
    [account, clientId]
  );
  const displayName = useMemo(
    () => getDisplayPersonName(account?.firstName, account?.lastName, anonymousMode),
    [account?.firstName, account?.lastName, anonymousMode]
  );
  const displayInitials = useMemo(
    () =>
      getDisplayInitials(
        getInitials(`${account?.firstName ?? ""} ${account?.lastName ?? ""}`),
        anonymousMode
      ),
    [account?.firstName, account?.lastName, anonymousMode]
  );
  const displayClassName =
    account?.className ?? getEDClassName(serviceAccount?.auth.additionals);
  const displayProfilePicture = account?.customisation?.profilePicture;
  const showEDBadgeHeader =
    service === Services.ECOLEDIRECTE && Boolean(displayName || displayClassName);

  const translationY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const introContainer = useSharedValue(0);
  const introCard = useSharedValue(0);

  const finalTranslation = Dimensions.get("window").height / 2;
  const introStartOffset = Dimensions.get("window").height * 0.42;

  useEffect(() => {
    introContainer.value = withSpring(1, {
      damping: 18,
      stiffness: 170,
      mass: 0.9,
    });
    introCard.value = withDelay(
      40,
      withSpring(1, {
        damping: 16,
        stiffness: 160,
        mass: 0.85,
      })
    );
  }, [introCard, introContainer]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(introContainer.value, [0, 0.14, 1], [0, 0.2, 1]) * opacity.value,
    transform: [
      {
        translateY:
          interpolate(introContainer.value, [0, 1], [introStartOffset, 0]) + translationY.value,
      },
      {
        scale:
          interpolate(introContainer.value, [0, 1], [0.98, 1]) * scale.value,
      },
    ],
  }), [introStartOffset]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(introCard.value, [0, 0.2, 1], [0, 0, 1]),
    transform: [
      { perspective: 1200 },
      { translateY: interpolate(introCard.value, [0, 1], [120, 0]) },
      { rotateX: `${interpolate(introCard.value, [0, 1], [90, 0])}deg` },
      { scale: interpolate(introCard.value, [0, 1], [0.92, 1]) },
    ],
  }));

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
          style={[
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              padding: 20,
            },
            containerAnimatedStyle,
          ]}
        >
          <Reanimated.View
            style={[
              {
                width: "100%",
                minHeight: showEDBadgeHeader ? undefined : Dimensions.get("window").width,
                backgroundColor: "#FFF",
                position: "relative",
                shadowRadius: 20,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                borderRadius: 25,
                overflow: "hidden",
              },
              cardAnimatedStyle,
            ]}
          >
            <Stack
              padding={showEDBadgeHeader ? [24, 20] : 20}
              gap={showEDBadgeHeader ? 24 : 0}
              hAlign="center"
              vAlign="center"
              style={{ width: "100%" }}
            >
              {showEDBadgeHeader && (
                <Stack direction="horizontal" gap={14} hAlign="center" style={{ width: "100%" }}>
                  <Avatar
                    size={56}
                    imageUrl={displayProfilePicture}
                    initials={displayInitials}
                    blurRadius={anonymousMode ? ANONYMOUS_PROFILE_BLUR_RADIUS : 0}
                  />
                  <Stack inline flex gap={2}>
                    <Typography variant="title" weight="bold" color="#111111">
                      {displayName}
                    </Typography>
                    {displayClassName && (
                      <Typography variant="body2" color="#666666">
                        {displayClassName}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              )}

              <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
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
              </View>
            </Stack>
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