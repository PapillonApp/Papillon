import React, { useEffect } from "react";
import { Text, ScrollView, View, TouchableOpacity, Image } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BadgeInfo, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import IconsContainerCard from "@/components/Settings/IconsContainerCard";
import { icones } from "@/utils/data/icones";
import colorsList from "@/utils/data/colors.json";
import { getIconName, setIconName } from "@candlefinance/app-icon";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { useAlert } from "@/providers/AlertProvider";
export var removeColor = function (icon) {
    var newName = icon;
    for (var _i = 0, colorsList_1 = colorsList; _i < colorsList_1.length; _i++) {
        var color = colorsList_1[_i];
        newName = newName.replace("_".concat(color.id), "");
    }
    return newName;
};
var SettingsIcons = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var showAlert = useAlert().showAlert;
    var insets = useSafeAreaInsets();
    var data = icones;
    var _b = React.useState("default"), currentIcon = _b[0], setIcon = _b[1];
    useEffect(function () {
        if (!isExpoGo()) {
            getIconName().then(function (icon) {
                setIcon(icon);
            });
        }
        ;
    }, []);
    var setNewIcon = function (icon) {
        if (icon.isVariable) {
            var mainColor_1 = theme.colors.primary;
            var colorItem = colorsList.find(function (color) { return color.hex.primary === mainColor_1; });
            var iconConstructName = icon.id + (colorItem ? "_" + colorItem.id : "");
            if (!isExpoGo()) {
                setIconName(iconConstructName);
                setIcon(iconConstructName);
            }
            else {
                alertExpoGo(showAlert);
            }
            ;
        }
        else {
            if (!isExpoGo()) {
                setIconName(icon.id);
                setIcon(icon.id);
            }
            else {
                alertExpoGo(showAlert);
            }
            ;
        }
    };
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
        }}>
      <IconsContainerCard theme={theme}/>

      {Object.keys(data).map(function (key, index) { return (<View key={index}>
          <NativeListHeader label={key} trailing={(<View>
                {(key === "Dynamiques") && (<TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 10,
                        marginVertical: -3,
                        marginTop: -4,
                        backgroundColor: colors.primary + "22",
                    }} onPress={function () {
                        showAlert({
                            title: "Icônes dynamiques",
                            message: "Les icônes dynamiques changent de couleur en fonction de ton thème.",
                            icon: <BadgeInfo />,
                        });
                    }}>
                    <Text style={{
                        color: colors.primary,
                        fontSize: 14.5,
                        letterSpacing: 0.3,
                        fontFamily: "semibold",
                    }}>
                      Qu'est ce que c'est ?
                    </Text>
                  </TouchableOpacity>)}
              </View>)}/>
          <NativeList>
            {data[key].map(function (icon, index) {
                var _a;
                return (<NativeItem key={index} chevron={false} onPress={function () {
                        setNewIcon(icon);
                    }} leading={<Image source={icon.isVariable
                            ? icon.dynamic[((_a = colorsList.find(function (color) { return color.hex.primary === colors.primary; })) === null || _a === void 0 ? void 0 : _a.id) || "green"]
                            : icon.icon} style={{
                            width: 50,
                            height: 50,
                            borderRadius: 10,
                            resizeMode: "contain",
                            marginLeft: -6,
                        }}/>} trailing={<View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            paddingRight: 10,
                        }}>
                    {icon.isVariable ? (<TouchableOpacity onPress={function () {
                                showAlert({
                                    title: "Icônes dynamiques",
                                    message: "Les icônes dynamiques changent de couleur en fonction de ton thème.",
                                    icon: <BadgeInfo />,
                                });
                            }}>
                        <Sparkles color={colors.primary} style={{ marginRight: 10 }}/>
                      </TouchableOpacity>) : null}

                    <PapillonCheckbox checked={removeColor(currentIcon) === icon.id} onPress={function () {
                            setNewIcon(icon);
                        }}/>
                  </View>}>
                <NativeText variant="title">{icon.name}</NativeText>
                {(icon.author && icon.author.trim() !== "") &&
                        <NativeText variant="subtitle">{icon.author}</NativeText>}
              </NativeItem>);
            })}
          </NativeList>
        </View>); })}

      <View style={{
            marginBottom: insets.bottom,
        }}/>


    </ScrollView>);
};
export default SettingsIcons;
