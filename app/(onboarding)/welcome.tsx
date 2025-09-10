import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";

import { Papicons } from "@getpapillon/papicons";
import ViewContainer from "@/ui/components/ViewContainer";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      if (animation.current) {
        animation.current.reset();
        animation.current.play();
      }
    }, []),
  );

  return (
    <ViewContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack
          padding={32}
          backgroundColor="#0060D6"
          gap={0}
          hAlign={"center"}
          vAlign={"end"}
          style={{
            width: "100%",
            flex: 1,
            borderBottomLeftRadius: 42,
            borderBottomRightRadius: 42,
            borderCurve: "continuous",
            paddingTop: insets.top + 20,
            paddingBottom: 34,
          }}
        >
          <Stack
            vAlign={"center"}
            hAlign={"center"}
            style={{
              flex: 1,
              marginBottom: 16,
            }}
          >
            <LottieView
              autoPlay={false}
              loop={false}
              ref={animation}
              style={{
                flex: 1,
                aspectRatio: 1,
                maxHeight: 250
              }}
              source={require("@/assets/lotties/onboarding.json")}
            />
          </Stack>
          <Stack
            flex
            vAlign="start"
            hAlign="start"
            width="100%"
            gap={6}
          >
            <Image
              source={require("@/assets/logo.png")}
              resizeMode="contain"
              style={{
                width: 136,
                height: 36,
                marginBottom: 2,
              }}
            />
            <Typography
              variant="h1"
              style={{ color: "white", fontSize: 32, lineHeight: 34 }}
            >
              {t("ONBOARDING_MAIN_TITLE")}
            </Typography>
            <Typography
              variant="h5"
              style={{ color: "#FFFFFF80", lineHeight: 22, fontSize: 18 }}
            >
              {t("ONBOARDING_MAIN_DESCRIPTION")}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          style={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          gap={10}
        >
          <Button
            title={t("ONBOARDING_START_BTN")}
            onPress={() => {
              requestAnimationFrame(() => {
                router.navigate("/(onboarding)/serviceSelection");
              });
            }}
            style={{
              backgroundColor: theme.dark ? colors.border : "black",
            }}
            size="large"
            icon={
              <Papicons name={"Butterfly"} />
            }
          />
          <Button
            title={t("ONBOARDING_HELP_BTN")}
            onPress={() => {
              Linking.openURL("https://support.papillon.bzh");
            }}
            variant="ghost"
            color="text"
            size="large"
            style={{height: 40}}
          />
        </Stack>
      </View>
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
