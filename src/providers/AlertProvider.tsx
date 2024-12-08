import { useTheme } from "@react-navigation/native";
import { Check } from "lucide-react-native";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Modal, View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { LinearTransition, FadeInDown, FadeOutDown } from "react-native-reanimated";

type AlertAction = {
  title: string;
  onPress: () => void;
  icon?: React.ReactElement;
  primary?: boolean;
  backgroundColor?: string;
};

export type Alert = {
  title: string;
  message: string;
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
  const [alert, setAlert] = useState<Alert>({ title: "", message: "", actions: [] });
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const showAlert = ({
    title = "",
    message = "",
    actions = [
      {
        title: "Compris !",
        onPress: () => hideAlert(),
        icon: <Check />,
        primary: true,
      },
    ],
  }: Partial<Alert>) => {
    actions.forEach(action => {
      let mainColor = colors.text;

      if (action.primary) {
        mainColor = "#ffffff";
      }

      // for each action icon, create a new component and change color to primary
      if (action.icon) {
        action.icon = React.cloneElement(action.icon, { color: mainColor, size: 24 });
      } else {
        action.icon = React.cloneElement(<Check />, { color: mainColor, size: 24 });
      }

      // if no onPress function is provided, hide the alert
      if (!action.onPress) {
        action.onPress = () => hideAlert();
      }

      // if action has no primary prop, set it to false
      if (action.primary === undefined) {
        action.primary = false;
      }
    });

    setVisible(true);
    setModalVisible(true);

    setAlert({ title, message, actions });
  };

  const hideAlert = () => {
    setVisible(false);
    setAlert({ title: "", message: "", actions: [] });

    setTimeout(() => {
      setModalVisible(false);
    }, 100);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideAlert}
        animationType="fade"
      >
        <Reanimated.View
          style={styles.modalContainer}
          layout={LinearTransition}
        >
          <Pressable
            style={{ flex: 1, width: "100%" }}
            onPress={hideAlert}
            onTouchEnd={hideAlert}
          />

          {visible && (
            <Reanimated.View
              style={[
                styles.alertBox,
                {
                  backgroundColor: colors.card,
                  marginBottom: 10 + insets.bottom,
                  width: Dimensions.get("window").width - 20,
                  maxWidth: 600,
                }
              ]}
              entering={FadeInDown.duration(200)}
              exiting={FadeOutDown.duration(100)}
            >
              <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {alert.title}
                </Text>

                <Text style={[styles.message, { color: colors.text }]}>
                  {alert.message}
                </Text>
              </View>

              <View style={[styles.buttons, { borderColor: colors.border, backgroundColor: colors.text + "0a" }]}>
                {(alert.actions ?? []).map(({ title, onPress, icon, primary, backgroundColor }) => (
                  <Pressable
                    key={title}
                    onPress={() => {
                      onPress();
                      hideAlert();
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      primary && styles.primaryButton,
                      primary && {
                        backgroundColor: backgroundColor ? backgroundColor : colors.primary,
                      },
                      {
                        opacity: primary ? (pressed ? 0.6 : 1) : (pressed ? 0.3 : 0.6),
                      }
                    ]}
                  >
                    {icon ? icon : null}

                    <Text style={[styles.buttonText, { color: colors.text }, primary && styles.primaryButtonText]}>
                      {title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Reanimated.View>
          )}
        </Reanimated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  alertBox: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },

  contentContainer: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    paddingBottom: 0,
    gap: 6,
  },

  title: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: "semibold",
  },

  message: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "medium",
    opacity: 0.6,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  button: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 300,
    paddingVertical: 7,
    paddingHorizontal: 10,
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "medium",
  },

  primaryButton: {
    opacity: 1,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontFamily: "semibold",
  },
});

export default AlertProvider;
