import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import Button from "@/ui/new/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import { Papicons } from "@getpapillon/papicons";

export default function AttendanceMethods() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: "center",
      }}
    >
      <Stack width="100%" gap={8} hAlign="center" style={{ maxWidth: 600 }}>
        <Typography variant="title" align="center" style={{ marginBottom: 16 }}>
          {t("Sign_Attendance_Title")}
        </Typography>
        <Button
          fullWidth
          color={String(colors.primary)}
          variant="primary"
          label={t("Sign_Attendance_With_QR")}
          leading={<Papicons name="QrCode" size={20} fill="#ffffff" />}
          onPress={() =>
            router.push({
              pathname: "/(modals)/attendance/sign",
              params: { id, method: "scan" },
            })
          }
        />
        <Button
          fullWidth
          color={String(colors.primary)}
          variant="secondary"
          label={t("Sign_Attendance_With_Code")}
          leading={
            <Papicons name="PenAlt" size={20} fill={String(colors.primary)} />
          }
          onPress={() =>
            router.push({
              pathname: "/(modals)/attendance/sign",
              params: { id, method: "code" },
            })
          }
        />
      </Stack>
    </View>
  );
}
