var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useEffect, useLayoutEffect } from "react";
import { View } from "react-native";
import MissingItem from "@/components/Global/MissingItem";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
var PlaceholderScreen = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    useLayoutEffect(function () {
        navigation.setOptions(__assign({}, TabAnimatedTitle({ route: route, navigation: navigation })));
    }, [navigation, route.params, theme.colors.text]);
    var _b = React.useState(false), isFocused = _b[0], setIsFocused = _b[1];
    useEffect(function () {
        var unsubscribe = navigation.addListener("focus", function () {
            setIsFocused(true);
        });
        return unsubscribe;
    }, [navigation]);
    return (<View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 20,
        }}>
      <MissingItem emoji={"🚧"} title={"Fonctionnalité en construction"} description={"Cette page est en cours de développement, reviens plus tard."}/>
    </View>);
};
export default PlaceholderScreen;
