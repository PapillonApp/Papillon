import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import {Moon, RefreshCw, Sun, SunMoon} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {FadeInDown, FadeOutDown} from "react-native-reanimated";
import ApparenceContainerCard from "@/components/Settings/ApparenceContainerCard";

const SettingsApparence: Screen<"SettingsApparence"> = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedTheme, setSelectedTheme] = useState<number>(0);
  const [hasUserChangedTheme, setHasUserChangedTheme] = useState<boolean>(false);
  const [defaultTheme, setDefaultTheme] = useState<number>(0);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((value) => {
      if (value)
      {
        setDefaultTheme(parseInt(value));
        setSelectedTheme(parseInt(value));
      }
    });
  }, []);

  useEffect(() => {
    setHasUserChangedTheme(selectedTheme !== defaultTheme);
    AsyncStorage.setItem("theme", selectedTheme.toString());
  }, [selectedTheme]);

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
          style={{height: 50}}
          leading={<SunMoon color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1e316a"}
              checked={selectedTheme === 0}
              onPress={() => {
                setSelectedTheme(0);
              }}
              style={{marginRight: 5}}
            />
          }
          onPress={() => {setSelectedTheme(0);}}
          chevron={false}
        >
          <NativeText variant="title">Suivre le thème du système</NativeText>
        </NativeItem>
        <NativeItem
          style={{height: 50}}
          leading={<Sun color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1e316a"}
              checked={selectedTheme === 1}
              onPress={() => {
                setSelectedTheme(1);
              }}
              style={{marginRight: 5}}
            />
          }
          onPress={() => {setSelectedTheme(1);}}
          chevron={false}
        >
          <NativeText variant="title">Mode clair</NativeText>
        </NativeItem>
        <NativeItem
          style={{height: 50}}
          leading={<Moon color={theme.colors.text} />}
          trailing={
            <PapillonCheckbox
              color={"#1e316a"}
              checked={selectedTheme === 2}
              onPress={() => {
                setSelectedTheme(2);
              }}
              style={{marginRight: 5}}
            />
          }
          onPress={() => {setSelectedTheme(2);}}
          chevron={false}
        >
          <NativeText variant="title">Mode sombre</NativeText>
        </NativeItem>
      </NativeList>

      {hasUserChangedTheme && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <NativeList>
            <NativeItem
              leading={<RefreshCw color={"#FFF"}/>}
              style={{backgroundColor: "#C53424"}}
            >
              <NativeText variant="title" color={"#FFF"}>Redémarrer l'application</NativeText>
              <NativeText variant={"subtitle"} color={"#FFF"}>Cette option nécessite un redémarrage de l'application pour être appliquée.</NativeText>
            </NativeItem>
          </NativeList>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default SettingsApparence;
