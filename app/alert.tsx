import React, { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, type ComponentType } from "react";
import * as LucideIcons from "lucide-react-native";

import Typography from "@/ui/components/Typography";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import Button from "@/ui/components/Button";
import { useTheme } from "@react-navigation/native";

import { Animation } from "@/ui/utils/Animation";

import Reanimated, { LinearTransition, Easing } from "react-native-reanimated";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import { useTranslation } from "react-i18next";

export default function AlertModal() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const IconComponent =
    params.icon && typeof params.icon === "string"
      ? (LucideIcons[params.icon as keyof typeof LucideIcons] as ComponentType<any>)
      : undefined;

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <View
      style={{
        padding: 18,
        paddingTop: 20,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 22,
        marginBottom: Platform.OS === 'ios' ? -32 : 0,
        alignSelf: "center",
        maxWidth: 500,
      }}
    >
      <View
        style={{
          width: "100%",
          minWidth: "100%",
          height: 160,
          backgroundColor: params.color ? params.color + "22" : "#ccc",
          borderRadius: 24,
          borderCurve: "continuous",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* icon */}
        {IconComponent ? (
          <IconComponent size={64} color={params.color ? params.color : colors.text} />
        ) : null}
      </View>

      <View
        style={{
          paddingHorizontal: 6,
          gap: 8,
          width: "100%",
        }}
      >
        <Typography variant="h3">{params.title}</Typography>
        <Typography variant="body1" color="secondary">{params.description ?? params.message}</Typography>
      </View>

      {params.technical && (
        <Reanimated.View
          style={[
            {
              paddingHorizontal: 6,
              gap: 0,
              width: "100%",
              borderRadius: 16,
              borderCurve: "continuous",
              marginTop: -8,
              overflow: "hidden",
              zIndex: 1000,
            },
            showTechnicalDetails && {
              backgroundColor: colors.text + "20",
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 8,
            }
          ]}
          layout={LinearTransition.duration(200).easing(Easing.inOut(Easing.quad))}
        >
          <Pressable
            style={{
              flexDirection: "row",
              gap: 6,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: -2,
            }}
            onPress={() => {
              setShowTechnicalDetails(!showTechnicalDetails);
            }}
          >
            <Typography variant="h6" color={showTechnicalDetails ? colors.text : colors.primary}>{t('Alert_TechnicalDetails')}</Typography>

            {showTechnicalDetails
              ? <LucideIcons.ChevronUp color={showTechnicalDetails ? colors.text : colors.primary} size={24} strokeWidth={2.5} />
              : <LucideIcons.ChevronDown color={showTechnicalDetails ? colors.text : colors.primary} size={24} strokeWidth={2.5} />}
          </Pressable>

          {showTechnicalDetails && (
            <Reanimated.ScrollView
              style={{
                maxHeight: 120,
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: Platform.OS === 'ios' ? "Courier" : "monospace",
                  textAlign: "left",
                }}
                selectable
              >
                {params.technical ? params.technical.trim() : "Aucune information technique disponible."}
              </Text>
            </Reanimated.ScrollView>
          )}
        </Reanimated.View>
      )}

      <Reanimated.View
        style={{
          paddingHorizontal: 6,
          gap: 8,
          marginBottom: 4,
          minWidth: "100%",
          alignSelf: "stretch",
          flex: 1
        }}
        layout={LinearTransition.duration(200).easing(Easing.inOut(Easing.quad))}
      >
        <Button
          title="OK"
          onPress={() => {
            router.back();
          }}
        />
      </Reanimated.View>
    </View>
  )
};