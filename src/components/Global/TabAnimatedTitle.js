import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { X } from "lucide-react-native";
import { defaultTabs } from "@/consts/DefaultTabs";
import { useTheme } from "@react-navigation/native";
var TabAnimatedTitle = function (_a) {
    var route = _a.route, navigation = _a.navigation, title = _a.title;
    return {
        headerTitle: function () { return <View />; },
        headerLeft: function () { return (<TabAnimatedTitleLeft route={route} navigation={navigation} title={title}/>); },
        headerRight: function () { return (<TabAnimatedTitleRight route={route} navigation={navigation}/>); },
        headerShadowVisible: false,
    };
};
var TabAnimatedTitleLeft = function (_a) {
    var _b, _c, _d, _e;
    var route = _a.route, style = _a.style, title = _a.title;
    var theme = useTheme();
    var icon = (_b = defaultTabs.find(function (curr) { return curr.tab === route.name; })) === null || _b === void 0 ? void 0 : _b.icon;
    return (<View style={[styles.headerLeft, !((_c = route.params) === null || _c === void 0 ? void 0 : _c.outsideNav) && { paddingHorizontal: 16 }, style]}>
      {icon &&
            <LottieView source={icon} autoPlay loop={false} style={styles.lottieView} colorFilters={[{ keypath: "*", color: theme.colors.text }]}/>}

      <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
        {(_e = (_d = defaultTabs.find(function (curr) { return curr.tab === route.name; })) === null || _d === void 0 ? void 0 : _d.label) !== null && _e !== void 0 ? _e : title}
      </Text>
    </View>);
};
var TabAnimatedTitleRight = function (_a) {
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    return (((_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav) && (<TouchableOpacity style={[styles.headerRightButton, { backgroundColor: theme.colors.text + "30" }]} onPress={function () { return navigation === null || navigation === void 0 ? void 0 : navigation.goBack(); }}>
        <X size={20} strokeWidth={3} color={theme.colors.text}/>
      </TouchableOpacity>));
};
var styles = StyleSheet.create({
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    lottieView: {
        width: 26,
        height: 26,
    },
    headerTitle: {
        fontFamily: "semibold",
        fontSize: 17.5,
    },
    headerRightButton: {
        padding: 6,
        borderRadius: 18,
        opacity: 0.6,
        marginLeft: 16,
    },
});
export default TabAnimatedTitle;
export { TabAnimatedTitleLeft, TabAnimatedTitleRight };
