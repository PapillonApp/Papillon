import React, { useState } from "react";
import { View, Pressable, Platform, StyleSheet } from "react-native";
import { animPapillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { NativeText } from "./NativeComponents";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { BlurView } from "expo-blur";
import { Check } from "lucide-react-native";
import { isExpoGo } from "@/utils/native/expoGoAlert";
var PapillonPicker = function (_a) {
    var children = _a.children, data = _a.data, selected = _a.selected, contentContainerStyle = _a.contentContainerStyle, delay = _a.delay, _b = _a.direction, direction = _b === void 0 ? "left" : _b, animated = _a.animated, onSelectionChange = _a.onSelectionChange;
    var theme = useTheme();
    var _c = useState(0), contentHeight = _c[0], setContentHeight = _c[1];
    var _d = useState(false), opened = _d[0], setOpened = _d[1];
    var handleSelectionChange = function (item) {
        if (onSelectionChange) {
            setTimeout(function () {
                onSelectionChange(item);
            }, delay !== null && delay !== void 0 ? delay : 0);
        }
    };
    if (Platform.OS === "ios" && !isExpoGo()) {
        return (<ContextMenuButton style={[styles.container, contentContainerStyle]} onPressMenuItem={function (event) {
                var actionKey = event.nativeEvent.actionKey;
                var index = parseInt(actionKey.split("-")[1]);
                var item = data[index];
                if (item !== null) {
                    // @ts-ignore
                    if (!item.onPress) {
                        handleSelectionChange(item);
                    }
                    else {
                        // @ts-ignore
                        item.onPress();
                    }
                }
            }} menuConfig={{
                menuTitle: "",
                // @ts-ignore
                menuItems: data.filter(function (item) { return item !== null; }).map(function (item, index) {
                    var _a;
                    return {
                        actionKey: "action-" + index.toString(),
                        actionTitle: typeof item === "string" ? item : item.label,
                        actionSubtitle: typeof item !== "string" ? item.subtitle : undefined,
                        menuState: (typeof item !== "string" && (item.checked || item === selected)) ? "on" : "off",
                        menuAttributes: [typeof item !== "string" && item.destructive ? "destructive" : "normal"],
                        icon: typeof item !== "string" && ((_a = item.ios) === null || _a === void 0 ? void 0 : _a.icon) ? item.ios.icon : {
                            type: typeof item !== "string" ? "IMAGE_SYSTEM" : "IMAGE_SYSTEM",
                            imageValue: {
                                systemName: typeof item !== "string" ? (item.sfSymbol ? item.sfSymbol : "") : "",
                            },
                        }
                    };
                }),
            }}>
        <Pressable onPress={function () { }} style={{ opacity: opened ? 0.3 : 1 }}>
          {children}
        </Pressable>
      </ContextMenuButton>);
    }
    return (<Reanimated.View layout={animated && animPapillon(LinearTransition)} style={[styles.container, contentContainerStyle]}>
      <Pressable onPress={function () { return setOpened(!opened); }}>
        <Reanimated.View layout={animated && animPapillon(LinearTransition)} style={styles.children} onLayout={function (event) {
            var height = event.nativeEvent.layout.height;
            setContentHeight(height);
        }}>
          {children}
        </Reanimated.View>
      </Pressable>

      {opened && (<Reanimated.View layout={animated && animPapillon(LinearTransition)} style={[
                styles.picker,
                direction === "left" ? {
                    left: 0,
                } : {
                    right: 0,
                },
                {
                    backgroundColor: Platform.OS === "ios" ? theme.colors.card + 50 : theme.colors.card,
                    borderColor: theme.colors.text + "55",
                    top: contentHeight + 10,
                }
            ]} entering={PapillonContextEnter} exiting={PapillonContextExit}>
          <BlurView intensity={70} style={{
                flex: 1,
                borderRadius: 12,
                borderCurve: "continuous",
                overflow: "hidden",
            }} tint={theme.dark ? "dark" : "light"}>
            {data.filter(function (item) { return item !== null; }).map(function (item, index) {
                // check if item is a string or a component
                var isNotString = typeof item !== "string";
                var label = isNotString ? item.label : item;
                var icon = isNotString ? (item.icon ? item.icon : null) : null;
                var onPressItem = isNotString ? item.onPress : null;
                var newIcon = icon ? React.cloneElement(icon, {
                    size: 20,
                    strokeWidth: 2.5,
                    color: theme.colors.text,
                }) : null;
                return (<View key={index}>
                  <Pressable key={index} onPress={onPressItem ? function () {
                        setOpened(false);
                        onPressItem();
                    } : function () {
                        setOpened(false);
                        handleSelectionChange(item);
                    }} style={[
                        styles.item
                    ]}>
                    {newIcon && (<View style={{
                            marginRight: 10,
                        }}>
                        {newIcon}
                      </View>)}

                    <NativeText>{label}</NativeText>

                    <View style={{ flex: 1 }}/>

                    {item === selected || (isNotString && item.checked) && (<Check size={20} strokeWidth={2.5} color={theme.colors.primary} style={{ marginRight: 10 }}/>)}
                  </Pressable>

                  {index === data.length - 1 ? null : (<View style={{
                            height: 1,
                            borderBottomColor: theme.colors.text + "25",
                            borderBottomWidth: 0.5,
                            marginLeft: 14,
                        }}/>)}
                </View>);
            })}
          </BlurView>
        </Reanimated.View>)}
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    container: {},
    children: {},
    picker: {
        position: "absolute",
        top: 0,
        borderWidth: 0.5,
        zIndex: 10000000000,
        minWidth: 200,
        borderRadius: 12,
        borderCurve: "continuous",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 2,
    },
    item: {
        paddingVertical: 12,
        paddingRight: 22,
        marginLeft: 16,
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
});
export default PapillonPicker;
