import { useTheme } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect } from "react";
import { View, Text, StatusBar, TouchableOpacity, Platform } from "react-native";

import { defaultTabs } from "@/consts/DefaultTabs";
import LottieView from "lottie-react-native";
import { X } from "lucide-react-native";
import MissingItem from "@/components/Global/MissingItem";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import {Screen} from "@/router/helpers/types";

const PlaceholderScreen: Screen<"Messages" | "Menu"> = ({ route, navigation }) => {
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsFocused(true);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
      }}
    >
      <MissingItem
        emoji={"🚧"}
        title={"Fonctionnalité en construction"}
        description={"Cette page est en cours de développement, revenez plus tard."}
      />
    </View>
  );
};

export default PlaceholderScreen;
