import { BlurView } from 'expo-blur';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { Animation } from '../utils/Animation';
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';

import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react-native";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Reanimated, {
  Easing,
  Extrapolate,
  interpolate,
  LinearTransition,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);


import Typography from "./Typography";
import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';
import { useTheme } from '@react-navigation/native';
import { AlertTriangle } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';

type Alert = {
  title: string;
  message?: string;
  description?: string;
  technical?: string;
  icon?: string;
  color?: string;
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
  const navigation = useNavigation();

  const showAlert = (alert: Alert) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
    
    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter(a => a !== alert));
    }, 5000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Reanimated.View
        layout={Animation(LinearTransition)}
        style={{
          position: "absolute",
          bottom: 82,
          left: 0,
          right: 0,
          padding: 14,
          zIndex: 1000,
          gap: 10,
        }}
      >
        {alerts.map((alert, index) => (
          <Alert
            alert={alert}
            key={index}
            onPress={() => {
              router.push({
                pathname: '/alert',
                params: {
                  ...alert,
                },
              });
              setAlerts((prevAlerts) => prevAlerts.filter((a, i) => i !== index));
            }}
          />
        ))}
      </Reanimated.View>
    </AlertContext.Provider>
  );
};

export const Alert = ({ alert, onPress }: { alert: Alert, onPress?: () => void }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const IconComponent =
      alert.icon && typeof alert.icon === "string"
        ? (LucideIcons[alert.icon as keyof typeof LucideIcons] as ComponentType<any>)
        : undefined;

  return (
    <AnimatedPressable
      onPress={handlePress}
      layout={Animation(LinearTransition)}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.text + "30",
          borderWidth: 0.5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
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
        }
      ]}
    >
      {IconComponent &&
        <Reanimated.View>
          {IconComponent ? (
            <IconComponent size={24} color={alert.color ?? colors.text} />
          ) : null}
        </Reanimated.View>
      }
      <Reanimated.View
        style={[
          {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }
        ]}
      >
        <Typography variant='title' color='text'>{alert.title}</Typography>
        {alert.message &&
          <Typography variant='body1' color='secondary'>{alert.message}</Typography>
        }
      </Reanimated.View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  
});
