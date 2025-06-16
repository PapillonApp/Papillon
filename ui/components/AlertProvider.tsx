import { BlurView } from 'expo-blur';
import { X } from "lucide-react-native";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import Button, { Color } from './Button';
import Typography from "./Typography";

type AlertButton = {
  label: string;
  onPress: () => void;
  principal?: boolean;
  color?: Color;
};

type Alert = {
  title: string;
  message: string;
  expandedDescription: string;
  expandedIllustration?: React.ReactNode;
  buttons: AlertButton[];
};

type AlertContextType = {
  showAlert: (alert: Alert) => void;
  hideAlert: () => void;
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
  const [alert, setAlert] = useState<Alert | null>(null);
  const [visible, setVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const boxBorderRadius = useSharedValue(16);
  const boxBottomPosition = useSharedValue(95);
  const boxHorizontalPadding = useSharedValue(18);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const blur = useSharedValue(0);

  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const animatedBoxStyle = useAnimatedStyle(() => ({
    bottom: boxBottomPosition.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedProps = useAnimatedProps(() => ({
    intensity: interpolate(blur.value, [0, 1], [0, 100], Extrapolate.CLAMP),
  }));

  const showAlert = (alertData: Alert) => {
    setAlert(alertData);
    setVisible(true);

    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const hideAlert = () => {
    scale.value = withTiming(1, { duration: 100 });
    blur.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
    boxBorderRadius.value = withTiming(16, { duration: 200 });
    boxHorizontalPadding.value = withTiming(18, { duration: 200 });
    boxBottomPosition.value = withTiming(95, { duration: 200 });

    setTimeout(() => {
      setVisible(false);
      setIsExpanded(false);
      setAlert(null);
    }, 200);
  };

  const handlePressIn = () => {
    if (isExpanded) {return;}
    scale.value = withSpring(0.98, {
      mass: 1,
      damping: 20,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    if (isExpanded) {return;}
    scale.value = withSpring(1, {
      mass: 1,
      damping: 20,
      stiffness: 300,
    });
    blur.value = withTiming(0.25, { duration: 200 });
    boxBorderRadius.value = withTiming(37, { duration: 200 });
    boxHorizontalPadding.value = withTiming(10, { duration: 200 });
    setIsExpanded(true);
    setTimeout(() => {
      boxBottomPosition.value = withTiming(75, { duration: 300 });
    }, 75);
  };

  useEffect(() => {
    if (!visible) {
      scale.value = 0.8;
      blur.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideAlert}
      >
        <AnimatedBlurView
          style={styles.modalContainer}
          animatedProps={animatedProps}
        >
          <Pressable style={styles.modalOverlay} onPress={hideAlert} />
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.alertContainer, animatedBoxStyle]}
          >
            <Animated.View
              style={[
                styles.box,
                animatedStyle,
                {
                  borderRadius: boxBorderRadius,
                  paddingHorizontal: boxHorizontalPadding,
                  backgroundColor: isExpanded ? "#FFFFFF" : "#FFFFFF95"
                },
              ]}
            >
              {!isExpanded ? (
                <>
                  <View style={styles.iconContainer}>
                    <X
                      width={20}
                      height={20}
                      color="white"
                      strokeWidth={3}
                      absoluteStrokeWidth
                    />
                  </View>
                  <View>
                    <Typography variant="title">{alert?.title}</Typography>
                    <Typography variant="body2" color="secondary">
                      {alert?.message}
                    </Typography>
                  </View>
                </>
              ) : (
                <View style={styles.expandedContainer}>
                  {alert?.expandedIllustration && (
                    <View style={styles.illustrationWrapper}>
                      {alert.expandedIllustration}
                    </View>
                  )}
                  <View style={styles.expandedContent}>
                    <Typography variant="h5">{alert?.title}</Typography>
                    <Typography variant="body2" color="secondary" style={{ width: "100%" }}
                    >
                      {alert?.expandedDescription}
                    </Typography>
                  </View>
                  <View style={styles.buttonGroup}>
                    {alert?.buttons.map((button, idx) => {
                      const isLast = idx === alert.buttons.length - 1;
                      return (
                        <Button
                          key={idx}
                          title={button.label}
                          size="medium"
                          color={button.color ? button.color : "primary"}
                          variant={button.principal ? "primary" : "light"}
                          style={{
                            borderRadius: isLast ? 0 : 10,
                            ...(isLast && {
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: 27,
                              borderBottomRightRadius: 27,
                            }),
                          }}
                          onPress={button.onPress}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
            </Animated.View>
          </AnimatedPressable>
        </AnimatedBlurView>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: "relative",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  box: {
    width: "90%",
    backgroundColor: "#FFFFFF95",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.26)",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D60046",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 15,
  },
  illustrationWrapper: {
    width: "100%",
    height: 175,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
  },
  expandedContent: {
    flexDirection: "column",
    paddingHorizontal: 13,
  },
  buttonGroup: {
    width: "100%",
    gap: 10,
  },
});
