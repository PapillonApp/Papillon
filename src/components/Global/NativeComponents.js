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
import React, { isValidElement, Children, useMemo, memo } from "react";
import { View, Text, Pressable, StyleSheet, Platform, TouchableNativeFeedback } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronRight } from "lucide-react-native";
import { animPapillon } from "@/utils/ui/animations";
import { LinearGradient } from "expo-linear-gradient";
// Predefine styles to avoid recreating them
var listStyles = StyleSheet.create({
    list: {
        borderRadius: 16,
        borderCurve: "continuous",
        flexDirection: "column",
        overflow: "visible",
        marginTop: 24,
    },
    item: {}
});
var listHeaderStyles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginTop: 24,
        marginBottom: -10,
        paddingHorizontal: 6,
    },
    icon: {
        opacity: 0.4,
    },
    label: {
        opacity: 0.4,
        fontSize: 13,
        fontFamily: "semibold",
        letterSpacing: 1,
        textTransform: "uppercase",
        flex: 1,
    }
});
var itemStyles = StyleSheet.create({
    item: {
        flexDirection: "row",
        alignItems: "center",
    },
    part: {
        padding: 0,
    },
    leading: {
        padding: 9,
        marginRight: 5,
        marginLeft: 6,
    },
    trailing: {
        padding: 9
    },
    content: {
        flex: 1,
        gap: 3,
        paddingVertical: 10,
    }
});
// Memoize frequently used components
var MemoizedChevronRight = ChevronRight;
var MemoizedLinearGradient = LinearGradient;
var NativeListComponent = function (_a) {
    var children = _a.children, style = _a.style, inline = _a.inline, animated = _a.animated, layout = _a.layout, entering = _a.entering, exiting = _a.exiting;
    var theme = useTheme();
    var colors = theme.colors;
    var listStyle = useMemo(function () { return [
        listStyles.list,
        {
            borderWidth: 0.5,
            borderColor: colors.border,
            backgroundColor: colors.card,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        inline && { marginTop: 16 },
        style,
    ]; }, [colors.border, colors.card, inline, style]);
    var defaultAnimation = useMemo(function () { return animPapillon(LinearTransition); }, []);
    var childrenWithProps = useMemo(function () { return Children.map(children, function (child, index) {
        if (!isValidElement(child))
            return null;
        var separator = (child.props.separator !== false) && index < (React.Children.count(children) - 1);
        var newChild = React.cloneElement(child, { separator: separator });
        return (<Reanimated.View style={listStyles.item} layout={animated && (layout !== null && layout !== void 0 ? layout : defaultAnimation)} key={newChild.props.identifier || index}>
        {newChild}
      </Reanimated.View>);
    }); }, [children, animated, layout, defaultAnimation]);
    return (<Reanimated.View style={listStyle} layout={animated && (layout !== null && layout !== void 0 ? layout : defaultAnimation)} entering={entering} exiting={exiting}>
      <Reanimated.View style={[{
                borderRadius: 16,
                borderCurve: "continuous",
                overflow: "hidden",
            }]} layout={animated && (layout !== null && layout !== void 0 ? layout : defaultAnimation)}>
        {childrenWithProps}
      </Reanimated.View>
    </Reanimated.View>);
};
export var NativeList = memo(NativeListComponent);
var NativeListHeaderComponent = function (_a) {
    var icon = _a.icon, label = _a.label, leading = _a.leading, trailing = _a.trailing, animated = _a.animated, layout = _a.layout, entering = _a.entering, exiting = _a.exiting, style = _a.style;
    var theme = useTheme();
    var colors = theme.colors;
    var defaultAnimation = useMemo(function () { return animPapillon(LinearTransition); }, []);
    var newIcon = useMemo(function () { return icon && React.cloneElement(icon, {
        size: 20,
        strokeWidth: 2.2,
        color: colors.text,
    }); }, [icon, colors.text]);
    return (<Reanimated.View style={[listHeaderStyles.container, style]} layout={animated && (layout !== null && layout !== void 0 ? layout : defaultAnimation)} entering={entering} exiting={exiting}>
      {icon && (<View style={listHeaderStyles.icon}>
          {newIcon}
        </View>)}
      {leading}
      <Text style={[
            { color: colors.text },
            listHeaderStyles.label,
        ]} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        {trailing}
      </View>
    </Reanimated.View>);
};
export var NativeListHeader = memo(NativeListHeaderComponent);
var NativePressableComponent = function (props) {
    if (Platform.OS === "android") {
        return (<TouchableNativeFeedback {...props}>
        <View style={[{ flexDirection: "row", alignItems: "center" }, props.style, props.androidStyle]}>
          {props.children}
        </View>
      </TouchableNativeFeedback>);
    }
    return (<Pressable {...props}>
      {props.children}
    </Pressable>);
};
export var NativePressable = memo(NativePressableComponent);
var NativeItemComponent = function (_a) {
    var children = _a.children, onPress = _a.onPress, onLongPress = _a.onLongPress, delayLongPress = _a.delayLongPress, separator = _a.separator, leading = _a.leading, trailing = _a.trailing, chevron = _a.chevron, style = _a.style, animated = _a.animated, entering = _a.entering, exiting = _a.exiting, icon = _a.icon, iconStyle = _a.iconStyle, onTouchStart = _a.onTouchStart, onTouchEnd = _a.onTouchEnd, androidStyle = _a.androidStyle, title = _a.title, subtitle = _a.subtitle, endPadding = _a.endPadding, disabled = _a.disabled, pointerEvents = _a.pointerEvents;
    var theme = useTheme();
    var colors = theme.colors;
    var defaultAnimation = useMemo(function () { return animPapillon(LinearTransition); }, []);
    var iconProps = useMemo(function () { return ({
        size: 24,
        strokeWidth: 2.5,
        color: colors.text,
        style: {
            opacity: 0.6,
            marginRight: 6,
        },
    }); }, [colors.text]);
    var clonedIcon = useMemo(function () {
        if (!icon || !React.isValidElement(icon))
            return null;
        return React.cloneElement(icon, {
            size: icon.props.size || 24,
            color: icon.props.color || colors.text,
            style: __assign(__assign(__assign({}, icon.props.style), { marginRight: 16, opacity: 0.8, marginLeft: 0 }), iconStyle),
        });
    }, [icon, colors.text, iconStyle]);
    return (<Reanimated.View layout={animated && defaultAnimation} entering={entering} exiting={exiting} pointerEvents={pointerEvents}>
      <NativePressable onPress={!disabled ? onPress : undefined} onLongPress={!disabled ? onLongPress : undefined} delayLongPress={delayLongPress} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} androidStyle={androidStyle} style={function (_a) {
            var pressed = _a.pressed;
            return [
                itemStyles.item,
                onPress && {
                    backgroundColor: pressed && !disabled ? colors.text + "12" : "transparent",
                },
                style,
                disabled && {
                    opacity: 0.5,
                },
            ];
        }}>
        <View style={[itemStyles.part, itemStyles.leading]}>
          {leading && !icon && leading}
          {clonedIcon}
        </View>
        <View style={[
            {
                flex: 1,
                height: "100%",
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                borderBottomWidth: separator ? 0.5 : 0,
                borderColor: colors.border,
            },
            !leading && { marginLeft: -15 },
        ]}>
          <View style={[itemStyles.part, itemStyles.content]}>
            {title && (<NativeText variant="title">
                {title}
              </NativeText>)}
            {subtitle && (<NativeText variant="subtitle">
                {subtitle}
              </NativeText>)}
            {children}
          </View>
          <View style={[itemStyles.part, itemStyles.trailing, { paddingRight: endPadding !== null && endPadding !== void 0 ? endPadding : 9 }]}>
            {trailing}
          </View>
          {onPress && chevron !== false && (<MemoizedChevronRight {...iconProps}/>)}
        </View>
      </NativePressable>
    </Reanimated.View>);
};
export var NativeItem = memo(NativeItemComponent);
var NativeIconComponent = function (_a) {
    var icon = _a.icon, color = _a.color, style = _a.style;
    var iconProps = useMemo(function () { return ({
        size: 22,
        strokeWidth: 2.4,
        color: "#FFFFFF",
    }); }, []);
    return (<View style={[{
                backgroundColor: color,
                borderRadius: 9,
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
            }, style]}>
      {React.cloneElement(icon, iconProps)}
    </View>);
};
export var NativeIcon = memo(NativeIconComponent);
var NativeIconGradientComponent = function (_a) {
    var icon = _a.icon, _b = _a.colors, colors = _b === void 0 ? ["#000", "#000"] : _b, _c = _a.locations, locations = _c === void 0 ? [0, 1] : _c, style = _a.style;
    var iconProps = useMemo(function () { return ({
        size: 22,
        strokeWidth: 2.4,
        color: "#FFFFFF",
    }); }, []);
    return (<MemoizedLinearGradient colors={colors} locations={locations} style={[{
                backgroundColor: "#000",
                borderRadius: 9,
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
            }, style]}>
      {React.cloneElement(icon, iconProps)}
    </MemoizedLinearGradient>);
};
export var NativeIconGradient = memo(NativeIconGradientComponent);
var fontStyles = {
    title: { fontFamily: "semibold", fontSize: 17, lineHeight: 20 },
    titleLarge: { fontFamily: "semibold", fontSize: 19, lineHeight: 24 },
    titleLarge2: { fontFamily: "bold", fontSize: 24, lineHeight: 28 },
    subtitle: { fontFamily: "medium", fontSize: 15, lineHeight: 18, opacity: 0.6 },
    overtitle: { fontFamily: "semibold", fontSize: 16, lineHeight: 18 },
    default: { fontFamily: "medium", fontSize: 16, lineHeight: 19 },
};
var NativeTextComponent = function (props) {
    var theme = useTheme();
    var colors = theme.colors;
    var defaultAnimation = useMemo(function () { return animPapillon(LinearTransition); }, []);
    // @ts-expect-error
    var fontStyle = fontStyles[props.variant || "default"];
    return (<Reanimated.Text {...props} style={[{
                fontFamily: "medium",
                fontSize: 16,
                color: props.color || colors.text,
            }, fontStyle, props.style]} layout={props.animated && defaultAnimation} entering={props.entering} exiting={props.exiting}>
      {props.children}
    </Reanimated.Text>);
};
export var NativeText = memo(NativeTextComponent);
