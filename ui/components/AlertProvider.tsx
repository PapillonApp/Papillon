import { BlurView } from 'expo-blur';
import { X } from "lucide-react-native";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Image,Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Button from './Button';
import Typography from "./Typography";

type AlertButton = {
  label: string;
  onPress: () => void;
  principal?: boolean;
};

type Alert = {
  title: string;
  message: string;
  expandedView: ReactNode;
  buttons: AlertButton[];
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
  const [alert, setAlert] = useState<Alert | null>(null);
  const [visible, setVisible] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const blur = useSharedValue(0);

  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: interpolate(
        blur.value,
        [0, 1],
        [0, 100],
        Extrapolate.CLAMP
      ),
    };
  });

  const showAlert = (alertData: Alert) => {
    setAlert(alertData);
    setVisible(true);

    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const hideAlert = () => {
    blur.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.8, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });

    setTimeout(() => {
      setVisible(false);
      setIsExpanded(false);
      setAlert(null);
    }, 200);
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    blur.value = withTiming(0.25, { duration: 200 });
    scale.value = withTiming(1, { duration: 100 });
    setIsExpanded(true);
  };

  useEffect(() => {
    if (!visible) {
      scale.value = 0.8;
      blur.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
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
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.alertContainer}
          >
            <Animated.View style={[styles.box, animatedStyle]}>
                {!isExpanded && (
                <>
                  <View style={styles.iconContainer}>
                    <X
                      width={20}
                      height={20}
                      color={"white"}
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
              )}
              {isExpanded && (
                <View style={{display:"flex", flexDirection:"column", width: "100%", gap: 20}}>
                    <View>
                        <Image
                            source={{ uri: "https://www.programme-tv.net/imgre/fit/http.3A.2F.2Fprd2-bone-image.2Es3-website-eu-west-1.2Eamazonaws.2Ecom.2FTEL.2Enews.2F2018.2F01.2F11.2Ff5ffbe7c-62a4-44d0-87c0-e8ff3b60bee6.2Ejpeg/900x506/quality/70/arretez-tout-shrek-revient-au-cinema-avec-un-cinquieme-film.jpg" }}
                            style={{ width: "100%", height: 175, borderRadius: 8 }}
                        />
                    </View>
                    <View>
                        <Typography variant="h4">{alert?.title}</Typography>
                        <Typography variant="body1" color='secondary'>Impossible de se connecter à votre compte PRONOTE. Vérifiez que l&apos;établissement est correctement accessible</Typography>
                    </View>
                    <View style={{ width: "100%", display: "flex", gap: 10}}>
                    {alert?.buttons.map((button, idx) => (
                        <Button key={idx} title={button.label} size="medium" variant={button.principal ? "primary" : "light"}/>
                    ))}
                    </View>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </AnimatedBlurView>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    position: 'absolute',
    bottom: 95,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  box: {
    width: "90%",
    backgroundColor: "#FFFFFF95",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.26)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
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
});
