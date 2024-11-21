import React from "react";
import { Text, ScrollView, View, StyleSheet, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import important_json from "@/utils/magic/regex/important.json"; // Ensure this file contains valid regex patterns
import MagicContainerCard from "@/components/Settings/MagicContainerCard";
import { NativeIcon, NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { ArrowUpNarrowWide, BookDashed, Brain } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";

const SettingsMagic: Screen<"SettingsMagic"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
    >
      <MagicContainerCard theme={theme} />

      <NativeListHeader label="Actualités" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.MagicNews ?? false}
              onValueChange={(value) => mutateProperty("personalization", { MagicNews: value })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<ArrowUpNarrowWide />}
              colors={["#04ACDC", "#6FE3CD"]}
            />
          }
        >
          <NativeText variant="title">
            Actualités prioritaires
          </NativeText>
          <NativeText variant="subtitle">
            Trie les actualités en fonction de leur importance et place en haut de la page celles jugées importantes
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Devoirs" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.MagicHomeworks ?? false}
              onValueChange={(value) => mutateProperty("personalization", { MagicHomeworks: value })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<BookDashed />}
              colors={["#FFD700", "#FF8C00"]}
            />
          }
        >
          <NativeText variant="title">
            Classement automatique
          </NativeText>
          <NativeText variant="subtitle">
            Détermine si un devoir relève d'une évaluation, d'un exercice ou d'un travail à rendre automatiquement
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsMagic;
