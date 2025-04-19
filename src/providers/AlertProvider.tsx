import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Check } from "lucide-react-native";
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode, memo } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import NativeTouchable from "@/components/Global/NativeTouchable";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import { anim2Papillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";

type AlertAction = {
  title: string;
  onPress?: () => void;
  icon: React.ReactElement;
  primary?: boolean;
  danger?: boolean;
  backgroundColor?: string;
  delayDisable?: number;
};

export type Alert = {
  title: string;
  message: string;
  icon: React.ReactElement;
  actions?: AlertAction[];
};

type AlertContextType = {
  showAlert: (alert: Alert) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

type AlertProviderProps = {
  children: ReactNode;
};

const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [visible, setVisible] = useState(false);
  const [delays, setDelays] = useState<{ [key: string]: number }>({});

  const { colors } = useTheme();
  const { isTablet } = useScreenDimensions();
  const insets = useSafeAreaInsets();

  const showAlert = useCallback(({
    title,
    message,
    icon,
    actions = [
      {
        title: "Compris !",
        onPress: hideAlert,
        icon: <Check />,
        primary: true,
      },
    ],
  }: Alert) => {
    setAlert({ title, message, icon, actions });
    setVisible(true);

    const initialDelays = actions.reduce((acc, action) => {
      acc[action.title] = action.delayDisable || 0;
      return acc;
    }, {} as { [key: string]: number });

    setDelays(initialDelays);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setAlert(null), 150);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDelays((prevDelays) => {
        const newDelays = { ...prevDelays };
        Object.keys(newDelays).forEach((key) => {
          if (newDelays[key] > 0) {
            newDelays[key] -= 1;
          }
        });
        return newDelays;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Modal transparent onRequestClose={hideAlert} animationType="none">
          {visible && (
            <View style={{ flex: 1 }}>
              <Reanimated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(150)}
                style={styles.overlay}
              >
                <BlurView intensity={10} style={styles.blur} />
              </Reanimated.View>

              <Reanimated.View
                style={[
                  styles.modalContainer,
                  { width: isTablet ? "50%" : "100%", alignSelf: "center" },
                ]}
                layout={LinearTransition}
              >
                <Pressable style={styles.pressable} onPress={hideAlert} />
                <Reanimated.View
                  style={[
                    styles.alertBox,
                    { backgroundColor: colors.card, marginBottom: 10 + insets.bottom },
                  ]}
                  entering={PapillonContextEnter}
                  exiting={PapillonContextExit}
                >
                  <View style={styles.contentContainer}>
                    <View style={styles.titleContainer}>
                      {alert.icon &&
                        React.cloneElement(alert.icon, {
                          color: colors.text,
                          size: 24,
                        })}
                      <Text style={[styles.title, { color: colors.text }]}>
                        {alert.title}
                      </Text>
                    </View>
                    <Text style={[styles.message, { color: colors.text }]}>
                      {alert.message}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.buttons,
                      {
                        borderColor: colors.text + "20",
                        backgroundColor: colors.text + "06",
                        flexDirection: alert.actions && alert.actions?.length > 2 ? "column" : "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    {alert.actions?.map(
                      ({
                        title,
                        onPress,
                        icon,
                        primary,
                        danger,
                        backgroundColor,
                        delayDisable,
                      }) => (
                        <Reanimated.View
                          key={title}
                          layout={anim2Papillon(LinearTransition)}
                          style={[
                            (alert.actions?.length ?? 0) === 1 || (alert.actions?.length ?? 0) > 2
                              ? styles.singleButtonContainer
                              : null,
                            { borderRadius: 300, overflow: "hidden" },
                          ]}
                        >
                          <NativeTouchable
                            disabled={delays[title] > 0}
                            onPress={() => {
                              hideAlert();
                              onPress?.();
                            }}
                            contentContainerStyle={{ borderRadius: 300, overflow: "hidden" }}
                            style={[
                              // @ts-expect-error
                              alert.actions?.length === 1 || alert.actions?.length > 2
                                ? styles.singleButtonContainer
                                : null,
                              { borderRadius: 300, overflow: "hidden" },
                            ]}
                          >
                            <Reanimated.View
                              layout={anim2Papillon(LinearTransition)}
                              style={[
                                styles.button,
                                {
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: 300,
                                  overflow: "hidden",
                                },
                                // @ts-expect-error
                                alert.actions?.length === 1 || alert.actions?.length > 2
                                  ? styles.singleButton
                                  : null,
                                primary && !danger
                                  ? {
                                    backgroundColor:
                                        (backgroundColor ?? colors.primary) + (delays[title] > 0 ? "99" : ""),
                                  }
                                  : danger
                                    ? { backgroundColor: "#BE0B00" + (delays[title] > 0 ? "99" : "") }
                                    : { borderColor: colors.text + "44", borderWidth: 1 },
                              ]}
                            >
                              {icon &&
                                React.cloneElement(icon, {
                                  color: primary || danger ? "#ffffff" : colors.text,
                                  size: 24,
                                })}
                              <Reanimated.Text
                                layout={anim2Papillon(LinearTransition)}
                                style={[
                                  styles.buttonText,
                                  { color: danger ? "#ffffff" : colors.text },
                                  primary && styles.primaryButtonText,
                                ]}
                              >
                                {title}
                                {delays[title] > 0 ? ` (${delays[title]})` : ""}
                              </Reanimated.Text>

                              {delays[title] > 0 && (
                                <Reanimated.View
                                  layout={LinearTransition}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: `${(delays[title] / (delayDisable || 1)) * 120}%`,
                                    height: "200%",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                  }}
                                />
                              )}
                            </Reanimated.View>
                          </NativeTouchable>
                        </Reanimated.View>
                      )
                    )}
                  </View>
                </Reanimated.View>
              </Reanimated.View>
            </View>
          )}
        </Modal>
      )}
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  blur: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 100000000,
  },
  pressable: {
    flex: 1,
    width: "100%",
  },
  alertBox: {
    borderRadius: 17,
    borderCurve: "continuous",
    width: "100%",
    transformOrigin: "bottom center",
    overflow: "hidden",
  },
  contentContainer: {
    gap: 10,
    padding: 18,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "semibold",
  },
  message: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "medium",
    opacity: 0.6,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  button: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 300,
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  singleButton: {
    width: "100%",
  },
  singleButtonContainer: {
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "medium",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: "semibold",
  },
});

export default memo(AlertProvider);
