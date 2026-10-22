import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCourseById } from "@/database/useTimetable";
import { Course } from "@/services/shared/timetable";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";
import { useSubmitAttendance } from "./useSubmitAttendance";
import { getTempSignature } from "./signatureStore";

export default function AttendanceScan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { submitAttendance, submitting } = useSubmitAttendance();

  const [course, setCourse] = useState<Course | null>(null);
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    let cancelled = false;
    if (id) {
      getCourseById(id).then(result => {
        if (!cancelled) setCourse(result || null);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    console.log("QR scanned:", data);
    const signature = getTempSignature();
    if (scannedRef.current || !course || !signature) {
      console.log("Ignored scan. scanned:", scannedRef.current, "course:", !!course, "signature:", !!signature);
      return;
    }
    scannedRef.current = true;
    setScanned(true);
    submitAttendance({
      course,
      method: "scan",
      qrCodeData: data,
      signature,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      {/* Close Button (top-right round white button) */}
      <AnimatedPressable
        onPress={() => router.back()}
        style={styles.closeButton}
      >
        <Papicons name="Cross" size={20} fill="#000000" />
      </AnimatedPressable>

      {/* Explanations block matching Pronote */}
      <View style={styles.explainations}>
        <Icon size={40} fill="white" papicon>
          <Papicons name="QrCode" />
        </Icon>
        <Typography style={styles.explainTitle}>
          {course?.subject
            ? course.subject.toUpperCase()
            : t("Sign_Attendance_Title").toUpperCase()}
        </Typography>
        <Typography style={styles.explainText}>
          {t("Sign_Attendance_Scan_Instruction")}
        </Typography>
      </View>

      {/* Camera Cutout */}
      <View style={StyleSheet.absoluteFill}>
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Icon size={48} fill="white" papicon style={{ marginBottom: 16 }}>
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
              onBarcodeScanned={handleBarcodeScanned}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.transparentSquareBorder} />
          </MaskedView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 9999,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  explainations: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 68,
    gap: 8,
    zIndex: 9999,
  },
  explainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  explainText: {
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    maxWidth: 320,
    marginTop: 2,
  },
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
    top: "35%",
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
    top: "35%",
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
});
