import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import PapillonLogo from "@/ui/new/symbols/PapillonLogo";
import Typography from "@/ui/new/Typography";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { createElement } from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "expo-router/react-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

/**
 * Web-only Welcome screen.
 *
 * Do not use expo-video or Reanimated layout/entering animations here.
 * The native implementation mounts/unmounts VideoView according to focus;
 * on Web that can interrupt HTMLMediaElement.play(), producing AbortError
 * and leaving the WebView/Electron welcome screen blank.
 */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const openHelpWebPage = () => {
    void WebBrowser.openBrowserAsync("https://docs.papillon.bzh/support");
  };

  const openLegalWebPage = () => {
    void WebBrowser.openBrowserAsync("https://docs.papillon.bzh/terms");
  };

  const openDevMenu = () => {
    router.push("/devmode");
  };

  const videoSource = require("@/assets/video/welcome.mp4");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {createElement("video", {
        src: videoSource,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: "auto",
        "aria-hidden": true,
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        },
      })}

      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 1)",
          "rgba(0, 0, 0, 0.0)",
          "rgba(0, 0, 0, 0)",
          "rgba(0, 0, 0, 1)",
        ]}
        locations={[0, 0.2, 0.3, 0.7]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.8,
        }}
      />

      <View style={{ maxWidth: 600, width: "100%", flex: 1, zIndex: 2 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 16,
            gap: 10,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <PapillonLogo fill="#FFFFFF" />

          <Typography
            color="#FFFFFF"
            variant="title"
            align="center"
            weight="medium"
            style={{ marginHorizontal: 10, opacity: 0.8 }}
          >
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
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    borderWidth: 3,
                    borderColor: colors.primary,
                    zIndex: 3,
                  }}
                />
                <Image
                  source={require("@/assets/images/service_ed.png")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    borderWidth: 3,
                    borderColor: colors.primary,
                    marginLeft: -16,
                    zIndex: 2,
                  }}
                />
                <Image
                  source={require("@/assets/images/service_skolengo.png")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    borderWidth: 3,
                    borderColor: colors.primary,
                    marginLeft: -16,
                    zIndex: 1,
                  }}
                />
              </Stack>
            }
            onPress={() => router.push("./ageSelection")}
            fullWidth
          />

          <Button
            label={t("ONBOARDING_HELP_BTN")}
            onPress={openHelpWebPage}
            fullWidth
            variant="secondary"
            color="#FFFFFF"
          />

          <Divider height={2} ghost />

          <Typography
            color="#FFFFFF88"
            variant="caption"
            align="center"
            style={{ marginHorizontal: 20, opacity: 0.7 }}
            onPress={openLegalWebPage}
            onLongPress={openDevMenu}
          >
            {t("ONBOARDING_WELCOME_LEGAL")}
          </Typography>
        </View>
      </View>
    </View>
  );
}
