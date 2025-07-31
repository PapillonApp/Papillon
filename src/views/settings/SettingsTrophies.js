import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
var SettingsTrophies = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var _b = React.useState(false), enabled = _b[0], setEnabled = _b[1];
    return (<ScrollView>
      <View style={{
            backgroundColor: "#E2FBFC",
            borderRadius: 15,
            marginTop: insets.top - 45,
            marginHorizontal: 20,
            borderWidth: 1,
            height: 200,
            borderColor: colors.border,
            flexDirection: "column",
            overflow: "hidden",
        }}>

      </View>

    </ScrollView>);
};
// Styles
var styles = StyleSheet.create({
    title: {
        color: "#222222",
        fontSize: 15,
    },
    time: {
        color: "#3F3F3F",
        opacity: 0.5,
        textAlign: "right",
        fontFamily: "sfmedium",
        fontSize: 13,
        marginRight: 10,
    },
    message: {
        color: "#3F3F3F",
        fontFamily: "sfmedium",
        fontSize: 14,
        maxWidth: "85%",
        minWidth: "85%",
        lineHeight: 15,
        letterSpacing: -0.4,
    },
    overlay: {
        backgroundColor: "#EEF5F5",
        borderWidth: 1,
        borderColor: "#00000030",
        borderRadius: 20,
        height: 25,
        padding: 9,
        marginHorizontal: 20,
    },
});
export default SettingsTrophies;
