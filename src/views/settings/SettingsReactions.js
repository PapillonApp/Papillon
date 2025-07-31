import React from "react";
import { ScrollView, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import ReelGallery from "@/components/Settings/ReelGallery";
import MissingItem from "@/components/Global/MissingItem";
var SettingsReactions = function () {
    var theme = useTheme();
    var reelsObject = useGradesStore(function (store) { return store.reels; });
    var reels = Object.values(reelsObject);
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 16,
        }}>
      {reels.length === 0 ? (<View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
          <MissingItem animatedEmoji title="Aucune réaction" description="Rends-toi dans l'onglet 'Notes' pour ajouter des réactions."/>
        </View>) : (<ReelGallery reels={reels}/>)}
    </ScrollView>);
};
export default SettingsReactions;
