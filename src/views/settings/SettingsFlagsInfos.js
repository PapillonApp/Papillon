import React, { useLayoutEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeText } from "@/components/Global/NativeComponents";
var SettingsFlagsInfos = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = route.params, title = _b.title, value = _b.value;
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    useLayoutEffect(function () {
        navigation.setOptions({
            headerTitle: title,
        });
    }, [navigation, title]);
    var isBase64Image = function (str) {
        return typeof str === "string" && str.startsWith("data:image/jpeg");
    };
    var renderValue = function (val) {
        if (isBase64Image(val)) {
            return "[Image Base64]";
        }
        else if (typeof val === "object" && val !== null) {
            return JSON.stringify(val, null, 2);
        }
        else {
            return String(val);
        }
    };
    return (<ScrollView contentContainerStyle={[
            styles.container,
            {
                paddingBottom: insets.bottom,
                backgroundColor: colors.background
            }
        ]}>
      <View style={styles.content}>
        <NativeText style={[styles.value, { color: colors.text }]}>{renderValue(value)}</NativeText>
      </View>
    </ScrollView>);
};
var styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: "Menlo",
    },
});
export default SettingsFlagsInfos;
