import AddonsWebview from "@/components/Addons/AddonsWebview";
import { View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import React from "react";
import {AddonPlacementManifest} from "@/addons/types";
import {Screen} from "@/router/helpers/types";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX } from "lucide-react-native";

const AddonPage: Screen<"AddonPage"> = ({ navigation, route }) => {
  const addon: AddonPlacementManifest = route.params?.addon;
  let from = route.params.from;
  let data = route.params.data;
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();

  React.useEffect(() => {
    navigation.setOptions({
      title: addon.manifest.name
    });
  });

  return (
    <View style={{flex: 1}}>
      <AddonsWebview
        navigation={navigation}
        addon={{
          url: addon.manifest.placement[addon.index].main,
          name: addon.manifest.name,
          icon: addon.manifest.icon
        }}
        url={addon.manifest.placement[addon.index].main}
        scrollEnabled={true}
        inset={insets}
        setTitle={(title) => navigation.setOptions({headerTitle: title})}
        data={data}
        requestNavigate={(url, data) => {
          //find the placement
          var index = -1;
          for(var i = 0; i < addon.manifest.placement.length; i++){
            if(addon.manifest.placement[i].name == url){
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
          } else {
            let newAddon: AddonPlacementManifest = {manifest: addon.manifest, index: index};
            // @ts-ignore "Very hard to type, need to think about"
            navigation.push("Addon" + from + "Page", { addon: newAddon, from: from, data: data.data });
          }
        }}
      />
    </View>

  );
};

export default AddonPage;
