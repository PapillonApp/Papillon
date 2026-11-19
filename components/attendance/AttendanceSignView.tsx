import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Reanimated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { updateCourseAttendance } from "@/database/useTimetable";
import { getManager } from "@/services/shared";
import { Course } from "@/services/shared/timetable";
import { useAlert } from "@/ui/components/AlertProvider";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import NewButton from "@/ui/new/Button";
import PapillonTextInput from "@/ui/new/TextInput";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { cancelSignReminder } from "@/utils/notifications/signReminders";

import SignaturePad, { SignaturePadRef } from "./SignaturePad";

export interface AttendanceSignViewProps {
  course: Course;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AttendanceSignView({
  course,
  onClose,
  onSuccess,
}: AttendanceSignViewProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const alert = useAlert();
  const { t } = useTranslation();

  const [step, setStep] = useState<"menu" | "scan" | "code" | "sign">("menu");
  const [method, setMethod] = useState<"scan" | "code">("scan");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [code, setCode] = useState("");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const subjectColor = getSubjectColor(course.subject);
  const subjectEmoji = getSubjectEmoji(course.subject);

  // Request camera permission only when entering scan mode
  useEffect(() => {
    if (step === "scan" && !permission?.granted) {
      requestPermission();
    }
  }, [step, permission?.granted, requestPermission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedData || step !== "scan") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScannedData(data);
    setDirection("forward");
    setStep("sign");
  };

  const handleCodeSubmit = () => {
    if (!code.trim()) {
      alert.showAlert({
        title: t("Sign_Attendance_Error"),
        message: t("Sign_Attendance_Empty_Code"),
        icon: "AlertTriangle",
        color: "#EF4444",
      });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDirection("forward");
    setStep("sign");
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

    setSubmitting(true);
    try {
      const manager = getManager();
      if (!manager) {
        throw new Error("Manager not initialized");
      }

      await manager.signAttendance(
        {
          courseId: course.id,
          qrCodeData:
            method === "scan" && scannedData ? scannedData : undefined,
          code: method === "code" && code ? code.trim() : undefined,
          signature: base64Signature,
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

      onSuccess?.();
      onClose();
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = err?.message || String(err);
      if (
        errorMessage.includes("ERR_STUDENT_ALREADY_PRESENT") ||
        errorMessage.includes("already") ||
        errorMessage.includes("StudentAlreadyPresent")
      ) {
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
        onSuccess?.();
        onClose();
      } else {
        alert.showAlert({
          title: t("Sign_Attendance_Error"),
          message: errorMessage,
          icon: "AlertTriangle",
          color: "#EF4444",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            step === "scan" ? "#000000" : String(colors.background),
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {/* STEP 1: Menu View (Course Summary Card + Action Buttons) */}
        {step === "menu" && (
          <Reanimated.View
            key="step-menu"
            entering={
              direction === "forward" ? undefined : SlideInLeft.duration(260)
            }
            exiting={SlideOutLeft.duration(220)}
            style={styles.stepContainer}
          >
            {/* Header Bar */}
            <View style={styles.navHeader}>
              <View style={{ width: 40 }} />
              <Typography
                variant="title"
                style={[styles.navHeaderTitle, { color: String(colors.text) }]}
              >
                {t("Sign_Attendance_Title")}
              </Typography>
              <AnimatedPressable
                onPress={onClose}
                style={styles.navHeaderButton}
              >
                <Papicons name="Cross" size={24} fill={String(colors.text)} />
              </AnimatedPressable>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.menuScrollContent,
                { paddingBottom: Math.max(insets.bottom, 20) + 20 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Course Summary Card (Rappel du cours) */}
              <Stack
                card
                radius={20}
                padding={18}
                gap={12}
                backgroundColor={dark ? String(colors.card) : "#FFFFFF"}
                style={{
                  borderWidth: 1,
                  borderColor: String(colors.border),
                  maxWidth: 500,
                  width: "100%",
                }}
              >
                <Stack direction="horizontal" vAlign="center" gap={12}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: `${subjectColor}20`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {subjectEmoji ? (
                      <Typography style={{ fontSize: 22 }}>
                        {subjectEmoji}
                      </Typography>
                    ) : (
                      <Icon size={24} fill={subjectColor} papicon>
                        <Papicons name="Calendar" />
                      </Icon>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography
                      variant="title"
                      style={{
                        color: colors.text,
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                    >
                      {course.subject}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      style={{ marginTop: 2 }}
                    >
                      {formatDate(course.from)}
                    </Typography>
                  </View>
                </Stack>

                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: String(colors.border),
                    marginVertical: 2,
                  }}
                />

                <Stack direction="horizontal" gap={16} vAlign="center">
                  {course.teacher ? (
                    <Stack direction="horizontal" vAlign="center" gap={6}>
                      <Icon size={16} fill={String(colors.text)} papicon>
                        <Papicons name="User" />
                      </Icon>
                      <Typography variant="body2" color="textSecondary">
                        {course.teacher}
                      </Typography>
                    </Stack>
                  ) : null}
                  {course.room ? (
                    <Stack direction="horizontal" vAlign="center" gap={6}>
                      <Icon size={16} fill={String(colors.text)} papicon>
                        <Papicons name="Pin" />
                      </Icon>
                      <Typography variant="body2" color="textSecondary">
                        {course.room}
                      </Typography>
                    </Stack>
                  ) : null}
                </Stack>

                <Stack direction="horizontal" vAlign="center" gap={6}>
                  <Icon size={16} fill={String(colors.text)} papicon>
                    <Papicons name="Clock" />
                  </Icon>
                  <Typography variant="body2" color="textSecondary">
                    {formatTime(course.from)} - {formatTime(course.to)}
                  </Typography>
                </Stack>
              </Stack>

              {/* Subtitle */}
              <View
                style={{
                  width: "100%",
                  maxWidth: 500,
                  marginTop: 24,
                  marginBottom: 12,
                }}
              >
                <Typography
                  variant="body1"
                  weight="semibold"
                  color="textSecondary"
                >
                  {t("Sign_Attendance_Menu_Subtitle")}
                </Typography>
              </View>

              {/* Action Buttons */}
              <Stack width="100%" gap={12} style={{ maxWidth: 500 }}>
                <NewButton
                  color={String(colors.primary)}
                  fullWidth
                  label={t("Sign_Attendance_With_QR")}
                  variant="primary"
                  height={54}
                  leading={
                    <Icon size={22} fill="#ffffff" papicon>
                      <Papicons name="QrCode" />
                    </Icon>
                  }
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setDirection("forward");
                    setMethod("scan");
                    setStep("scan");
                  }}
                />

                <NewButton
                  color={String(colors.primary)}
                  fullWidth
                  label={t("Sign_Attendance_With_Code")}
                  variant="secondary"
                  height={54}
                  leading={
                    <Icon size={22} fill={String(colors.text)} papicon>
                      <Papicons name="Key" />
                    </Icon>
                  }
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setDirection("forward");
                    setMethod("code");
                    setStep("code");
                  }}
                />
              </Stack>
            </ScrollView>
          </Reanimated.View>
        )}

        {/* STEP 2A: QR Scanner (Pronote Cutout, Top Padding, NO tabs) */}
        {step === "scan" && (
          <Reanimated.View
            key="step-scan"
            entering={
              direction === "forward"
                ? SlideInRight.duration(260)
                : SlideInLeft.duration(260)
            }
            exiting={
              direction === "forward"
                ? SlideOutLeft.duration(220)
                : SlideOutRight.duration(220)
            }
            style={[styles.stepContainer, { backgroundColor: "#000000" }]}
          >
            {/* Top Navigation Bar */}
            <View style={styles.scannerNavHeader}>
              <AnimatedPressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDirection("back");
                  setStep("menu");
                }}
                style={styles.scannerRoundButton}
              >
                <Papicons name="ArrowLeft" size={24} fill="#ffffff" />
              </AnimatedPressable>

              <Typography
                variant="title"
                style={[styles.navHeaderTitle, { color: "#ffffff" }]}
              >
                {t("Sign_Attendance_Scan_QR")}
              </Typography>

              <AnimatedPressable
                onPress={onClose}
                style={styles.scannerRoundButton}
              >
                <Papicons name="Cross" size={24} fill="#ffffff" />
              </AnimatedPressable>
            </View>

            {/* Top Explanations Block (Pronote Style with padding) */}
            <View style={styles.scannerExplainations}>
              <Icon size={36} fill="white" papicon>
                <Papicons name="QrCode" />
              </Icon>
              <Typography style={styles.scannerTitle}>
                {course.subject
                  ? course.subject.toUpperCase()
                  : t("Sign_Attendance_Title").toUpperCase()}
              </Typography>
              <Typography style={styles.scannerText}>
                {t("Sign_Attendance_Scan_Instruction")}
              </Typography>
            </View>

            {/* Camera View Mode with Cutout */}
            <View style={StyleSheet.absoluteFill}>
              {!permission?.granted ? (
                <View style={styles.permissionContainer}>
                  <Icon
                    size={48}
                    fill="white"
                    papicon
                    style={{ marginBottom: 16 }}
                  >
                    <Papicons name="Camera" />
                  </Icon>
                  <Typography style={styles.permissionText}>
                    {t("Sign_Attendance_Camera_Permission")}
                  </Typography>
                  <View style={{ width: 220, marginTop: 16 }}>
                    <Button
                      title={t("Sign_Attendance_Grant_Permission")}
                      onPress={requestPermission}
                    />
                  </View>
                </View>
              ) : (
                <MaskedView
                  style={StyleSheet.absoluteFill}
                  maskElement={
                    <View style={styles.maskContainer}>
                      <View style={styles.transparentSquare} />
                    </View>
                  }
                >
                  <View style={styles.maskContainer} />
                  <CameraView
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    onBarcodeScanned={
                      scannedData ? undefined : handleBarcodeScanned
                    }
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.transparentSquareBorder} />
                </MaskedView>
              )}
            </View>
          </Reanimated.View>
        )}

        {/* STEP 2B: Code Input View (LoginView style) */}
        {step === "code" && (
          <Reanimated.View
            key="step-code"
            entering={
              direction === "forward"
                ? SlideInRight.duration(260)
                : SlideInLeft.duration(260)
            }
            exiting={
              direction === "forward"
                ? SlideOutLeft.duration(220)
                : SlideOutRight.duration(220)
            }
            style={styles.stepContainer}
          >
            {/* Navigation Header */}
            <View style={styles.navHeader}>
              <AnimatedPressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDirection("back");
                  setStep("menu");
                }}
                style={styles.navHeaderButton}
              >
                <Papicons
                  name="ArrowLeft"
                  size={24}
                  fill={String(colors.text)}
                />
              </AnimatedPressable>

              <Typography
                variant="title"
                style={[styles.navHeaderTitle, { color: String(colors.text) }]}
              >
                {t("Sign_Attendance_Code_Title")}
              </Typography>

              <AnimatedPressable
                onPress={onClose}
                style={styles.navHeaderButton}
              >
                <Papicons name="Cross" size={24} fill={String(colors.text)} />
              </AnimatedPressable>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.codeContainer}
            >
              <Pressable
                style={[
                  styles.codeInnerPressable,
                  { paddingBottom: Math.max(insets.bottom, 16) + 16 },
                ]}
                onPress={Keyboard.dismiss}
              >
                <View style={styles.codeHeader}>
                  {/* 72x72 Tile (LoginView style) */}
                  <View
                    style={[
                      styles.codeIconBox,
                      {
                        borderColor: String(colors.text) + "20",
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Icon size={36} fill="#ffffff" papicon>
                      <Papicons name="Key" />
                    </Icon>
                  </View>

                  <Typography
                    variant="body1"
                    align="center"
                    style={[
                      styles.codeSubtitle,
                      { color: String(colors.text) + "88" },
                    ]}
                  >
                    {t("Sign_Attendance_Code_Description")}
                  </Typography>

                  <Typography
                    variant="h3"
                    align="center"
                    style={[styles.codeTitle, { color: colors.text }]}
                  >
                    {course.subject || t("Sign_Attendance_Code_Title")}
                  </Typography>

                  {/* Inputs Stack matching LoginView */}
                  <Stack width="100%" gap={8} style={styles.codeInputsStack}>
                    <PapillonTextInput
                      color={String(colors.primary)}
                      placeholder={t("Sign_Attendance_Code_Placeholder")}
                      value={code}
                      onChangeText={setCode}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleCodeSubmit}
                      autoFocus
                    />
                  </Stack>
                </View>

                {/* Bottom Button Stack matching LoginView */}
                <Stack
                  width="100%"
                  gap={8}
                  hAlign="center"
                  style={styles.codeBottomStack}
                >
                  <NewButton
                    color={String(colors.primary)}
                    fullWidth
                    label={t("Sign_Attendance_Continue")}
                    variant="primary"
                    disabled={!code.trim()}
                    onPress={handleCodeSubmit}
                  />
                </Stack>
              </Pressable>
            </KeyboardAvoidingView>
          </Reanimated.View>
        )}

        {/* STEP 3: Signature Screen */}
        {step === "sign" && (
          <Reanimated.View
            key="step-sign"
            entering={SlideInRight.duration(260)}
            exiting={SlideOutRight.duration(220)}
            style={styles.stepContainer}
          >
            {/* Navigation Header */}
            <View style={styles.navHeader}>
              <AnimatedPressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDirection("back");
                  setStep(method);
                  setScannedData(null);
                }}
                style={styles.navHeaderButton}
              >
                <Papicons
                  name="ArrowLeft"
                  size={24}
                  fill={String(colors.text)}
                />
              </AnimatedPressable>

              <Typography
                variant="title"
                style={[styles.navHeaderTitle, { color: String(colors.text) }]}
              >
                {t("Sign_Attendance_Title")}
              </Typography>

              <AnimatedPressable
                onPress={onClose}
                style={styles.navHeaderButton}
              >
                <Papicons name="Cross" size={24} fill={String(colors.text)} />
              </AnimatedPressable>
            </View>

            <View
              style={[styles.signBody, { paddingBottom: insets.bottom + 20 }]}
            >
              <Stack width="100%" style={{ maxWidth: 600 }} gap={16}>
                {/* Course Summary Card */}
                <Stack
                  card
                  radius={18}
                  padding={16}
                  gap={10}
                  backgroundColor={dark ? String(colors.card) : "#FFFFFF"}
                  style={{
                    borderWidth: 1,
                    borderColor: String(colors.border),
                  }}
                >
                  <Stack direction="horizontal" vAlign="center" gap={10}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: `${subjectColor}20`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {subjectEmoji ? (
                        <Typography style={{ fontSize: 18 }}>
                          {subjectEmoji}
                        </Typography>
                      ) : (
                        <Icon size={18} fill={subjectColor} papicon>
                          <Papicons name="Calendar" />
                        </Icon>
                      )}
                    </View>
                    <Typography
                      variant="title"
                      style={{ color: colors.text, fontSize: 17, flex: 1 }}
                    >
                      {course.subject}
                    </Typography>
                  </Stack>

                  <Stack direction="horizontal" gap={16} vAlign="center">
                    {course.teacher ? (
                      <Stack direction="horizontal" vAlign="center" gap={4}>
                        <Icon size={14} fill={String(colors.text)} papicon>
                          <Papicons name="User" />
                        </Icon>
                        <Typography variant="caption" color="textSecondary">
                          {course.teacher}
                        </Typography>
                      </Stack>
                    ) : null}
                    {course.room ? (
                      <Stack direction="horizontal" vAlign="center" gap={4}>
                        <Icon size={14} fill={String(colors.text)} papicon>
                          <Papicons name="Pin" />
                        </Icon>
                        <Typography variant="caption" color="textSecondary">
                          {course.room}
                        </Typography>
                      </Stack>
                    ) : null}
                  </Stack>

                  <Stack direction="horizontal" vAlign="center" gap={6}>
                    <Icon size={14} fill={String(colors.text)} papicon>
                      <Papicons name="Clock" />
                    </Icon>
                    <Typography variant="caption" color="textSecondary">
                      {formatTime(course.from)} - {formatTime(course.to)}
                    </Typography>
                  </Stack>

                  {/* Verification method pill */}
                  <View
                    style={[
                      styles.methodBadge,
                      {
                        backgroundColor: `${String(colors.primary)}15`,
                        borderColor: `${String(colors.primary)}30`,
                      },
                    ]}
                  >
                    <Icon size={14} fill={String(colors.primary)} papicon>
                      <Papicons name={method === "scan" ? "QrCode" : "Key"} />
                    </Icon>
                    <Typography
                      variant="caption"
                      style={{
                        color: String(colors.primary),
                        fontWeight: "600",
                      }}
                    >
                      {method === "scan"
                        ? t("Sign_Attendance_Method_QR")
                        : `${t("Sign_Attendance_Method_Code")} : ${code}`}
                    </Typography>
                  </View>
                </Stack>

                {/* Signature Section */}
                <View style={styles.signInstructionBlock}>
                  <Typography variant="title" style={{ color: colors.text }}>
                    {t("Sign_Attendance_Signature_Title")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginTop: 2 }}
                  >
                    {t("Sign_Attendance_Signature_Subtitle")}
                  </Typography>
                </View>

                {/* Signature Canvas Pad */}
                <SignaturePad
                  ref={signaturePadRef}
                  onSign={handleSignatureSubmit}
                  disabled={submitting}
                />
              </Stack>

              {/* Validation Action */}
              <View style={styles.submitSection}>
                <Button
                  title={t("Sign_Attendance_Validate")}
                  variant="primary"
                  color="primary"
                  loading={submitting}
                  disabled={submitting}
                  onPress={() => signaturePadRef.current?.read()}
                />
              </View>
            </View>
          </Reanimated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  stepContainer: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },

  /* Navigation Header (Papillon Standard with top padding) */
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
    zIndex: 10,
  },
  navHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navHeaderTitle: {
    fontSize: 17,
    fontWeight: "600",
  },

