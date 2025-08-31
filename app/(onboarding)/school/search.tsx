import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";

import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ANIMATION_DURATION = 250;

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { useTranslation } from "react-i18next";
import OnboardingInput from "@/components/onboarding/OnboardingInput";

export default function SelectSchoolOnMap() {
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState<string>();

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const search = useLocalSearchParams();

  const keyboardListeners = useMemo(() => ({
    show: () => {
      "worklet";
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      "worklet";
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      scale.value = withTiming(1, { duration: ANIMATION_DURATION });
    },
  }), [opacity]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
    const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottomLeftRadius: 42,
          borderBottomRightRadius: 42,
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 34,
          borderCurve: "continuous",
          flex: 1,
          backgroundColor: "#E50052"
        }}
      >
        <Reanimated.View
          style={{
            flex: 1,
            marginBottom: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: opacity,
            transform: [{ scale: scale }],
          }}
        >
          <LottieView
            autoPlay
            loop={false}
            style={[{
              aspectRatio: 1,
              height: "100%",
              maxHeight: 250,
            }]}
            source={require("@/assets/lotties/location.json")}
          />
        </Reanimated.View>
        <Stack
          vAlign="start"
          hAlign="start"
          width="100%"
          gap={12}
        >
          <Stack
            direction="horizontal"
          >
            <Typography
              variant="h5"
              style={{ color: "white", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP")} 2
            </Typography>
            <Typography
              variant="h5"
              style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            style={{ color: "white", fontSize: 32, lineHeight: 34 }}
          >
            {t("ONBOARDING_SEARCH_TITLE")}
          </Typography>
        </Stack>
      </View>
      <Stack padding={20}>
        <OnboardingInput
          placeholder={"Nom de ta ville"}
          text={city || ""}
          setText={setCity}
          icon={"MapPin"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            autoComplete: "address-line1",
            onSubmitEditing: () => {
              router.push({
                pathname: "./map",
                params: {
                  service: Number(search.service),
                  city,
                  method: "manual",
                },
              });
            }
          }}
        />
      </Stack>
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}