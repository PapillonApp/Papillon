import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItemInfo } from "react-native";
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import ViewContainer from "@/ui/components/ViewContainer";
const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList);

const OnboardingScrollingFlatList = ({ lottie, hasReturnButton = true, title, color, step, totalSteps, elements, renderItem }: {
  lottie?: string
  hasReturnButton?: boolean,
  title: string
  color: string
  step: number
  totalSteps: number
  elements: unknown[]
  renderItem: (info: ListRenderItemInfo<unknown>) => React.JSX.Element
}) => {
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  const scrollY = React.useRef(useSharedValue(0)).current;
  const { t } = useTranslation();

  const height: number = lottie ? 500 : 250;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const AnimatedHeaderStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(
      scrollY.value,
      [0, height - 270],
      [height, 270],
      Extrapolate.CLAMP
    ),
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    transform: [
      {
        scaleY: interpolate(
          scrollY.value,
          [-500, 0],
          [1.2, 1],
          Extrapolate.CLAMP
        )
      },
    ]
  }));

  const AnimatedLottieContainerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, height - 270],
      [1, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, height - 270],
          [1, 0.8],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  useFocusEffect(
    React.useCallback(() => {
      if (animation.current) {
        animation.current.reset();
        animation.current.play();
      }
    }, [])
  );

  return (
    <ViewContainer>
      <Reanimated.View
        style={[AnimatedHeaderStyle, { transformOrigin: "top" }]}
      >
        <Stack
          padding={32}
          backgroundColor={color}
          gap={20}
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottomLeftRadius: 42,
            borderBottomRightRadius: 42,
            paddingBottom: 34,
            borderCurve: "continuous",
            height: "100%",
          }}
        >
          <Reanimated.View style={AnimatedLottieContainerStyle}>
            {lottie && (
              <LottieView
                autoPlay
                loop={false}
                style={{ width: 230, height: 230 }}
                source={lottie}
              />
            )}
          </Reanimated.View>
          <Stack
            vAlign='start'
            hAlign='start'
            width="100%"
            gap={12}
          >
            <Stack flex direction="horizontal">
              <Typography
                variant="h5"
                style={{ color: "white", lineHeight: 22, fontSize: 18 }}
              >
                {t('OnBoarding_Step') + step}
              </Typography>
              <Typography
                variant="h5"
                style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
              >
                {t('OnBoarding_Step_Of') + totalSteps}
              </Typography>
            </Stack>
            <Typography
              variant="h1"
              style={{ color: "white", fontSize: 32, lineHeight: 34 }}
            >
              {title}
            </Typography>
          </Stack>
        </Stack>
      </Reanimated.View>

      <AnimatedFlatList
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        data={elements}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        contentContainerStyle={{
          paddingTop: height + 16,
          paddingHorizontal: 16,
          gap: 10,
          paddingBottom: insets.bottom + 16,
        }}
        renderItem={renderItem}
      />

      {hasReturnButton && (
        <OnboardingBackButton />
      )}
    </ViewContainer>
  )
}

export default OnboardingScrollingFlatList;