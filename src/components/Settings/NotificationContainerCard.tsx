import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  DimensionValue,
  Switch,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import LottieView from "lottie-react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { BellOff, Settings, X } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteParameters } from "@/router/helpers/types";
import { alertExpoGo } from "@/utils/native/expoGoAlert";

type NotificationContainerCardProps = {
  theme: any;
  isEnable: boolean | null | undefined;
  setEnabled: (value: boolean) => void;
  navigation: NativeStackNavigationProp<
    RouteParameters,
    "SettingsNotifications",
    undefined
  >;
};

const openNotificationSettings = async () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    const notifee = (await import("@notifee/react-native")).default;
    notifee.openNotificationSettings();
  }
};

const NotificationContainerCard = ({
  theme,
  isEnable,
  setEnabled,
  navigation
}: NotificationContainerCardProps) => {
  const { colors } = theme;

  const opacity = useSharedValue(0);
  const borderRadius = useSharedValue(20);
  const width = useSharedValue("90%");
  const marginBottom = useSharedValue(0);
  const invertedOpacity = useSharedValue(1);
  const animationref = React.useRef<LottieView>(null);

  useEffect(() => {
    const timingConfig = { duration: 250, easing: Easing.bezier(0.3, 0.3, 0, 1) };
    opacity.value = withTiming(isEnable ? 1 : 0, timingConfig);
    invertedOpacity.value = withTiming(isEnable ? 0 : 1, { duration: 150 });
    borderRadius.value = withTiming(isEnable ? 20 : 13, timingConfig);
    width.value = withTiming(isEnable ? "90%" : "80%", { duration: 300 });
    marginBottom.value = withTiming(isEnable ? 0 : -20, timingConfig);

    if (!isEnable) {
      animationref.current?.play();
    } else {
      animationref.current?.reset();
    }
  }, [isEnable]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderRadius: borderRadius.value,
    width: width.value as DimensionValue | undefined,
    marginBottom: marginBottom.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const invertedTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: invertedOpacity.value,
  }));

  const { showAlert } = useAlert();

  return (
    <NativeList>
      <View style={[styles.notificationView, {backgroundColor: colors.primary + "22"}]}>
        <View style={styles.innerNotificationView}>
          <Reanimated.View style={[styles.animatedContainer, containerAnimatedStyle]}>
            <Reanimated.View style={[styles.bellOffContainer, invertedTextAnimatedStyle]}>
              <LottieView
                source={require("@/../assets/lottie/header_notification_belloff.json")}
                ref={animationref}
                loop={false}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                onAnimationFinish={
                  isEnable
                    ? () => {
                      animationref.current?.pause();
                    }
                    : undefined
                }
              />
            </Reanimated.View>
            <View style={styles.row}>
              <Reanimated.Image
                source={require("../../../assets/images/icon_app_papillon.png")}
                style={[styles.icon, textAnimatedStyle]}
              />
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Reanimated.Text style={[styles.title, textAnimatedStyle]}>Papillon</Reanimated.Text>
                  <Reanimated.Text style={[styles.time, textAnimatedStyle]}>il y a 22 min</Reanimated.Text>
                </View>
                <Reanimated.Text
                  numberOfLines={2}
                  style={[styles.message, textAnimatedStyle]}
                >
                  Géographie (16:00-17:00) : Changement de salle ➡️ B106
                </Reanimated.Text>
              </View>
            </View>
          </Reanimated.View>
          <View style={[styles.overlay, styles.overlayPrimary]} />
          <View style={[styles.overlay, styles.overlaySecondary]} />
        </View>
      </View>
      <NativeItem
        trailing={
          isEnable !== null && isEnable !== undefined ? (
            <Switch
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              style={{
                marginRight: 10,
              }}
              value={isEnable}
              onValueChange={setEnabled}
            />
          ) : (
            <Pressable
              onPress={() => {
                if (isEnable === undefined) {
                  alertExpoGo(showAlert);
                } else {
                  showAlert({
                    title: "Notifications désactivées",
                    message:
                      "Il faut activer les notifications dans les paramètres du téléphone pour pouvoir les activer dans Papillon.",
                    icon: <BellOff />,
                    actions: [
                      {
                        title: "Annuler",
                        icon: <X size={24} color={colors.text} />,
                      },
                      {
                        title: "Paramètres système",
                        onPress: () => {
                          openNotificationSettings();
                          setTimeout(() => {
                            navigation.reset({
                              index: 0,
                              routes: [{ name: "SettingsNotifications" }],
                            });
                          }, 1000);
                        },
                        primary: true,
                        backgroundColor: "#888",
                        icon: <Settings size={24} color={colors.text} />,
                      },
                    ],
                  });
                }
              }}
            >
              <Switch
                trackColor={{
                  false: colors.border,
                }}
                style={{
                  marginRight: 10,
                }}
                value={false}
                disabled
              />
            </Pressable>
          )
        }
      >
        <NativeText variant="title">Activer les notifications</NativeText>
        <NativeText variant="subtitle">
          Reçois des notifications pour ne rien rater de ta vie scolaire.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

// Styles
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#E2FBFC",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "column",
    overflow: "hidden",
  },
  notificationView: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  innerNotificationView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  animatedContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#00000030",
    marginTop: 30,
    marginHorizontal: 20,
    padding: 9,
    zIndex: 10,
    overflow: "hidden",
  },
  bellOffContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 35,
    height: 35,
    borderRadius: 9,
  },
  textContainer: {
    marginLeft: 7,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: -1,
  },
  title: {
    color: "#222222",
    fontSize: 16,
    fontFamily: "semibold",
  },
  time: {
    color: "#9F9F9F",
    opacity: 0.5,
    textAlign: "right",
    fontSize: 13,
    marginRight: 10,
    fontFamily: "medium",
  },
  message: {
    color: "#3F3F3F",
    fontSize: 14.5,
    maxWidth: "85%",
    minWidth: "85%",
    lineHeight: 20,
    letterSpacing: -0.1,
    fontFamily: "medium",
  },
  overlay: {
    borderWidth: 1,
    borderColor: "#00000030",
    borderRadius: 20,
    height: 25,
    padding: 9,
    marginHorizontal: 20,
  },
  overlayPrimary: {
    backgroundColor: "#EEF5F5",
    width: "80%",
    marginTop: -15,
    zIndex: 5,
  },
  overlaySecondary: {
    backgroundColor: "#F3F3F370",
    width: "70%",
    marginTop: -15,
    marginBottom: 30,
    zIndex: -1,
  },
  footer: {
    padding: 15,
    flexDirection: "row",
  },
  footerTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
    gap: 3,
  },
  footerTitle: {
    fontSize: 18,
    fontFamily: "semibold",
  },
  footerDescription: {
    fontSize: 14,
    fontFamily: "medium",
    width: "95%",
    overflow: "hidden",
  },
});

export default NotificationContainerCard;
