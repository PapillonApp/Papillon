import AddonsWebview from "@/components/Addons/AddonsWebview";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX } from "lucide-react-native";
var AddonPage = function (_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var addon = (_b = route.params) === null || _b === void 0 ? void 0 : _b.addon;
    var from = route.params.from;
    var data = route.params.data;
    var insets = useSafeAreaInsets();
    var showAlert = useAlert().showAlert;
    React.useEffect(function () {
        navigation.setOptions({
            title: addon.manifest.name
        });
    });
    return (<View style={{ flex: 1 }}>
      <AddonsWebview navigation={navigation} addon={{
            url: addon.manifest.placement[addon.index].main,
            name: addon.manifest.name,
            icon: addon.manifest.icon
        }} url={addon.manifest.placement[addon.index].main} scrollEnabled={true} inset={insets} setTitle={function (title) { return navigation.setOptions({ headerTitle: title }); }} data={data} requestNavigate={function (url, data) {
            //find the placement
            var index = -1;
            for (var i = 0; i < addon.manifest.placement.length; i++) {
                if (addon.manifest.placement[i].name == url) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                showAlert({
                    title: "Erreur",
                    message: "La page accédée n'a pas été trouvée.",
                    icon: <BadgeX />,
                }); //TODO: transfer error to webview
                return;
            }
            else {
                var newAddon = { manifest: addon.manifest, index: index };
                // @ts-ignore "Very hard to type, need to think about"
                navigation.push("Addon" + from + "Page", { addon: newAddon, from: from, data: data.data });
            }
        }}/>
    </View>);
};
export default AddonPage;
