import React from "react";
import { StyleSheet, Text, View, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { PressableScale } from "react-native-pressable-scale";
var Item = function (_a) {
    var title = _a.title, icon = _a.icon, onPress = _a.onPress, _b = _a.enable, enable = _b === void 0 ? true : _b;
    var colors = useTheme().colors;
    return (<PressableScale onPress={onPress} style={[
            styles.pressableScale,
            { borderColor: colors.border, opacity: enable ? 1 : 0.5 },
        ]} disabled={!enable}>
      <View style={styles.item}>
        {icon}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
    </PressableScale>);
};
var HorizontalList = function (_a) {
    var children = _a.children, style = _a.style;
    return (<View style={style}>
      <View style={styles.horizontalListContent}>{children}</View>
    </View>);
};
var styles = StyleSheet.create({
    item: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        padding: 15,
        gap: 10,
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontFamily: "semibold",
    },
    pressableScale: {
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    horizontalListContent: {
        flexDirection: "row",
        gap: 10,
    },
});
export { Item, HorizontalList };
