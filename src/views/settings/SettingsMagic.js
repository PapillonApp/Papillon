import React from "react";
import { ScrollView, Switch } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Ensure this file contains valid regex patterns
import MagicContainerCard from "@/components/Settings/MagicContainerCard";
import { NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { ArrowUpNarrowWide, BookDashed } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";
var SettingsMagic = function (_a) {
    var _b, _c, _d, _e;
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    return (<ScrollView contentContainerStyle={{
            paddingHorizontal: 15,
        }}>
      <MagicContainerCard theme={theme}/>

      <NativeListHeader label="Actualités"/>
      <NativeList>
        <NativeItem trailing={<Switch trackColor={{
                false: colors.border,
                true: colors.primary
            }} thumbColor={theme.dark ? colors.text : colors.background} value={(_c = (_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.MagicNews) !== null && _c !== void 0 ? _c : false} onValueChange={function (value) { return mutateProperty("personalization", { MagicNews: value }); }}/>} leading={<NativeIconGradient icon={<ArrowUpNarrowWide />} colors={["#04ACDC", "#6FE3CD"]}/>}>
          <NativeText variant="title">
            Actualités prioritaires
          </NativeText>
          <NativeText variant="subtitle">
            Trie les actualités en fonction de leur importance et place en haut de la page celles jugées importantes
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Devoirs"/>
      <NativeList>
        <NativeItem trailing={<Switch trackColor={{
                false: colors.border,
                true: colors.primary
            }} thumbColor={theme.dark ? colors.text : colors.background} value={(_e = (_d = account === null || account === void 0 ? void 0 : account.personalization) === null || _d === void 0 ? void 0 : _d.MagicHomeworks) !== null && _e !== void 0 ? _e : false} onValueChange={function (value) { return mutateProperty("personalization", { MagicHomeworks: value }); }}/>} leading={<NativeIconGradient icon={<BookDashed />} colors={["#FFD700", "#FF8C00"]}/>}>
          <NativeText variant="title">
            Classement automatique
          </NativeText>
          <NativeText variant="subtitle">
            Détermine si un devoir relève d'une évaluation, d'un exercice ou d'un travail à rendre automatiquement
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>);
};
export default SettingsMagic;
