import React from "react";
import { Image, StyleSheet } from "react-native";

import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

const MaskStars: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Image
      source={require("../../../assets/images/mask_stars_login.png")}
      tintColor={theme.dark ? colors.text + "11" : colors.text + "22"}
      style={styles.element}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  element: {
    width: "100%",
    height: 250,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  }
});

export default MaskStars;