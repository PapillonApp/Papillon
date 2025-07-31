import React from "react";
import { ScrollView } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { Scroll, HelpCircle, Bug, Info } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
var SettingsProject = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var openUrl = function (url) {
        WebBrowser.openBrowserAsync(url, {
            presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
            controlsColor: theme.colors.primary,
        });
    };
    var items = [
        {
            icon: <Scroll />,
            colors: ["#FF5722", "#FF8A65"], // Deep orange to light orange
            label: "Quoi de neuf ?",
            onPress: function () { return navigation.navigate("ChangelogScreen"); },
        },
        {
            icon: <HelpCircle />,
            colors: ["#2196F3", "#64B5F6"], // Blue to light blue
            label: "Besoin d'aide ?",
            onPress: function () { return openUrl("https://support.papillon.bzh/"); },
        },
        {
            icon: <Bug />,
            colors: ["#F44336", "#E57373"], // Red to light red
            label: "Signaler un problème",
            onPress: function () { return navigation.navigate("SettingsSupport"); },
        },
        {
            icon: <Info />,
            colors: ["#546E7A", "#90A4AE"], // Blue-grey to light blue-grey
            label: "À propos de Papillon",
            onPress: function () { return navigation.navigate("SettingsAbout"); },
        }
    ];
    return (<ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
        }}>
      <NativeList>
        {items.map(function (item, index) { return (<NativeItem key={index} onPress={item.onPress} leading={<NativeIconGradient icon={item.icon} colors={item.colors}/>}>
            <NativeText variant="title">
              {item.label}
            </NativeText>
            {item.description && (<NativeText variant="subtitle" style={{ marginTop: -3 }}>
                {item.description}
              </NativeText>)}
          </NativeItem>); })}
      </NativeList>
    </ScrollView>);
};
export default SettingsProject;
