import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, View, KeyboardAvoidingView } from "react-native";
import { RelativePathString, router } from "expo-router";

import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { cleanURL, instance } from "pawnote";
import { useAlert } from "@/ui/components/AlertProvider";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ANIMATION_DURATION = 250;

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
  const insets = useSafeAreaInsets();

  const alert = useAlert();
  const [instanceURL, setInstanceURL] = useState<string>("");

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

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

  const onValidate = async () => {
    Keyboard.dismiss();

    if (instanceURL.includes("http") && !instanceURL.includes("https")) {
      return alert.showAlert({
        title: "Instance non supportée",
        description: "Pour des raisons de sécurité, Papillon n'accepte pas les instances utilisant encore le protocole HTTP. Nous te recommandons d’informer ton chef d’établissement afin qu’il procède à la mise à jour de cette instance et préserve ainsi sa sécurité.",
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
          backgroundColor: "#C6C6C6",
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
          <LinkIcon />
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
              style={{ color: "#000", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP")} 2
            </Typography>
            <Typography
              variant="h5"
              style={{ color: "#00000090", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            style={{ color: "#000", fontSize: 32, lineHeight: 34 }}
          >
            {t("ONBOARDING_URL")}
          </Typography>
        </Stack>
      </View>
      <Stack padding={20}>
        <OnboardingInput
          placeholder={t("ONBOARDING_URL_PLACEHOLDER")}
          icon={"Link"}
          text={instanceURL}
          setText={setInstanceURL}
          isPassword={false}
          keyboardType={"url"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            onSubmitEditing: onValidate,
          }}
        />
      </Stack>
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}