import React from "react";
import { Image, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
var MaskStarsColored = function (_a) {
    var color = _a.color;
    var theme = useTheme();
    return (<Image source={require("../../../assets/images/mask_stars_login.png")} tintColor={theme.dark ? color + "40" : color + "70"} style={styles.element} resizeMode="cover"/>);
};
var styles = StyleSheet.create({
    element: {
        width: "100%",
        height: 250,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    }
});
export default MaskStarsColored;
