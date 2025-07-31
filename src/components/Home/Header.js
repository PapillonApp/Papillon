var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { CopyPlus } from "lucide-react-native";
import React, { forwardRef, useEffect, useState, useCallback, useMemo, memo } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useCurrentAccount } from "@/stores/account";
import Reanimated, { Easing, FadeInRight, ZoomIn, ZoomOut } from "react-native-reanimated";
import { get_home_widgets } from "@/addons/addons";
import AddonsWebview from "@/components/Addons/AddonsWebview";
import { NativeText } from "@/components/Global/NativeComponents";
import { defaultTabs } from "@/consts/DefaultTabs";
import { Widgets } from "@/widgets";
import LottieView from "lottie-react-native";
import { PressableScale } from "react-native-pressable-scale";
import Widget from "./Widget";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "../Global/PapillonSpinner";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var Header = (function (_a) {
    var scrolled = _a.scrolled, navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    var _b = useState([]), tabs = _b[0], setTabs = _b[1];
    var _c = useState([]), addons = _c[0], setAddons = _c[1];
    var _d = useState([]), addonsTitle = _d[0], setAddonsTitle = _d[1];
    var _e = useState(false), click = _e[0], setClick = _e[1];
    var isTablet = useScreenDimensions().isTablet;
    useEffect(function () {
        get_home_widgets().then(function (addons) {
            var res = addons.flatMap(function (addon) {
                return addon.placement.map(function (placement) { return ({
                    name: addon.name,
                    icon: addon.icon,
                    url: "".concat(placement.main),
                }); });
            });
            setAddons(res);
        });
    }, []);
    useEffect(function () {
        if (account.personalization.tabs) {
            setTabs(account.personalization.tabs);
        }
    }, [account.personalization]);
    var handlePress = useCallback(function () {
        setClick(true);
        setTimeout(function () {
            navigation.navigate("SettingsTabs");
            setClick(false);
        }, 10);
    }, [navigation]);
    var renderHeaderButton = useCallback(function (tab, index) {
        var defaultTab = defaultTabs.find(function (curr) { return curr.tab === tab.name; });
        if (!defaultTab || tab.enabled || tab.name === "Home")
            return null;
        return (<HeaderButton key={index} index={index} icon={<LottieView loop={false} source={defaultTab.icon} colorFilters={[{ keypath: "*", color: "#fff" }]} style={{ width: 26, height: 26 }}/>} text={defaultTab.label} scrolled={scrolled} onPress={function () { return navigation.navigate(tab.name); }}/>);
    }, [scrolled, navigation]);
    var renderWidgets = useMemo(function () {
        return (<Reanimated.View entering={FadeInRight.easing(Easing.bezierFn(0, 0, 0, 1)).duration(500).delay(250).withInitialValues({
                opacity: 0,
                transform: [{ translateX: 20 }],
            })} style={{ gap: 15, flexDirection: "row", height: 131 }}>
        {Widgets.map(function (widget, index) { return (<Widget key={index} widget={widget} navigation={navigation}/>); })}
        {addons.map(function (addon, index) { return (<Widget key={index} widget={forwardRef(function () { return (<View style={{ flex: 1 }} onLayout={function () {
                        var temp = __spreadArray([], addonsTitle, true);
                        temp[index] = addon.name;
                        setAddonsTitle(temp);
                    }}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
                  <Image source={addon.icon === ""
                        ? require("../../../assets/images/addon_default_logo.png")
                        : { uri: addon.icon }} style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#00000015" }}/>
                  <NativeText variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                    {addonsTitle[index]}
                  </NativeText>
                </View>
                <AddonsWebview addon={addon} url={addon.url} navigation={navigation} setTitle={function (title) {
                        var temp = __spreadArray([], addonsTitle, true);
                        temp[index] = title;
                        setAddonsTitle(temp);
                    }}/>
              </View>); })}/>); })}
      </Reanimated.View>);
    }, [addons, addonsTitle, navigation]);
    return (<View style={styles.container}>
      <Reanimated.View style={[styles.part, styles.header]}/>
      {!isTablet &&
            (tabs.every(function (tab) { return tab.enabled; }) ? (<PressableScale style={{ height: 38, width: "100%", paddingHorizontal: 16 }} onPress={function () { return navigation.navigate("SettingsTabs"); }}>
            <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    backgroundColor: "#ffffff30",
                    width: "100%",
                    borderRadius: 10,
                    borderCurve: "continuous",
                    gap: 12,
                    opacity: 0.5,
                }}>
              <CopyPlus size={20} color="#fff"/>
              <Text style={{ color: "#fff", fontFamily: "medium", fontSize: 15 }}>Ajouter des onglets</Text>
            </View>
          </PressableScale>) : (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.part, styles.buttons]} contentContainerStyle={{ gap: 7, paddingHorizontal: 16, overflow: "visible" }}>
            {tabs.map(renderHeaderButton)}
            <PressableScale onPress={handlePress} style={{ height: 38, justifyContent: "center", alignItems: "center", flexDirection: "row", backgroundColor: "#ffffff00", borderColor: "#ffffff50", borderWidth: 1, borderRadius: 100, borderCurve: "continuous", gap: 12, paddingHorizontal: 12, opacity: 0.5 }}>
              {click ? (<PapillonSpinner size={18} color="white" strokeWidth={2.8} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)}/>) : (<CopyPlus size={24} color="#fff"/>)}
              <Text style={{ color: "#fff", fontFamily: "medium", fontSize: 16 }}>Gérer</Text>
            </PressableScale>
          </ScrollView>))}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.part, styles.widgets]} contentContainerStyle={{ gap: 15, overflow: "visible", paddingHorizontal: 16 }}>
        {!scrolled && renderWidgets}
      </ScrollView>
    </View>);
});
var HeaderButton = React.memo(function (_a) {
    var icon = _a.icon, index = _a.index, text = _a.text, scrolled = _a.scrolled, onPress = _a.onPress;
    var theme = useTheme();
    var colors = theme.colors;
    var newIcon = useMemo(function () { return React.cloneElement(icon, { size: 24, color: "#fff" }); }, [icon]);
    return (!scrolled && (<Reanimated.View entering={FadeInRight.easing(Easing.bezierFn(0, 0, 0, 1)).duration(300).delay(50 * index).withInitialValues({
            opacity: 0,
            transform: [{ translateX: 20 }],
        })} key={text + ":headerBtn"}>
            <TouchableOpacity onPress={onPress} style={[styles.headerButton, { backgroundColor: "#ffffff22", borderColor: "#ffffff50" }]}>
              {newIcon}
              <Text style={[styles.headerButtonText, { color: "#fff" }]}>{text}</Text>
            </TouchableOpacity>
          </Reanimated.View>));
});
var styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        paddingVertical: 16,
        paddingTop: 14,
        gap: 12,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    part: {
        width: "100%",
        paddingHorizontal: 16,
        overflow: "visible",
    },
    header: {
        height: 38,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerSide: {
        justifyContent: "center",
        alignItems: "flex-end",
    },
    buttons: {
        maxHeight: 38,
        paddingHorizontal: 0,
        marginBottom: 2,
    },
    widgets: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 0,
    },
    headerButton: {
        height: "100%",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 12,
        borderRadius: 120,
        borderCurve: "continuous",
        borderWidth: 1,
    },
    headerButtonText: {
        fontSize: 16,
        fontFamily: "medium",
    },
    widget: {
        height: "100%",
        width: 200,
        minWidth: 200,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 17,
        borderCurve: "continuous",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0.5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    widgetContent: {
        width: "100%",
        height: "100%",
        borderRadius: 17,
        padding: 13,
        borderCurve: "continuous",
    },
});
export default memo(Header);
