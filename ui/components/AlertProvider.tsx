import * as LucideIcons from "lucide-react-native";
import type { ComponentType } from "react";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
} from "react-native";
import Reanimated, {
  LinearTransition,
} from "react-native-reanimated";

import { Animation } from "../utils/Animation";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Typography from "./Typography";

// Extend Alert type with unique ID for better performance
type Alert = {
  id?: string;
  title: string;
  message?: string;
  description?: string;
  technical?: string;
  icon?: string;
  color?: string;
  withoutNavbar?: boolean;
  delay?: number;
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

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const router = useRouter();
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Memoized showAlert function to prevent re-renders
  const showAlert = useCallback((alert: Alert) => {
    const alertId = alert.id || `alert_${Date.now()}_${Math.random()}`;
    const alertWithId = { ...alert, id: alertId };

    setAlerts((prevAlerts) => [...prevAlerts, alertWithId]);

    // Clear existing timeout if alert is updated
    const existingTimeout = timeoutRefs.current.get(alertId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Automatically remove the alert after 5 seconds
    const timeout = setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter(a => a.id !== alertId));
      timeoutRefs.current.delete(alertId);
    }, alert.delay || 5000);

    timeoutRefs.current.set(alertId, timeout);
  }, []);

  // Memoized container style to prevent style recalculations
  const containerStyle = useMemo(() => ({
    position: "absolute" as const,
    bottom: alerts.some(alert => alert.withoutNavbar) ? 22 : 82,
    left: 0,
    right: 0,
    padding: 14,
    zIndex: 1000,
    gap: 10,
  }), [alerts]);

  // Memoized alert removal function
  const removeAlert = useCallback((alertId: string) => {
    const timeout = timeoutRefs.current.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(alertId);
    }
    setAlerts((prevAlerts) => prevAlerts.filter(a => a.id !== alertId));
  }, []);

  // Memoized alert press handler
  const handleAlertPress = useCallback((alert: Alert, alertId: string) => {
    router.push({
      pathname: "/alert",
      params: {
        ...alert,
      },
    });
    removeAlert(alertId);
  }, [router, removeAlert]);

  // Memoized context value to prevent provider re-renders
  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeoutRefs.current.clear();
    };
  }, []);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}

      <KeyboardAvoidingView
        behavior={"height"}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        pointerEvents={"box-none"}
      >
        {alerts.length > 0 && (
          <Reanimated.View
            layout={Animation(LinearTransition)}
            style={containerStyle}
          >
            {alerts.map((alert) => (
              <AlertComponent
                alert={alert}
                key={alert.id}
                onPress={() => handleAlertPress(alert, alert.id!)}
              />
            ))}
          </Reanimated.View>
        )}
      </KeyboardAvoidingView>
    </AlertContext.Provider>
  );
};

// Optimized Alert component with React.memo and useMemo
const AlertComponent = React.memo(({ alert, onPress }: { alert: Alert, onPress?: () => void }) => {
  const { colors } = useTheme();

  // Memoized icon component to prevent re-renders
  const IconComponent = useMemo(() => {
    if (!alert.icon) {
      return null;
    }
    return LucideIcons[alert.icon as keyof typeof LucideIcons] as ComponentType<any>;
  }, [alert.icon]);

  // Memoized styles for better performance
  const containerStyle = useMemo(() => [
    styles.alertContainer,
    {
      backgroundColor: colors.card,
      borderColor: colors.text + "30",
    },
  ], [colors.card, colors.text]);

  const iconColor = useMemo(() => alert.color ?? colors.text, [alert.color, colors.text]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      layout={Animation(LinearTransition)}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      style={containerStyle}
    >
      {IconComponent && (
        <Reanimated.View style={styles.iconContainer}>
          <IconComponent size={24}
            color={iconColor}
          />
        </Reanimated.View>
      )}
      <Reanimated.View style={styles.textContainer}>
        <Typography variant="title"
          color="text"
        >{alert.title}</Typography>
        {alert.message && (
          <Typography variant="body1"
            color="secondary"
          >{alert.message}</Typography>
        )}
      </Reanimated.View>
    </AnimatedPressable>
  );
});

AlertComponent.displayName = "AlertComponent";

// Export Alert for backwards compatibility
export const Alert = AlertComponent;

// Pre-calculated styles for maximum performance
const styles = StyleSheet.create({
  alertContainer: {
    borderWidth: 0.5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderCurve: "continuous",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Add elevation for Android performance
    elevation: 1,
  },
  iconContainer: {
    // Empty for now, can be used for icon-specific optimizations
  },
  textContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
});
