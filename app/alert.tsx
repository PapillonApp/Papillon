import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import { type ComponentType, useState } from "react";
import { useTranslation } from "react-i18next";
import React, { Platform, Pressable, Text, View } from "react-native";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";

import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

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
        gap: 22,
        marginBottom: runsIOS26 ? -32 : 0,
        alignSelf: "center",
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
              backgroundColor: "#222",
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 8,
            }
          ]}
          layout={Platform.OS === "ios" ? LinearTransition.duration(200).easing(Easing.inOut(Easing.quad)) : undefined}
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
            <Typography variant="h6" color={showTechnicalDetails ? "#FFF" : colors.primary}>{t('Alert_TechnicalDetails')}</Typography>

            {showTechnicalDetails
              ? <LucideIcons.ChevronUp color={showTechnicalDetails ? "#FFF" : colors.primary} size={24} strokeWidth={2.5} />
              : <LucideIcons.ChevronDown color={showTechnicalDetails ? "#FFF" : colors.primary} size={24} strokeWidth={2.5} />}
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
                  color: "#FFF",
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