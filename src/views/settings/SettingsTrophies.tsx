import React from "react";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const SettingsTrophies: Screen<"SettingsTrophies"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <ScrollView>
      <View
        style={{
          backgroundColor: "#E2FBFC",
          borderRadius: 15,
          marginTop: insets.top - 45,
          marginHorizontal: 20,
          borderWidth: 1,
          height: 200,
          borderColor: colors.border,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >

      </View>

    </ScrollView>
  );
};

export default SettingsTrophies;
