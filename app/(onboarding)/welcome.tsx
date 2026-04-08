import { useFocusEffect, useIsFocused, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import React from "react";
import { Image, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import PapillonLogo from "@/ui/new/symbols/PapillonLogo";
import Typography from "@/ui/new/Typography";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const openHelpWebPage = () => {
    WebBrowser.openBrowserAsync("https://docs.papillon.bzh/support", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
    });
  }

  const openLegalWebPage = () => {
    WebBrowser.openBrowserAsync("https://docs.papillon.bzh/terms", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
    });
  }

  const openDevMenu = () => {
    router.push("/devmode");
  }

  const player = useVideoPlayer({
      assetId: require('@/assets/video/welcome.mp4'),
    }, player => {
      player.loop = true;
      player.muted = true;
      player.volume = 0;
      player.showNowPlayingNotification = false;
      player.playbackRate = 0.5;
      player.audioMixingMode = "mixWithOthers";
      player.play();
    });

    const isFocused = useIsFocused();

    useFocusEffect(
      React.useCallback(() => {
        if (isFocused) {
          player.play();
        }
      }, [isFocused])
    );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black"
      }}
    >
      {isFocused &&
      <StatusBar barStyle={"light-content"} animated translucent />
      }
      {isFocused &&
      <Reanimated.View
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(600)}

        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
      <VideoView
        player={player}
        style={{
          width: '100%',
          height: '100%'
        }}
        contentFit="cover"
        nativeControls={false}
      /></Reanimated.View>
}

      <LinearGradient
        colors={["rgba(0, 0, 0, 1)", "rgba(0, 0, 0, 0.0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 1)"]}
        locations={[0, 0.2, 0.3, 0.7]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.8
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          padding: 16,
          gap: 10,
          paddingBottom: insets.bottom + 16,
          zIndex: 99,
        }}
      >
        <PapillonLogo fill={"#FFFFFF"} />

        <Typography color="#FFFFFF" variant="title" align="center" weight="medium" style={{ marginHorizontal: 10, opacity: 0.8 }}>
          {t("ONBOARDING_WELCOME_DESCRIPTION")}
        </Typography>

        <Divider height={2} ghost />


        <Button
          label={t("ONBOARDING_WELCOME_LOGIN_WITH")}
          gap={4}
          trailing={
            <Stack direction="horizontal" gap={0}>
              <Image
                source={require("@/assets/images/service_pronote.png")}
                style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, zIndex: 3 }}
              />
              <Image
                source={require("@/assets/images/service_ed.png")}
                style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, marginLeft: -16, zIndex: 2 }}
              />
              <Image
                source={require("@/assets/images/service_skolengo.png")}
                style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, marginLeft: -16, zIndex: 1 }}
              />
            </Stack>
          }
          onPress={() => {
            router.push("./ageSelection")
          }}
          fullWidth
        />
        <Button
          label={t("ONBOARDING_HELP_BTN")}
          onPress={() => { openHelpWebPage() }}
          fullWidth
          variant="secondary"
          color="#FFFFFF"
        />

        <Divider height={2} ghost />

        <Typography color="#FFFFFF88" variant="caption" align="center" style={{ marginHorizontal: 20, opacity: 0.7 }} onPress={() => { openLegalWebPage() }} onLongPress={() => { openDevMenu() }}>
          {t("ONBOARDING_WELCOME_LEGAL")}
        </Typography>
      </View>
    </View>
  );
}
