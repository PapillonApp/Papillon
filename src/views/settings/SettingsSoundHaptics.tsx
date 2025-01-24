import React from "react";
import { ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeList,
  NativeItem,
  NativeListHeader,
  NativeIconGradient,
} from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import SoundHapticsContainerCard from "@/components/Settings/SoundHapticsContainerCard";
import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";

const SettingsApparence: Screen<"SettingsSoundHaptics"> = () => {
  const insets = useSafeAreaInsets();
  const { enableSon, setEnableSon, enableHaptics, setEnableHaptics } =
    useThemeSoundHaptics();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <SoundHapticsContainerCard />

      <NativeListHeader label="Son" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
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

export default SettingsApparence;
