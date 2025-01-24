import React from "react";
import { ScrollView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import {Moon, Sun, SunMoon} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import ApparenceContainerCard from "@/components/Settings/ApparenceContainerCard";
import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";

const SettingsApparence: Screen<"SettingsApparence"> = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { whatTheme, setWhatTheme } = useThemeSoundHaptics();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <ApparenceContainerCard />

      <NativeListHeader
        label="Mode d'affichage"
      />

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
    </ScrollView>
  );
};

export default SettingsApparence;
