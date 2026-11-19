import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Papicons } from "@getpapillon/papicons";

import SignaturePad, {
  SignaturePadRef,
} from "@/components/attendance/SignaturePad";
import { setTempSignature } from "./signatureStore";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { useAlert } from "@/ui/components/AlertProvider";
import Icon from "@/ui/components/Icon";
import Button from "@/ui/new/Button";
import Stack from "@/ui/components/Stack";

export default function AttendanceSign() {
  const { id, code, qrCodeData, method } = useLocalSearchParams<{
    id: string;
    code?: string;
    qrCodeData?: string;
    method?: "scan" | "code";
  }>();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const alert = useAlert();
  const { t } = useTranslation();
  const dangerColor = (colors as any).danger ?? "#DC1400";

  const [submitting, setSubmitting] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleClose = () => {
    if (id) {
      router.navigate({ pathname: "/(modals)/course/[id]", params: { id } });
    } else {
      router.back();
    }
  };

  const handleSignatureSubmit = async (base64Signature: string) => {
    if (!base64Signature || base64Signature.trim() === "") {
      alert.showAlert({
        title: t("Sign_Attendance_Error"),
        message: t("Sign_Attendance_Empty_Signature"),
        icon: "AlertTriangle",
        color: "#EF4444",
      });
      return;
    }

    setTempSignature(base64Signature);

    if (method === "scan") {
      router.push({
        pathname: "/(modals)/attendance/scan",
        params: { id },
      });
    } else if (method === "code") {
      router.push({
        pathname: "/(modals)/attendance/code",
        params: { id },
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: headerHeight + 8,
        paddingBottom: Math.max(insets.bottom, 20),
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, width: "100%", maxWidth: 600, justifyContent: "center" }}>
        <SignaturePad
          ref={signaturePadRef}
          onSign={handleSignatureSubmit}
          disabled={submitting}
          onChangeHasDrawn={setHasSigned}
        />
      </View>

      <Stack width="100%" gap={8} hAlign="center" style={{ maxWidth: 600 }}>
        <Button
          fullWidth
          color={String(colors.primary)}
          variant="primary"
          label={t("Sign_Attendance_Validate")}
          disabled={!hasSigned || submitting}
          leading={
            submitting ? (
              <ActivityIndicator color="#ffffff" size={20} strokeWidth={2.5} />
            ) : undefined
          }
          onPress={() => signaturePadRef.current?.read()}
        />
        <Button
          fullWidth
          color={hasSigned ? dangerColor : undefined}
          variant="secondary"
          label={t("Sign_Attendance_Signature_Clear")}
          disabled={!hasSigned || submitting}
          leading={
            <Icon
              size={18}
              fill={hasSigned && !submitting ? dangerColor : undefined}
              papicon
            >
              <Papicons name="Trash" />
            </Icon>
          }
          onPress={() => {
            signaturePadRef.current?.clear();
          }}
        />
        <Button
          fullWidth
          color={String(colors.primary)}
          variant="secondary"
          label={t("Global_Back")}
          disabled={submitting}
          onPress={() => router.back()}
        />
      </Stack>
    </View>
  );
}
