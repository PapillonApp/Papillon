import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Reanimated, { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";


import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";

import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

import { ArrowDown } from "lucide-react-native";

const HomeOnboard: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;

  // animate arrow down
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(30, { duration: 1000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message={"Bienvenue sur Papillon ! On est prêts !"}
        numberOfLines={2}
        width={220}
        noFlex
        style={{
          zIndex: 10,
        }}
      />

      <Reanimated.View
        style={[{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
          gap: 12,
          paddingHorizontal: 40,
          marginTop: -20,
        }, {
          transform: [{ translateY }],
        }]}
      >
        <ArrowDown
          size={24}
          color={colors.text}
          style={{
          }}
        />

        <Text
          style={{
            color: colors.text,
            fontFamily: "medium",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Balaye vers le bas pour commencer à utiliser Papillon.
        </Text>
      </Reanimated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    gap: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 10,
  },

  terms_text: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "medium",
    paddingHorizontal: 20,
  },
});

export default HomeOnboard;