  /* Menu Content */
  menuScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },

  /* Step: QR Scanner */
  scannerNavHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 9999,
  },
  scannerRoundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerExplainations: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 16,
    gap: 8,
    zIndex: 9999,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scannerText: {
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    maxWidth: 320,
  },

  /* Cutout & Camera Styling (Pronote) */
  maskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  transparentSquare: {
    position: "absolute",
    width: 290,
    height: 290,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 28,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "34%",
  },
  transparentSquareBorder: {
    position: "absolute",
    width: 290,
    height: 290,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 28,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "34%",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
  },

  /* Step: Code Input View */
  codeContainer: {
    flex: 1,
    width: "100%",
  },
  codeInnerPressable: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeHeader: {
    alignItems: "center",
    width: "100%",
    maxWidth: 500,
  },
  codeIconBox: {
    borderWidth: 1,
    width: 72,
    height: 72,
    borderRadius: 20,
    borderCurve: "continuous",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  codeSubtitle: {
    marginBottom: 4,
  },
  codeTitle: {
    fontWeight: "700",
  },
  codeInputsStack: {
    maxWidth: 500,
    marginTop: 28,
  },
  codeBottomStack: {
    maxWidth: 500,
    marginTop: "auto",
  },

  /* Step: Signature Screen */
  signBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    marginTop: 4,
  },
  signInstructionBlock: {
    width: "100%",
    marginTop: 8,
    marginBottom: 4,
  },
  submitSection: {
    width: "100%",
    maxWidth: 600,
    marginTop: "auto",
  },
});
