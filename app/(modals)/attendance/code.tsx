import { router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoginView from "@/app/(onboarding)/components/LoginView";
import { getCourseById } from "@/database/useTimetable";
import { Course } from "@/services/shared/timetable";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { useAlert } from "@/ui/components/AlertProvider";
import { getSubjectColor } from "@/utils/subjects/colors";
import { useSubmitAttendance } from "./useSubmitAttendance";
import { getTempSignature } from "./signatureStore";

export default function AttendanceCode() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const alert = useAlert();
  const { submitAttendance, submitting } = useSubmitAttendance();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (id) {
      getCourseById(id)
        .then(result => {
          if (!cancelled) setCourse(result || null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  const subjectColor = course
    ? getSubjectColor(course.subject)
    : String(colors.primary);

  const handleContinue = (values: { [key: string]: string }) => {
    const signature = getTempSignature();
    if (submitting || !course || !signature) return;

    const rawCode = (values.code || code || "").trim();
    if (!rawCode) {
      alert.showAlert({
        title: t("Sign_Attendance_Error"),
        message: t("Sign_Attendance_Empty_Code"),
        icon: "AlertTriangle",
        color: "#EF4444",
      });
      return;
    }
    Keyboard.dismiss();
    submitAttendance({
      course,
      method: "code",
      code: rawCode,
      signature,
    });
  };

  const fields = [
    {
      name: "code",
      placeholder: t("Sign_Attendance_Code_Placeholder"),
      secureTextEntry: false,
      defaultValue: code,
      autoCapitalize: "characters" as const,
      autoCorrect: false,
    },
  ];

  const actions = [
    {
      label: t("ONBOARDING_CONTINUE"),
      variant: "primary" as const,
      submit: true,
    },
    {
      label: t("Global_Back"),
      variant: "secondary" as const,
      onPress: () => router.back(),
    },
  ];

  if (loading || !course) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={String(colors.primary)} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingBottom: insets.bottom,
        }}
      >
        <LoginView
          color={String(colors.primary)}
          serviceName={course.subject}
          serviceSubtitle={t("Sign_Attendance_Code_Description")}
          serviceIcon={require("@/assets/images/service_edusign.png")}
          fields={fields}
          actions={actions}
          onSubmit={handleContinue}
          showDisclaimer={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
