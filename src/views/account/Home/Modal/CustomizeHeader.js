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
import React, { useEffect, useLayoutEffect } from "react";
import { FlatList, Image, Pressable, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { useCurrentAccount } from "@/stores/account";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { COLORS_LIST } from "@/services/shared/Subject";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Dice5, Moon, Palette, PictureInPicture } from "lucide-react-native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
export var HEADERS_IMAGE = [
    {
        label: "stars",
        source: require("@/../assets/headers/stars.png"),
    },
    {
        label: "topography",
        source: require("@/../assets/headers/topography.png"),
    },
    {
        label: "boxes",
        source: require("@/../assets/headers/boxes.png"),
    },
    {
        label: "texture",
        source: require("@/../assets/headers/texture.png"),
    },
    {
        label: "hlr",
        source: require("@/../assets/headers/hlr.png"),
    },
    {
        label: "v7",
        source: require("@/../assets/headers/v7.png"),
    },
    {
        label: "ailes",
        source: require("@/../assets/headers/ailes.png"),
    },
    {
        label: "spark",
        source: require("@/../assets/headers/spark.png"),
    },
    {
        label: "tictactoe",
        source: require("@/../assets/headers/tictactoe.png"),
    },
    {
        label: "star",
        source: require("@/../assets/headers/star.png"),
    }
];
var CustomizeHeader = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var route = _a.route, navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var defaultGradient = {
        startColor: COLORS_LIST[0],
        endColor: COLORS_LIST[1],
        angle: 0,
    };
    var _s = React.useState((_c = (_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.header) === null || _c === void 0 ? void 0 : _c.image), image = _s[0], setImage = _s[1];
    var _t = React.useState(((_e = (_d = account === null || account === void 0 ? void 0 : account.personalization) === null || _d === void 0 ? void 0 : _d.header) === null || _e === void 0 ? void 0 : _e.gradient) || defaultGradient), gradient = _t[0], setGradient = _t[1];
    var _u = React.useState(((_g = (_f = account === null || account === void 0 ? void 0 : account.personalization) === null || _f === void 0 ? void 0 : _f.header) === null || _g === void 0 ? void 0 : _g.darken) || false), darken = _u[0], setDarken = _u[1];
    var _v = React.useState(undefined), centerReset = _v[0], setCenterReset = _v[1];
    useEffect(function () {
        mutateProperty("personalization", {
            header: {
                gradient: gradient,
                image: image,
                darken: darken,
            },
        });
    }, [gradient, image]);
    var colors = useTheme().colors;
    var randomizeGradient = function () {
        var startColor = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
        var endColor = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
        setGradient({
            startColor: startColor,
            endColor: endColor,
            angle: 0,
        });
        setCenterReset(Math.random());
    };
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () {
                var _a, _b, _c;
                return (<TouchableOpacity onPress={function () {
                        randomizeGradient();
                    }} style={{
                        padding: 8,
                        borderRadius: 100,
                    }}>
          <Dice5 color={((_c = (_b = (_a = account === null || account === void 0 ? void 0 : account.personalization) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.gradient) === null || _c === void 0 ? void 0 : _c.startColor) || colors.primary} size={24}/>
        </TouchableOpacity>);
            },
        });
    }, [navigation, colors.primary, (_k = (_j = (_h = account === null || account === void 0 ? void 0 : account.personalization) === null || _h === void 0 ? void 0 : _h.header) === null || _j === void 0 ? void 0 : _j.gradient) === null || _k === void 0 ? void 0 : _k.startColor]);
    return (<ScrollView contentContainerStyle={{
            paddingHorizontal: 16,
        }}>
      <NativeListHeader style={{
            marginTop: 16,
        }} icon={<Palette />} label="Dégradé de couleur" trailing={<Switch value={((_m = (_l = account === null || account === void 0 ? void 0 : account.personalization) === null || _l === void 0 ? void 0 : _l.header) === null || _m === void 0 ? void 0 : _m.gradient) !== undefined} onValueChange={function (value) {
                var gradValue = value ? gradient || defaultGradient : undefined;
                mutateProperty("personalization", {
                    header: {
                        image: image,
                        darken: darken,
                        gradient: gradValue || defaultGradient,
                    },
                });
                setGradient(gradValue || defaultGradient);
            }}/>}/>
      <NativeList>
        <HorizontalColorSelector centerReset={centerReset} selected={(gradient === null || gradient === void 0 ? void 0 : gradient.startColor) || undefined} onColorSelect={function (color) {
            if (!gradient) {
                setGradient(defaultGradient);
            }
            setGradient(function (prev) { return (__assign(__assign({}, prev), { startColor: color })); });
        }}/>
      </NativeList>
      <NativeList inline>
        <HorizontalColorSelector centerReset={centerReset} selected={(gradient === null || gradient === void 0 ? void 0 : gradient.endColor) || undefined} onColorSelect={function (color) {
            if (!gradient) {
                setGradient(defaultGradient);
            }
            setGradient(function (prev) { return (__assign(__assign({}, prev), { endColor: color })); });
        }}/>
      </NativeList>



      <NativeListHeader style={{
            marginTop: 18,
            marginBottom: 8,
        }} icon={<Moon />} label="Assombrir le fond" trailing={<Switch value={((_p = (_o = account === null || account === void 0 ? void 0 : account.personalization) === null || _o === void 0 ? void 0 : _o.header) === null || _p === void 0 ? void 0 : _p.darken) || false} onValueChange={function (value) {
                mutateProperty("personalization", {
                    header: {
                        gradient: gradient,
                        image: image,
                        darken: value,
                    },
                });
                setDarken(value);
            }}/>}/>

      <NativeListHeader style={{
            marginTop: 16,
        }} icon={<PictureInPicture />} label="Image" trailing={<Switch value={((_r = (_q = account === null || account === void 0 ? void 0 : account.personalization) === null || _q === void 0 ? void 0 : _q.header) === null || _r === void 0 ? void 0 : _r.image) !== undefined} onValueChange={function (value) {
                mutateProperty("personalization", {
                    header: {
                        gradient: gradient,
                        image: value ? image || HEADERS_IMAGE[0].label : undefined,
                        darken: darken,
                    },
                });
                setImage(value ? image || HEADERS_IMAGE[0].label : undefined);
            }}/>}/>
      <NativeList>
        <FlatList data={HEADERS_IMAGE} horizontal keyExtractor={function (item) { return item.label; }} renderItem={function (_a) {
            var item = _a.item;
            return (<Pressable style={{
                    backgroundColor: ((gradient === null || gradient === void 0 ? void 0 : gradient.startColor) || colors.primary) + "20",
                    borderWidth: 2,
                    borderColor: image === item.label ? (gradient === null || gradient === void 0 ? void 0 : gradient.startColor) || colors.primary : "transparent",
                    borderRadius: 12,
                    borderCurve: "continuous",
                    width: 120,
                    height: 80,
                    overflow: "hidden",
                }} onPress={function () {
                    setImage(item.label);
                }}>
              <Image source={item.source} tintColor={(gradient === null || gradient === void 0 ? void 0 : gradient.startColor) || colors.primary} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}/>
            </Pressable>);
        }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingVertical: 8,
            paddingHorizontal: 8,
            gap: 8,
        }}/>
      </NativeList>

      <InsetsBottomView />
    </ScrollView>);
};
var HorizontalColorSelector = function (_a) {
    var onColorSelect = _a.onColorSelect, selected = _a.selected, centerReset = _a.centerReset;
    var colors = useTheme().colors;
    var SelectorRef = React.useRef(null);
    var ITEM_WIDTH = 72; // Largeur de l'élément + marges
    var ITEM_HEIGHT = 40; // Hauteur de l'élément + marges
    var scrollToIndex = function (index, animated) {
        if (SelectorRef.current) {
            SelectorRef.current.scrollToIndex({
                index: index,
                animated: animated,
                viewPosition: 0,
            });
        }
    };
    var resetScroll = function (animated) {
        var index = COLORS_LIST.findIndex(function (color) { return color === selected; });
        if (index !== -1) {
            scrollToIndex(index, animated);
        }
    };
    useEffect(function () {
        setTimeout(function () {
            resetScroll(centerReset !== undefined);
        }, 100);
    }, [centerReset]);
    return (<FlatList ref={SelectorRef} data={COLORS_LIST} horizontal keyExtractor={function (item) { return item; }} renderItem={function (_a) {
            var item = _a.item;
            return (<Pressable style={{
                    backgroundColor: selected === item ? item : "transparent",
                    borderRadius: 14,
                    borderCurve: "continuous",
                    width: ITEM_WIDTH,
                    height: ITEM_HEIGHT,
                }} onPress={function () {
                    if (onColorSelect) {
                        onColorSelect(item);
                    }
                }}>
          <View style={{
                    backgroundColor: item,
                    width: ITEM_WIDTH - 6,
                    height: ITEM_HEIGHT - 6,
                    borderRadius: 11,
                    borderCurve: "continuous",
                    margin: 3,
                    borderWidth: !(selected === item) ? 1 : 2,
                    borderColor: !(selected === item) ? colors.text + "44" : colors.background,
                }}/>
        </Pressable>);
        }} getItemLayout={function (_, index) { return ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index: index,
        }); }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingVertical: 8,
            paddingHorizontal: 8,
        }}/>);
};
export default CustomizeHeader;
