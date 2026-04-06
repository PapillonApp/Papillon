import React from "react";
import type { AlertButton } from "react-native";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

import Button, { type Color as ButtonColor } from "./Button";
import Typography from "../new/Typography";
import { PapillonSpringIn } from "../utils/Transition";

export type DialogButton = AlertButton;

type DialogActionProps = {
  action: DialogButton;
  filled?: boolean;
  color: ButtonColor;
  fullWidth?: boolean;
  onPress: () => void;
};

type DialogProps = {
  visible: boolean;
  modalVisible: boolean;
  title?: string | null;
  message?: string | null;
  buttons?: DialogButton[];
  cancelable?: boolean;
  onDismiss: () => void;
  onPressButton: (button: DialogButton, index: number) => void;
};

function DialogAction({
  action,
  filled = false,
  color,
  fullWidth = false,
  onPress,
}: DialogActionProps) {
  const variant = filled ? "primary" : "ghost";

  return (
    <View
      style={[
        styles.actionContainer,
        filled && styles.actionFilledContainer,
        fullWidth && styles.actionFullWidth,
      ]}
    >
      <Button
        title={action.text ?? "OK"}
        onPress={onPress}
        variant={variant}
        color={color}
        inline={!fullWidth}
        style={styles.actionButton}
      />
    </View>
  );
}

export default function Dialog({
  visible,
  modalVisible,
  title,
  message,
  buttons = [],
  cancelable = false,
  onDismiss,
  onPressButton,
}: DialogProps) {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const normalizedButtons = buttons.length > 0 ? buttons : [{ text: "OK" }];
  const destructiveColor = (colors as any).danger ?? "#D70000";
  const cardColor =
    (colors as typeof colors & { item?: string }).item ?? colors.card;
  const dialogWidth = Math.min(
    Dimensions.get("window").width - insets.left - insets.right - 32,
    360
  );
  const content = `${title ?? ""} ${message ?? ""}`.toLowerCase();
  const dangerTone =
    normalizedButtons.some(button => button.style === "destructive") ||
    ["erreur", "error", "impossible", "echec", "échec", "failed"].some(
      keyword => content.includes(keyword)
    );
  const accentColor = dangerTone ? destructiveColor : colors.primary;
  const heroColor = dangerTone ? `${accentColor}20` : `${accentColor}18`;
  const hasCompactActions = normalizedButtons.length <= 2;
  const hasSingleAction = normalizedButtons.length === 1;
  const primaryAction = normalizedButtons[normalizedButtons.length - 1];
  const secondaryActions = normalizedButtons.slice(0, -1);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={() => {
        if (cancelable) {
          onDismiss();
        }
      }}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.24)" }]}
        onPress={cancelable ? onDismiss : undefined}
      />
      {modalVisible && (
        <Reanimated.View
          style={styles.container}
          pointerEvents="box-none"
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(200)}
        >
          <Reanimated.View
            entering={PapillonSpringIn}
            exiting={FadeOut.duration(200)}
            style={[
              styles.dialog,
              {
                backgroundColor: cardColor,
                borderColor: colors.border,
                width: dialogWidth,
              },
            ]}
          >
            <View style={[styles.hero, { backgroundColor: heroColor }]}>
              <View style={styles.heroIconContainer}>
                <Papicons name="Butterfly" color={accentColor} size={84} />
              </View>
            </View>

            {(title || message) && (
              <View style={styles.content}>
                {title ? (
                  <Typography variant="h4" weight="bold">
                    {title}
                  </Typography>
                ) : null}
                {message ? (
                  <Typography
                    variant="body1"
                    color={theme.dark ? "textSecondary" : colors.text}
                    style={title ? styles.message : undefined}
                  >
                    {message}
                  </Typography>
                ) : null}
              </View>
            )}

            {hasCompactActions ? (
              <View
                style={[
                  styles.compactActions,
                  hasSingleAction && styles.compactActionsSingle,
                ]}
              >
                {!hasSingleAction && secondaryActions.length > 0 ? (
                  <View style={styles.secondaryActions}>
                    {secondaryActions.map((button, index) => (
                      <DialogAction
                        key={`${button.text ?? "button"}-${index}`}
                        action={button}
                        color={
                          button.style === "destructive" ? "danger" : "text"
                        }
                        fullWidth
                        onPress={() => onPressButton(button, index)}
                      />
                    ))}
                  </View>
                ) : !hasSingleAction ? (
                  <View style={styles.secondarySpacer} />
                ) : null}

                <View
                  style={[
                    styles.primaryAction,
                    hasSingleAction && styles.primaryActionFull,
                  ]}
                >
                  <DialogAction
                    action={primaryAction}
                    filled
                    fullWidth
                    color={
                      primaryAction.style === "destructive" || dangerTone
                        ? "danger"
                        : "primary"
                    }
                    onPress={() =>
                      onPressButton(primaryAction, normalizedButtons.length - 1)
                    }
                  />
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.actions,
                  {
                    borderTopWidth: title || message ? 0.5 : 0,
                    borderTopColor: colors.text + "18",
                  },
                ]}
              >
                {normalizedButtons.map((button, index) => (
                  <View
                    key={`${button.text ?? "button"}-${index}`}
                    style={[
                      styles.stackedAction,
                      index > 0 && {
                        borderTopWidth: 0.5,
                        borderTopColor: colors.text + "18",
                      },
                    ]}
                  >
                    <DialogAction
                      action={button}
                      color={
                        button.style === "destructive" ? "danger" : "primary"
                      }
                      fullWidth
                      onPress={() => onPressButton(button, index)}
                    />
                  </View>
                ))}
              </View>
            )}
          </Reanimated.View>
        </Reanimated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialog: {
    borderRadius: 32,
    borderWidth: 0.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
    maxWidth: 360,
  },
  hero: {
    height: 158,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconContainer: {
    width: 116,
    height: 116,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    borderRadius: 99,
    padding: 2,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
  },
  message: {
    marginTop: 4,
  },
  actions: {
    overflow: "hidden",
  },
  compactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  compactActionsSingle: {
    paddingTop: 12,
  },
  secondaryActions: {
    flex: 1,
  },
  secondarySpacer: {
    flex: 1,
  },
  primaryAction: {
    minWidth: 168,
    maxWidth: "62%",
  },
  primaryActionFull: {
    minWidth: 0,
    maxWidth: "100%",
    flex: 1,
  },
  actionContainer: {
    borderRadius: 999,
    overflow: "hidden",
  },
  actionButton: {
    minHeight: 52,
  },
  actionFullWidth: {
    width: "100%",
  },
  actionFilledContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stackedAction: {
    borderRadius: 0,
    overflow: "hidden",
  },
});
