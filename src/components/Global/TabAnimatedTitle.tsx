import type React from "react";
import { View, Text, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import LottieView from "lottie-react-native";
import { X } from "lucide-react-native";
import { defaultTabs } from "@/consts/DefaultTabs";
import { type RouteProp, useTheme } from "@react-navigation/native";
import type { RouteParameters } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface TabAnimatedTitleProps {
  route: RouteProp<RouteParameters, keyof RouteParameters>;
  navigation?: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>;
  style?: StyleProp<ViewStyle>,
  title?: string
}

const TabAnimatedTitle = ({ route, navigation, title }: TabAnimatedTitleProps) => {
  return {
    headerTitle: () => <View />,
    headerLeft: () => (
      <TabAnimatedTitleLeft
        route={route}
        navigation={navigation}
        title={title}
      />
    ),
    headerRight: () => (
      <TabAnimatedTitleRight
        route={route}
        navigation={navigation}
      />
    ),
    headerShadowVisible: false,
  };
};

const TabAnimatedTitleLeft = ({ route, style, title }: TabAnimatedTitleProps) => {
  const theme = useTheme();
  const icon = defaultTabs.find((curr) => curr.tab === route.name)?.icon;

  return (
    <View style={[styles.headerLeft, !route.params?.outsideNav && { paddingHorizontal: 16 }, style]}>
      {icon &&
        <LottieView
          source={icon}
          autoPlay
          loop={false}
          style={styles.lottieView}
          colorFilters={[{ keypath: "*", color: theme.colors.text }]}
        />
      }

      <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
        {defaultTabs.find((curr) => curr.tab === route.name)?.label ?? title}
      </Text>
    </View>
  );
};

const TabAnimatedTitleRight = ({ route, navigation }: TabAnimatedTitleProps) => {
  const theme = useTheme();

  return (
    route.params?.outsideNav && (
      <TouchableOpacity
        style={[styles.headerRightButton, { backgroundColor: theme.colors.text + "30" }]}
        onPress={() => navigation?.goBack()}
      >
        <X
          size={20}
          strokeWidth={3}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  lottieView: {
    width: 26,
    height: 26,
  },
  headerTitle: {
    fontFamily: "semibold",
    fontSize: 17.5,
  },
  headerRightButton: {
    padding: 6,
    borderRadius: 18,
    opacity: 0.6,
    marginLeft: 16,
  },
});

export default TabAnimatedTitle;
export { TabAnimatedTitleLeft, TabAnimatedTitleRight };
