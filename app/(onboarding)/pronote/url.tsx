import { useTheme } from "@react-navigation/native";
import { RelativePathString, router, useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { cleanURL, instance } from "pawnote";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAlert } from "@/ui/components/AlertProvider";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import ViewContainer from "@/ui/components/ViewContainer";

const INITIAL_HEIGHT = 680;
const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 440;
const ANIMATION_DURATION = 250;
const OPACITY_THRESHOLD = 600;

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressableContainer: {
    flex: 1,
  },
  stackContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingBottom: 34,
    borderCurve: "continuous",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 200,
    backgroundColor: "#ffffff42",
    padding: 10,
    borderRadius: 100,
  },
  inputContainer: {
    flex: 1,
    padding: 23,
    borderRadius: 300,
    borderWidth: 1,
    borderColor: "#0000001F",
  },
  textInput: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  iconBackground: {
    backgroundColor: "transparent",
  },
});

const LinkIcon = React.memo(() => (
  <Svg
    width={182}
    height={139}
    fill="none"
  >
    <Path
      fill="#fff"
      d="M139.878 31.3C130.977 13.247 112.399.814 90.887.814L51.86.884C23 2.348.062 26.2.062 55.413l.07 2.795c1.242 24.52 18.64 44.755 41.765 50.294 8.51 17.265 25.866 29.387 46.193 30.419l39.027.069c29.214 0 53.067-22.937 54.53-51.799l.068-2.795c0-25.76-17.835-47.347-41.837-53.096Z"
    />
    <Path
      fill="#9A9A9A"
      d="M90.887 15.558c18.262 0 33.655 12.285 38.368 29.041 21.016 1.111 37.716 18.504 37.716 39.797l-.05 2.05c-1.067 21.056-18.481 37.8-39.804 37.8H90.89l-2.053-.051c-17.356-.88-31.782-12.864-36.316-28.99-20.338-1.074-36.633-17.394-37.664-37.743l-.051-2.05c0-21.321 16.744-38.735 37.8-39.803l2.054-.05h36.227Zm38.979 48.187c-3.832 18.009-19.827 31.518-38.979 31.518H73.115c3.661 5.977 10.252 9.965 17.775 9.965h36.227c11.505 0 20.836-9.327 20.836-20.832 0-10.573-7.88-19.306-18.087-20.651Zm-38.976-.18c-8.612 0-16.002 5.226-19.175 12.679h19.172c8.612 0 16.004-5.226 19.179-12.679H90.89ZM54.66 34.581c-11.505 0-20.832 9.326-20.832 20.832.001 10.573 7.878 19.305 18.083 20.65 3.694-17.363 18.692-30.546 36.926-31.47l2.053-.051h17.773C105 38.567 98.408 34.58 90.887 34.58H54.66Z"
    />
  </Svg>
));
LinkIcon.displayName = "LinkIcon";


