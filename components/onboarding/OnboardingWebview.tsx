import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import React, { useEffect } from "react";
import ViewContainer from "@/ui/components/ViewContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { WebView, WebViewProps } from "react-native-webview";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { t } from "i18next";

const OnboardingWebview = ({ title, color, step, totalSteps, webviewProps, webViewRef }: {
  title: string
  color: string
  step: number
  totalSteps: number
  webviewProps: WebViewProps
  webViewRef?: React.RefObject<WebView<{}> | null>
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [totallyLoaded, setTotallyLoaded] = React.useState(false);

  const titleOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(150 + insets.top);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", onKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", onKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onKeyboardShow = () => {
    titleOpacity.value = withTiming(0, { duration: 100 });
    headerHeight.value = withTiming(60 + insets.top, { stiffness: 500, damping: 50 });
  };

  const onKeyboardHide = () => {
    titleOpacity.value = withSpring(1, { stiffness: 200, damping: 20 });
    headerHeight.value = withSpring(150 + insets.top, { stiffness: 500, damping: 50 });
  };

  return (
    <ViewContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="height"
        keyboardVerticalOffset={-insets.top + 20}
      >
        <Stack flex
          direction="horizontal"
          height={40}
          style={{ position: "absolute", left: 75, top: insets.top + 7, zIndex: 2 }}
          hAlign={"center"}
        >
          <Typography
            variant="h5"
            style={{ color: "white", lineHeight: 22, fontSize: 18 }}
          >
            {"Étape " + step}
          </Typography>
          <Typography
            variant="h5"
            style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
          >
            {"sur " + totalSteps}
          </Typography>
        </Stack>
        <Animated.View
          style={{
            padding: 32,
            backgroundColor: color,
            gap: 20,
            alignItems: "center",
            justifyContent: "flex-end",
            borderBottomLeftRadius: 42,
            borderBottomRightRadius: 42,
            paddingBottom: 25,
            borderCurve: "continuous",
            height: headerHeight,
            paddingTop: insets.top,
          }}
        >
          <Animated.View style={{ opacity: titleOpacity }}>
            <Typography
              variant="h3"
              style={{ color: "#FFFFFF", lineHeight: 28, fontSize: 28 }}
            >
              {title}
            </Typography>
          </Animated.View>
        </Animated.View>
        <View style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 20 }}>
          <View
            style={{
              width: "100%",
              height: "100%",
              borderWidth: 2,
              borderColor: colors.border,
              backgroundColor: colors.text + "10",
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                opacity: totallyLoaded ? 0 : 1,
              }}
            >
              <ActivityIndicator size={"large"} />
              <Typography variant={"h3"} align={"center"} color={colors.text + "90"} style={{ marginTop: 10 }}>{t("Webview_Wait")}</Typography>
              <Typography variant={"caption"} align={"center"} color={colors.text + "50"}>{t("Onboarding_Load_Webview_Description")}</Typography>
            </View>
            <WebView
              ref={webViewRef}
              {...webviewProps}
              style={{
                flex: 1,
                opacity: totallyLoaded ? 1 : 0,
              }}
              onLoadEnd={(e) => {
                webviewProps.onLoadEnd?.(e);
                console.log(e.nativeEvent.url)
                if (e.nativeEvent.url.includes("pronote")) {
                  if (e.nativeEvent.url !== webviewProps.source?.uri) {
                    setTotallyLoaded(true);
                  }
                } else if (e.nativeEvent.url.includes("https://")) {
                  setTotallyLoaded(true);
                }
              }}
            />
          </View>
        </View>
        <OnboardingBackButton />
      </KeyboardAvoidingView>
    </ViewContainer>
  );
};

export default OnboardingWebview;