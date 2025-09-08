import { useTheme } from "@react-navigation/native";
import { RelativePathString, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { Image } from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";

import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Typography from "@/ui/components/Typography";

import { GetSupportedRestaurants, SupportedRestaurant } from "../utils/constants";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const animation = React.useRef<LottieView>(null);

  const { t } = useTranslation()
  const params = useLocalSearchParams();
  const action = String(params.action);

  const services = GetSupportedRestaurants((path: { pathname: string }) => {
    router.push({ pathname: path.pathname as unknown as RelativePathString, params: { action } });
  });

  useFocusEffect(
    React.useCallback(() => {
      if (animation.current) {
        animation.current.reset();
        animation.current.play();
      }
    }, []),
  );

  return (
    <OnboardingScrollingFlatList
      lottie={require("@/assets/lotties/self.json")}
      title={t("ONBOARDING_SELECT_RESTAURANTSERVICE")}
      color={"#60B400"}
      step={1}
      totalSteps={3}
      elements={services}
      renderItem={({ item, index }: { item: SupportedRestaurant, index: number }) => (
        <Reanimated.View
          entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        >
          <AnimatedPressable
            onPress={() => {
              requestAnimationFrame(() => {
                item.onPress();
              });
            }}
            style={[
              {
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderColor: colors.border,
                borderWidth: 1.5,
                borderRadius: 80,
                borderCurve: "continuous",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                display: "flex",
                gap: 16,
              }
            ]}
          >
            <Image
              borderRadius={500}
              source={item.image}
              style={{ width: 32, height: 32 }}
              resizeMode="cover"
            />
            <Typography
              style={{ flex: 1 }}
              nowrap
              variant="title"
            >
              {item.title}
            </Typography>
          </AnimatedPressable>
        </Reanimated.View>
      )}
    />
  );
}