export default function URLInputScreen() {
  const animation = React.useRef<LottieView>(null);
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert();
  const [instanceURL, setInstanceURL] = useState<string>("");

  const { t } = useTranslation();

  const scrollY = useSharedValue(0);
  const height = useSharedValue(INITIAL_HEIGHT);

  const keyboardListeners = useMemo(() => ({
    show: () => {
      "worklet";
      height.value = withTiming(KEYBOARD_HEIGHT, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      "worklet";
      height.value = withTiming(INITIAL_HEIGHT, { duration: ANIMATION_DURATION });
    },
  }), [height]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
    const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  const AnimatedHeaderStyle = useAnimatedStyle(() => {
    "worklet";
    const heightDiff = height.value - COLLAPSED_HEIGHT;

    return {
      maxHeight: interpolate(
        scrollY.value,
        [0, heightDiff],
        [height.value, COLLAPSED_HEIGHT],
        Extrapolate.CLAMP,
      ),
      height: height.value,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    };
  }, []);

  const AnimatedLottieContainerStyle = useAnimatedStyle(() => {
    "worklet";
    const heightDiff = height.value - COLLAPSED_HEIGHT;
    const isKeyboardVisible = height.value < OPACITY_THRESHOLD;

    const opacity = isKeyboardVisible
      ? 0
      : interpolate(
        scrollY.value,
        [0, heightDiff],
        [1, 0],
        Extrapolate.CLAMP,
      );

    const scale = interpolate(
      scrollY.value,
      [0, heightDiff],
      [1, 0.8],
      Extrapolate.CLAMP,
    );

    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      opacity: withTiming(opacity, { duration: isKeyboardVisible ? 150 : 100 }),
      transform: [{ scale }],
      paddingBottom: 113,
    };
  }, []);

  const AnimatedInputContainerStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      paddingTop: height.value + 16,
      paddingHorizontal: 21,
    };
  }, []);

  const animationCallback = useCallback(() => {
    if (animation.current) {
      animation.current.reset();
      animation.current.play();
    }
  }, []);

  useFocusEffect(animationCallback);

  const onValidate = async () => {
    Keyboard.dismiss();

    if (instanceURL.includes("http") && !instanceURL.includes("https")) {
      return alert.showAlert({
        title: "Instance non supportée",
        description: "Pour des raisons de sécurité, Papillon n'accepte pas les instances utilisant encore le protocole HTTP. Nous vous recommandons d’informer le chef d’établissement afin qu’il procède à la mise à jour de cette instance et préserve ainsi sa sécurité.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
    }

    const cleanedURL = cleanURL(instanceURL);
    let instanceInfo = null;

    if (instanceURL.includes("demo")) {
      return alert.showAlert({
        title: "Connexion impossible",
        description: "Papillon n'est pas fait pour fonctionner avec des instances de démonstration, merci d'utiliser une autre instance.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
    }

    try {
      instanceInfo = await instance(cleanedURL);
    } catch {
      try {
        instanceInfo = await instance(cleanedURL.replace(".index-education.net", ".pronote.toutatice.fr"));
      } catch (error) {
        return alert.showAlert({
          title: "Connexion impossible",
          description: "Papillon n'arrive pas à obtenir les informations de cette instance PRONOTE, est-elle encore valide ?",
          icon: "TriangleAlert",
          technical: String(error),
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    }

    if (instanceInfo && instanceInfo.casToken && instanceInfo.casURL) {
      return router.push({
        pathname: "./webview" as unknown as RelativePathString,
        params: { url: cleanedURL },
      });
    }

    return router.push({
      pathname: "./credentials",
      params: {
        url: cleanedURL,
        previousPage: "url",
      },
    });
  };

  return (
    <Pressable style={staticStyles.pressableContainer}
      onPress={Keyboard.dismiss}
    >
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={theme.dark ? "#2f2f2fff" : "#C6C6C6"}
            gap={20}
            style={staticStyles.stackContainer}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <LinkIcon />
            </Reanimated.View>
            <Stack
              vAlign="start"
              hAlign="start"
              width="100%"
              gap={12}
            >
              <Stack flex
                direction="horizontal"
              >
                <Typography
                  variant="h5"
                  style={{ color: colors.text, lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP")} 2
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: colors.text + "A6", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP_OUTOF")} 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: colors.text, fontSize: 32, lineHeight: 34 }}
              >
                {t("ONBOARDING_URL")}
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>

        <Reanimated.View style={AnimatedInputContainerStyle}>
          <OnboardingInput
            placeholder={t("ONBOARDING_URL_PLACEHOLDER")}
            icon={"Link"}
            text={instanceURL}
            setText={setInstanceURL}
            isPassword={false}
            keyboardType={"url"}
            inputProps={{
              onSubmitEditing: onValidate,
            }}
          />
        </Reanimated.View>

        <OnboardingBackButton />
      </ViewContainer>
    </Pressable>
  );
}