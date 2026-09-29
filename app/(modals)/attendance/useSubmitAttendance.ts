import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "expo-router/react-navigation";

import { updateCourseAttendance } from "@/database/useTimetable";
import { getManager } from "@/services/shared";
import { Course } from "@/services/shared/timetable";
import { useAlert } from "@/ui/components/AlertProvider";
import { cancelSignReminder } from "@/utils/notifications/signReminders";
import { useState } from "react";
import { StudentAlreadyPresentError } from "@studentsphere/linksign";

export function useSubmitAttendance() {
  const alert = useAlert();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const submitAttendance = async ({
    course,
    method,
    qrCodeData,
    code,
    signature,
    onSuccess,
  }: {
    course: Course;
    method: "scan" | "code";
    qrCodeData?: string;
    code?: string;
    signature: string;
    onSuccess?: () => void;
  }) => {
    setSubmitting(true);
    try {
      const manager = getManager();
      if (!manager) {
        throw new Error("Manager not initialized");
      }

      await manager.signAttendance(
        {
          courseId: course.externalId ?? course.id,
          qrCodeData: method === "scan" && qrCodeData ? qrCodeData : undefined,
          code: method === "code" && code ? code.trim() : undefined,
          signature: signature,
        },
        course.createdByAccount
      );

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cancelSignReminder(course);
      await updateCourseAttendance(course.id, {
        isSigned: true,
        isStudentPresent: true,
        canSign: false,
        customStatus: t("Present_Course"),
      });

      alert.showAlert({
        title: t("Sign_Attendance_Success"),
        icon: "Check",
        color: String(colors.primary),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.dismiss(3);
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (err instanceof StudentAlreadyPresentError) {
        cancelSignReminder(course);
        await updateCourseAttendance(course.id, {
          isSigned: true,
          isStudentPresent: true,
          canSign: false,
          customStatus: t("Present_Course"),
        });
        alert.showAlert({
          title: t("Sign_Attendance_Already_Present"),
          icon: "Info",
          color: "#F59E0B",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.dismiss(3);
        }
      } else {
        alert.showAlert({
          title: t("Sign_Attendance_Error"),
          message: err?.message || String(err),
          icon: "AlertTriangle",
          color: "#EF4444",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { submitAttendance, submitting };
}
