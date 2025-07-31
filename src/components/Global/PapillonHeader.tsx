import React from "react";
import { Platform, View } from "react-native";
import { TabAnimatedTitleLeft, TabAnimatedTitleRight } from "./TabAnimatedTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ArrowLeft } from "lucide-react-native";
import { type RouteProp, useTheme } from "@react-navigation/native";
import type { RouteParameters } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PapillonModernHeader } from "./PapillonModernHeader";

interface PapillonHeaderProps {
  children?: React.ReactNode
  route: RouteProp<RouteParameters, keyof RouteParameters>
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>,
  title?: string
}

interface PapillonHeaderInsetHeightProps {
  route: RouteProp<RouteParameters, keyof RouteParameters>
}

const PapillonHeader: React.FC<PapillonHeaderProps> = ({
  children,
  route,
  navigation,
  title
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const topPadding = (Platform.OS === "ios" && route.params?.outsideNav) ? 0 : insets.top;
  const largeHeader = route.params?.outsideNav || Platform.OS !== "ios";

  return (
    <>
      <PapillonModernHeader height={route.params?.outsideNav ? 96 : 56} outsideNav={route.params?.outsideNav}>
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {route.params?.outsideNav && Platform.OS !== "ios" && (
            <TouchableOpacity
              style={{
                paddingRight: 16,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color={theme.colors.text} size={24} />
            </TouchableOpacity>
          )}

          <TabAnimatedTitleLeft
            route={route}
            navigation={navigation}
            style={{ paddingHorizontal: 0 }}
            title={title}
          />

          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {children}

            {Platform.OS === "ios" && (
              <TabAnimatedTitleRight
                route={route}
                navigation={navigation}
              />
            )}
          </View>
        </View>
      </PapillonModernHeader>
    </>
  );
};


export const PapillonHeaderInsetHeight: React.FC<PapillonHeaderInsetHeightProps> = ({
  route,
}) => {
  return (
    <View style={{ height: route.params?.outsideNav ? 64 : 86 }} />
  );
};

export default PapillonHeader;
