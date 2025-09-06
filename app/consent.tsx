import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Button from "@/ui/components/Button";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Linking } from "react-native";
import i18n from "@/utils/i18n";
const t = i18n.t.bind(i18n);
import { MMKV } from "react-native-mmkv";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { setConsent } from "@/utils/logger/consent";

export default function ConsentScreen() {
  const insets = useSafeAreaInsets();
  const accent = "#C94F1A";

  const router = useRouter();

  const [currentConsent, setCurrentConsent] = useState("optional");

  const theme = useTheme();
  const { colors } = theme;

  const consents = [
    {
      key: "advanced",
      title: t("Consent_Advanced_Title"),
      description: t("Consent_Advanced_Description"),
      icon: "emoji"
    },
    {
      key: "optional",
      title: t("Consent_Optional_Title"),
      description: t("Consent_Optional_Description"),
      icon: "grades"
    },
    {
      key: "required",
      title: t("Consent_Required_Title"),
      description: t("Consent_Required_Description"),
      icon: "ghost"
    },
    {
      key: "none",
      title: t("Consent_None_Title"),
      description: t("Consent_None_Description"),
      icon: "cross"
    }
  ];

  const saveConsentState = async (consent: string) => {
    await setConsent(consent as "none" | "required" | "optional" | "advanced");
    router.back();
  };

  return (
    <View
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 26,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Stack gap={16}>
          <Image
            source={require("../assets/images/emoji_relieved.png")}
            style={{ width: 60, height: 60, alignSelf: "center" }}
          />
          <Typography variant="h3" color="text" align="center" style={{ width: "100%" }}>
            {t("Consent_Title")}
          </Typography>
          <Typography variant="body2" color="secondary" align="center">
            {t("Consent_Intro1")}
          </Typography>
          <Typography variant="body2" color="secondary" align="center">
            {t("Consent_Intro2")}
          </Typography>
          <Typography onPress={() => Linking.openURL("https://docs.papillon.bzh/privacy-policy")} variant="caption" color={accent} align="center" style={{ textDecorationLine: "underline" }}>
            {t("Consent_PrivacyPolicy")}
          </Typography>
        </Stack>

        <View
          style={{
            gap: 12,
          }}
        >
          {consents.map((consent) => (
            <AnimatedPressable
              style={{
                width: "100%",
              }}
              onPress={() => { setCurrentConsent(consent.key) }}
              key={consent.key}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  borderColor: currentConsent === consent.key ? accent : colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  backgroundColor: currentConsent === consent.key ? accent + "20" : colors.background,
                }}
              >
                <Papicons name={consent.icon} size={32} color={currentConsent !== consent.key ? colors.text + "50" : accent} />
                <View
                  style={{
                    gap: 4,
                    flex: 1,
                    width: "100%",
                  }}
                >
                  <Typography variant="title" color="text">
                    {consent.title}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {consent.description}
                  </Typography>
                </View>
              </View>
            </AnimatedPressable>
          ))}
        </View>
      </ScrollView>
      <View
        style={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: "#888888",
          gap: 12,
        }}
      >
        <Button
          title={currentConsent === "none" ? t("Consent_Refuse") : t("Consent_Accept")}
          variant={currentConsent === "none" ? "outline" : "primary"}
          color="orange"
          onPress={() => {
            saveConsentState(currentConsent);
          }}
        />
        <Typography variant="caption" color="secondary" align="center">
          {t("Consent_ChangeMind")}
        </Typography>
      </View>
    </View>
  );
};