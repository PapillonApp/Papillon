import React from "react";
import { Platform, View } from "react-native";
import { TabAnimatedTitleLeft, TabAnimatedTitleRight } from "./TabAnimatedTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { PapillonModernHeader } from "./PapillonModernHeader";
var PapillonHeader = function (_a) {
    var _b, _c, _d, _e, _f;
    var children = _a.children, route = _a.route, navigation = _a.navigation, title = _a.title;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var topPadding = (Platform.OS === "ios" && ((_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav)) ? 0 : insets.top;
    var largeHeader = ((_c = route.params) === null || _c === void 0 ? void 0 : _c.outsideNav) || Platform.OS !== "ios";
    return (<>
      <PapillonModernHeader height={((_d = route.params) === null || _d === void 0 ? void 0 : _d.outsideNav) ? 96 : 56} outsideNav={(_e = route.params) === null || _e === void 0 ? void 0 : _e.outsideNav}>
        <View style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
          {((_f = route.params) === null || _f === void 0 ? void 0 : _f.outsideNav) && Platform.OS !== "ios" && (<TouchableOpacity style={{
                paddingRight: 16,
            }} onPress={function () { return navigation.goBack(); }}>
              <ArrowLeft color={theme.colors.text} size={24}/>
            </TouchableOpacity>)}

          <TabAnimatedTitleLeft route={route} navigation={navigation} style={{ paddingHorizontal: 0 }} title={title}/>

          <View style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
        }}>
            {children}

            {Platform.OS === "ios" && (<TabAnimatedTitleRight route={route} navigation={navigation}/>)}
          </View>
        </View>
      </PapillonModernHeader>
    </>);
};
export var PapillonHeaderInsetHeight = function (_a) {
    var _b;
    var route = _a.route;
    return (<View style={{ height: ((_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav) ? 64 : 86 }}/>);
};
export default PapillonHeader;
