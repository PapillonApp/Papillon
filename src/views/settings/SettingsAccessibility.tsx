import React from "react";
import { ScrollView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Moon, Sun, SunMoon, Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeList,
  NativeItem,
  NativeListHeader,
  NativeIconGradient,
} from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";
import { Switch } from "react-native-gesture-handler";
import AccessibilityContainerCard from "@/components/Settings/AccesilityContainerCard";

const SettingsAccessibility: Screen<"SettingsAccessibility"> = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    enableSon,
    setEnableSon,
    enableHaptics,
    setEnableHaptics,
    whatTheme,
    setWhatTheme,
  } = useThemeSoundHaptics();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <AccessibilityContainerCard />

      <NativeListHeader label="Mode d'affichage" />

      <NativeList>
        <NativeItem
          style={{ height: 50 }}
          leading={<SunMoon color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1E316A"}
              checked={whatTheme === 0}
              onPress={() => setWhatTheme(0)}
              style={{ marginRight: 5 }}
            />
          }
          onPress={() => setWhatTheme(0)}
          chevron={false}
        >
          <NativeText variant="title">Suivre le thème du système</NativeText>
        </NativeItem>
        <NativeItem
          style={{ height: 50 }}
          leading={<Sun color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1E316A"}
              checked={whatTheme === 1}
              onPress={() => setWhatTheme(1)}
              style={{ marginRight: 5 }}
            />
          }
          onPress={() => setWhatTheme(1)}
          chevron={false}
        >
          <NativeText variant="title">Mode clair</NativeText>
        </NativeItem>
        <NativeItem
          style={{ height: 50 }}
          leading={<Moon color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1E316A"}
              checked={whatTheme === 2}
              onPress={() => setWhatTheme(2)}
              style={{ marginRight: 5 }}
            />
          }
          onPress={() => setWhatTheme(2)}
          chevron={false}
        >
          <NativeText variant="title">Mode sombre</NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Son" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.dark ? theme.colors.text : theme.colors.background}
              value={enableSon}
              onValueChange={(value) => setEnableSon(value)}
            />
          }
          leading={
            <NativeIconGradient
              icon={<Volume2 />}
              colors={["#04ACDC", "#6FE3CD"]}
            />
          }
        >
          <NativeText variant="title">Jouer du son</NativeText>
          <NativeText variant="subtitle">
            Un son est joué lors de l'ouverture de différentes pages
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Vibration" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.dark ? theme.colors.text : theme.colors.background}
              value={enableHaptics}
              onValueChange={(value) => setEnableHaptics(value)}
            />
          }
          leading={
            <NativeIconGradient
              icon={<Vibrate />}
              colors={["#FFD700", "#FF8C00"]}
            />
          }
        >
          <NativeText variant="title">Jouer des vibrations</NativeText>
          <NativeText variant="subtitle">
            Des vibrations ont lieu lors de la navigation, lorsqu'on coche des
            devoirs...
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

export default SettingsAccessibility;
