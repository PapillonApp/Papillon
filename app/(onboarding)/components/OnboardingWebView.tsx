import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { Dynamic } from "@/ui/components/Dynamic";
import Typography from "@/ui/new/Typography";
import { useHeaderHeight } from "@react-navigation/elements";
import AndroidBackButton from "@/utils/theme/AndroidBackButton";

export default function OnboardingWebView({ webViewRef, ...props }: React.ComponentProps<typeof WebView>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [currentUrl, setCurrentUrl] = React.useState<string>(props.source.uri || "");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = React.useState<number>(0);

  const extractDomain = (url: string) => {
    try {
      if (url.trim().length === 0) { return "about:blank"; }

      const { hostname } = new URL(url);
      return hostname.replace("www.", "");
    } catch (e) {
      return url;
    }
  }

  const finalHeaderHeight = Platform.select({
    android: insets.top,
    default: 0
  });

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        flexDirection: "column",
      }}
    >
      {Platform.OS === 'android' && (<View style={{
        position: "absolute",
        left: 16,
        top: finalHeaderHeight + 11,
        zIndex: 200000,
      }}>
        <AndroidBackButton />
      </View>)}

      <View
        style={{
          width: "100%",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
          zIndex: 1,
          paddingVertical: 16,
          height: 64 + finalHeaderHeight,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
          paddingTop: finalHeaderHeight + 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            maxWidth: "80%",
          }}
        >
          {currentUrl.startsWith("https://") && (
            <Dynamic animated>
              <Papicons size={20} name="lock" color="#37BB12" />
            </Dynamic>
          )}
          <Dynamic animated key={extractDomain(currentUrl)}>
            <Typography variant="title" numberOfLines={1}>
              {extractDomain(currentUrl)}
            </Typography>
          </Dynamic>
        </View>

        {loading && (
          <View
            style={{
              height: 3,
              width: `100%`,
              zIndex: 10,
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          >
            <View style={{
              height: "100%",
              width: `${(loadingProgress + 0.05) * 100}%`,
              backgroundColor: colors.primary,
              zIndex: 1,
              borderRadius: 200,
            }} />
          </View>
        )}
      </View>

      <WebView
        style={{
          flex: 1,
          width: "100%",
          height: "100%"
        }}
        {...props}
        onNavigationStateChange={(navState) => {
          setCurrentUrl(navState.url);
          if (props.onNavigationStateChange) {
            props.onNavigationStateChange(navState);
          }
        }}
        onLoadStart={(args) => {
          setLoading(true);
          if (props.onLoadStart) {
            props.onLoadStart(args);
          }
        }}
        onLoadEnd={(args) => {
          setLoading(false);
          if (props.onLoadEnd) {
            props.onLoadEnd(args);
          }
        }}
        onLoadProgress={(args) => {
          setLoadingProgress(args.nativeEvent.progress);
          if (props.onLoadProgress) {
            props.onLoadProgress(args);
          }
        }}
        ref={webViewRef}
      />
    </View>
  )
}