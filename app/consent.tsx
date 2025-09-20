import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Linking } from "react-native";
import i18n from "@/utils/i18n";
const t = i18n.t.bind(i18n);
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { checkConsent, setConsent } from "@/utils/logger/consent";
import { LinearGradient } from "expo-linear-gradient";
import List from "@/ui/components/List";
import Icon from "@/ui/components/Icon";
import Item from "@/ui/components/Item";
import Button from "@/ui/components/Button";

export default function ConsentScreen() {
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const [currentConsent, setCurrentConsent] = useState(null);

  const theme = useTheme();
  const { colors } = theme;

  useEffect(() => {
    checkConsent().then((consent) => {
      if (consent.given) {
        if (consent.advanced) {
          setCurrentConsent("advanced");
        } else if (consent.optional) {
          setCurrentConsent("optional");
        } else if (consent.required) {
          setCurrentConsent("required");
        } else {
          setCurrentConsent("none");
        }
      }
    });
  }, []);

  const consents = [
    {
      key: "advanced",
      title: t("Consent_Advanced_Title"),
      description: t("Consent_Advanced_Description"),
      icon: "emoji",
      color: "#C50083"
    },
    {
      key: "optional",
      title: t("Consent_Required_Title"),
      description: t("Consent_Required_Description"),
      icon: "ghost",
      color: "#0080C5"
    },
    {
      key: "none",
      title: t("Consent_None_Title"),
      description: t("Consent_None_Description"),
      icon: "cross",
      color: "#5A5A5A"
    }
  ];

  const accent = useMemo(() => {
    return consents.find(c => c.key === currentConsent)?.color || theme.colors.primary;
  }, [currentConsent, theme]);

  const saveConsentState = async (consent: string) => {
    await setConsent(consent as "none" | "required" | "optional" | "advanced");
    router.back();
  };

  return (
    <View
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={[accent, colors.background]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          zIndex: -1,
          opacity: 0.2,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 26,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Stack gap={16} style={{ marginBottom: 8 }}>
          <Image
            source={require("../assets/images/papillon_heart.png")}
            style={{ width: 98, height: 72, alignSelf: "center" }}
          />
          <Typography variant="h3" color="text" align="center" style={{ width: "100%" }}>
            {t("Consent_Title")}
          </Typography>
          <Typography variant="body2" color="secondary" align="center">
            {t("Consent_Intro1")}
          </Typography>
          <Typography onPress={() => Linking.openURL("https://docs.papillon.bzh/privacy-policy")} variant="caption" color={accent} align="center" style={{ textDecorationLine: "underline" }}>
            {t("Consent_PrivacyPolicy")}
          </Typography>
        </Stack>

        <List>
          <Item>
            <Icon>
              <Papicons name="check" />
            </Icon>
            <Typography variant="body2">
              {t("Consent_Arg1")}
            </Typography>
          </Item>
          <Item>
            <Icon>
              <Papicons name="link" size={24} color={colors.text} />
            </Icon>
            <Typography variant="body2">
              {t("Consent_Arg2")}
            </Typography>
          </Item>
          <Item>
            <Icon>
              <Papicons name="lock" size={24} color={colors.text} />
            </Icon>
            <Typography variant="body2">
              {t("Consent_Arg3")}
            </Typography>
          </Item>
        </List>

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
                  borderColor: currentConsent === consent.key ? consent.color : colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  backgroundColor: currentConsent === consent.key ? consent.color + "20" : colors.background,
                }}
              >
                <Papicons name={consent.icon} size={32} color={currentConsent !== consent.key ? colors.text + "50" : consent.color} />
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
          paddingBottom: insets.bottom + 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: "#888888",
          gap: 12,
        }}
      >
        <Button
          disabled={currentConsent === null}
          onPress={() => { if (currentConsent) saveConsentState(currentConsent) }}
          inline
          style={{
            backgroundColor: currentConsent === "none" ? colors.text + "99" : accent,
          }}
          icon={
            <Papicons name={currentConsent === "none" ? "cross" : "check"} color="#FFFFFF" />
          }
          title={currentConsent === "none" ? t("Consent_Refuse") : t("Consent_Accept")}
        />

        <Typography variant="caption" color="secondary" align="center">
          {t("Consent_ChangeMind")}
        </Typography>
      </View>
    </View>
  );
};