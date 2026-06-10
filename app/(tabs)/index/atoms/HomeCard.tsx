import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions, Image, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "expo-router/react-navigation";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getServiceBackground, getServiceColor } from "@/utils/services/helper";
import { useAccountStore } from "@/stores/account";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import adjust from "@/utils/adjustColor";
import React from "react";
import QRCode from "react-native-qrcode-svg";
import Barcode, { Format } from "@aramir/react-native-barcode";
import { Phone } from "@getpapillon/papicons";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { useTranslation } from "react-i18next";
import Avatar from "@/ui/components/Avatar";
import { useUserProfileData } from "@/app/(tabs)/index/hooks/useUserProfileData";
import { ChevronUp } from "lucide-react-native";

export const HomeCard = ({ qrcode }: { qrcode: { data: string; type: string } }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const store = useAccountStore();
  const accounts = useAccountStore(state => state.accounts);
  const account = accounts.find(a => a.id === store.lastUsedAccount);

  const insetBottom = Platform.OS === "android" ? 0 : insets.bottom;
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const { firstName, lastName, initials, profilePicture } =
    useUserProfileData() ?? {};

  const serviceColor = adjust(
    getServiceColor(account?.services[0].serviceId ?? 0),
    -0.2
  );

  const panGesture = Gesture.Pan()
    .onUpdate(
      e =>
        (translateX.value = e.translationY - (isOpen.value ? screenHeight : 0))
    )
    .onEnd(() => {
      const ratio = -translateX.value / screenHeight;
      const spring = {
        stiffness: 500,
        damping: 50,
        mass: 1.2,
      };

      if (isOpen.value) {
        if (ratio < 0.9) {
          translateX.value = withSpring(0, spring);
          isOpen.value = false;
        } else {
          translateX.value = withSpring(-screenHeight, spring);
          isOpen.value = true;
        }
      } else {
        if (ratio >= 0.2) {
          translateX.value = withSpring(-screenHeight, spring);
          isOpen.value = true;
        } else {
          translateX.value = withSpring(0, spring);
          isOpen.value = false;
        }
      }
    });
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: interpolate(
      -translateX.value,
      [0, screenHeight],
      [screenHeight - 150, 0]
    ),
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: interpolate(
      -translateX.value,
      [0, screenHeight],
      [150 - insets.bottom - 30, (screenHeight - (screenWidth - 32) / 1.55) / 2]
    ),
    zIndex: 10000,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    opacity: interpolate(-translateX.value, [0, screenHeight], [0, 1]),
    zIndex: 1000,
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
  }));

  const backCardAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: serviceColor,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    opacity: interpolate(
      -translateX.value,
      [0, (screenHeight / 4) * 2.5, (screenHeight / 4) * 3],
      [0, 0, 1]
    ),
  }));

  const cardDetailsAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    opacity: interpolate(
      -translateX.value,
      [(screenHeight / 4) * 3, screenHeight],
      [0, 1]
    ),
  }));

  const cardSwipeHintAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 25,
    alignItems: "center",
    opacity: interpolate(
      -translateX.value,
      [-20, 0, 40],
      [0, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle} collapsable={false}>
          <Animated.View style={cardSwipeHintAnimatedStyle}>
            <ChevronUp color={colors.text} />
            <Typography variant={"title"} style={{ fontSize: 14 }}>
              {t("HOME_SWIPE_TO_PAY")}
            </Typography>
          </Animated.View>
          <View>
            <Image
              source={getServiceBackground(account?.services[0].serviceId ?? 0)}
              style={{
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.text + "20",
              }}
              resizeMode="cover"
            />
            <Animated.View style={backCardAnimatedStyle}>
              <View
                style={{
                  backgroundColor: "#FFF",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                {qrcode.type === "QR" ? (
                  <QRCode
                    value={qrcode.data}
                    backgroundColor={"transparent"}
                    color={"#000"}
                    size={150}
                  />
                ) : (
                  <Barcode
                    value={qrcode.data}
                    format={qrcode.type as Format}
                    background={"transparent"}
                  />
                )}
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>

      <View
        style={{
          position: "absolute",
          height: 100 + insetBottom,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <LinearGradient
          colors={[colors.background + "00", colors.background]}
          style={{ position: "absolute", inset: 0, bottom: insetBottom + 50 }}
        />
        <View
          style={{
            backgroundColor: colors.background,
            position: "absolute",
            inset: 0,
            top: 50,
          }}
        />
      </View>

      <Animated.View style={backgroundAnimatedStyle}>
        <Animated.View style={cardDetailsAnimatedStyle}>
          <Stack
            hAlign="center"
            style={{
              width: 240,
              height: 70,
              position: "absolute",
              top: screenHeight / 2 - (screenWidth - 32) / 1.53 / 2 - 70 - 20,
            }}
          >
            <Phone fill={"#FFFFFF"} />
            <Typography variant="body2" align="center" color="#FFFFFF">
              {t("Profile_Cards_Scan_Orientation")}
            </Typography>
          </Stack>
          <Stack
            direction={"horizontal"}
            hAlign={"center"}
            gap={10}
            style={{
              position: "absolute",
              top: screenHeight / 2 + (screenWidth - 32) / 1.53 / 2 + 20,
            }}
          >
            <Avatar size={25} initials={initials} imageUrl={profilePicture} />
            <Typography
              variant="body2"
              color="#FFFFFF"
            >{`${firstName} ${lastName}`}</Typography>
          </Stack>
        </Animated.View>
      </Animated.View>
    </>
  );
};
