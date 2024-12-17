import React from "react";
import { Text, ScrollView, View, StyleSheet, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIcon, NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { ArrowUpNarrowWide, BookDashed, Brain, CheckSquare, Search } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";

const SettingsCheck: Screen<"SettingsCheck"> = ({ navigation }) => {
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
      <NativeListHeader label="Laisser activé" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.KeepCheckActivated ?? false}
              onValueChange={(value) => {
                mutateProperty("personalization", { KeepCheckActivated: value });
              }}
            />
          }
          leading={
            <NativeIconGradient
              icon={<CheckSquare />}
              colors={["#FF8FA3", "#E63946"]}
            />
          }
        >
          <NativeText variant="title">
            Devoirs non-faits
          </NativeText>
          <NativeText variant="subtitle">
            Activer l'affichage par défaut des devoirs non-faits uniquement
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.KeepCheckVisible ?? false}
              onValueChange={(value) => mutateProperty("personalization", { KeepCheckVisible: value })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<Search />}
              colors={["#A8E063", "#56AB2F"]}
            />
          }
        >
          <NativeText variant="title">
            Cacher l'icone
          </NativeText>
          <NativeText variant="subtitle">
            Ranger l'icône de tri des devoirs non-faits derrière la semaine
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsCheck;
