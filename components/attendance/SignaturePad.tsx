import { useTheme } from "expo-router/react-navigation";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import * as ImageManipulator from "expo-image-manipulator";

import Typography from "@/ui/new/Typography";

export interface SignaturePadRef {
  clear: () => void;
  read: () => void;
}

interface SignaturePadProps {
  onSign: (signature: string) => void;
  onEmpty?: () => void;
  disabled?: boolean;
  onBegin?: () => void;
  onEnd?: () => void;
  onChangeHasDrawn?: (hasDrawn: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    { onSign, onEmpty, disabled, onBegin, onEnd, onChangeHasDrawn, style },
    ref
  ) => {
    const { colors, dark } = useTheme();
    const signatureRef = useRef<SignatureViewRef>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    const updateHasDrawn = (drawn: boolean) => {
      setHasDrawn(drawn);
      onChangeHasDrawn?.(drawn);
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clearSignature();
        updateHasDrawn(false);
      },
      read: () => {
        signatureRef.current?.readSignature();
      },
    }));

    const webStyle = `
      * {
        touch-action: none !important;
        -webkit-touch-callout: none !important;
      }
      .m-signature-pad--footer {
        display: none !important;
        margin: 0px !important;
      }
      body, html {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: transparent !important;
        touch-action: none !important;
        overflow: hidden !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      .m-signature-pad {
        box-shadow: none !important;
        border: none !important;
        background-color: transparent !important;
        touch-action: none !important;
        overflow: hidden !important;
      }
      .m-signature-pad--body {
        border: none !important;
        touch-action: none !important;
        overflow: hidden !important;
      }
      .m-signature-pad--body canvas {
        touch-action: none !important;
      }
    `;

    return (
      <View style={[styles.container, style]}>
        <View
          style={[
            styles.canvasCard,
            {
              backgroundColor: "#FFFFFF",
              borderColor: dark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          {/* Signature baseline helper */}
          <View style={styles.baselineGuide} pointerEvents="none">
            <Typography
              variant="caption"
              color="textSecondary"
              style={styles.guideX}
            >
              ✕
            </Typography>
            <View style={styles.baselineLine} />
          </View>

          <SignatureScreen
            ref={signatureRef}
            onOK={async (sig) => {
              try {
                const result = await ImageManipulator.manipulateAsync(
                  sig,
                  [{ resize: { width: 400, height: 200 } }],
                  { base64: true, format: ImageManipulator.SaveFormat.PNG }
                );
                onSign(`data:image/png;base64,${result.base64}`);
              } catch (err) {
                console.error("Failed to resize signature:", err);
                onSign(sig);
              }
            }}
            onEmpty={() => {
              updateHasDrawn(false);
              onEmpty?.();
            }}
            onClear={() => updateHasDrawn(false)}
            onBegin={() => {
              updateHasDrawn(true);
              onBegin?.();
            }}
            onEnd={() => onEnd?.()}
            webStyle={webStyle}
            backgroundColor="#FFFFFF"
            penColor="#0F172A"
            minWidth={2.5}
            maxWidth={4.5}
            dotSize={3}
            autoClear={false}
            nestedScrollEnabled={false}
            scrollable={false}
            webviewProps={{
              scrollEnabled: false,
              bounces: false,
              overScrollMode: "never",
            }}
            style={styles.signatureScreen}
          />
        </View>
      </View>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  canvasCard: {
    width: "100%",
    aspectRatio: 400 / 200,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
  },
  signatureScreen: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  baselineGuide: {
    position: "absolute",
    bottom: 22,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.35,
    zIndex: 0,
  },
  guideX: {
    fontSize: 13,
    fontWeight: "600",
  },
  baselineLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#64748B",
    borderStyle: "dashed",
  },
});
