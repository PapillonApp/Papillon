import React, { memo, useCallback } from "react";
import { View, Text } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
var RedirectButton = function (_a) {
    var navigation = _a.navigation, redirect = _a.redirect;
    var theme = useTheme();
    var colors = theme.colors;
    var handlePress = useCallback(function () {
        // @ts-expect-error
        navigation === null || navigation === void 0 ? void 0 : navigation.navigate(redirect);
    }, [navigation, redirect]);
    return (<TouchableOpacity onPress={handlePress}>
      <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.text + "20",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 100,
            marginVertical: -5,
            marginTop: -7,
            gap: 5,
            opacity: 0.6,
        }}>
        <Text style={{ color: colors.text, fontSize: 15, fontFamily: "semibold" }}>
          Voir plus
        </Text>
        <ArrowUpRight strokeWidth={2.5} size={20} color={colors.text}/>
      </View>
    </TouchableOpacity>);
};
export default memo(RedirectButton);
