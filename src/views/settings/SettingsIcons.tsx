import React, { useEffect } from "react";
import { Text, ScrollView, View, TouchableOpacity, Image, Platform } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BadgeInfo, RefreshCcw, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import IconsContainerCard from "@/components/Settings/IconsContainerCard";

import { icones } from "@/utils/data/icones";
import colorsList from "@/utils/data/colors.json";

import { getActiveIcon, resetIcon, setIcon } from "react-native-app-icon-changer";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { useAlert } from "@/providers/AlertProvider";
import RNRestart from "react-native-restart";

type Icon = {
  id: string;
  name: string;
  icon: number; // require ".png" files returns `number`
  author: string;
  isSpecial: boolean;
  isPremium: boolean;
} & (
  | { isVariable: false }
  | { isVariable: true, dynamic: Record<string, number> }
);

export const removeColor = (icon: string) => {
  let newName = icon;

  for (const color of colorsList) {
    newName = newName.replace(`_${color.id}`, "");
  }

  return newName;
};

const SettingsIcons: Screen<"SettingsIcons"> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const data = icones as { [key: string]: Icon[] };

  const [currentIcon, setCurrentIcon] = React.useState("default");
  const [disableChoise, setDisableChoise] = React.useState(false);

  useEffect(() => {
    const currentIcon = async () => {
      try {
        const THEicon = await getActiveIcon();

        const validIcons = ["default", ...Object.values(icones).flat().map((icon) => icon.id)];

        if (!THEicon || !validIcons.includes(THEicon)) {
          await resetIcon();
          setCurrentIcon("default");
        } else {
          setCurrentIcon(THEicon === "Default" ? "default" : THEicon);
        }
      } catch (error) {
        console.error("Erreur lors de la détection de l'icône active", error);
      }
    };

    if (!isExpoGo()) {
      currentIcon();
    }
  }, []);

  const setNewIcon = (icon: Icon) => {
    if (isExpoGo()) {
      alertExpoGo(showAlert);
      return;
    }

    const mainColor = theme.colors.primary;
    const colorItem = colorsList.find((color) => color.hex.primary === mainColor);
    const baseId = Platform.OS === "android" ? icon.id : `AppIcon_${icon.id}`;
    const iconConstructName = icon.isVariable ? `${baseId}_${colorItem?.id ?? "green"}` : baseId;

    const applyIconChange = async () => {
      try {
        if (icon.id === "default") {
          await resetIcon();
          setCurrentIcon("default");
        } else {
          await setIcon(iconConstructName);
          setCurrentIcon(iconConstructName);
        }
        setDisableChoise(true);

        setTimeout(() => {
          RNRestart.restart();
        }, 300);
      } catch (e) {
        console.error("Erreur lors du changement d'icône", e);
      }
    };

    applyIconChange();
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <IconsContainerCard
        theme={theme}
      />

      <View>
        <NativeList inline>
          <NativeItem icon={<RefreshCcw />}>
            <NativeText
              variant="title"
              style={{ paddingVertical: 2, marginBottom: -4 }}
            >
              Redémarrage automatique
            </NativeText>
            <NativeText variant="subtitle">
              Pour que les modifications s'appliquent correctement, l'application va se fermer dès que tu vas changer d'icône
            </NativeText>
          </NativeItem>
        </NativeList>
      </View>

      {Object.keys(data).map((key, index) => (
        <View key={index}>
          <NativeListHeader
            label={key}
            trailing={(
              <View>
                {(key === "Dynamiques") && (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                      marginVertical: -3,
                      marginTop: -4,
                      backgroundColor: colors.primary + "22",
                    }}
                    onPress={() => {
                      showAlert({
                        title: "Icônes dynamiques",
                        message: "Les icônes dynamiques changent de couleur en fonction de ton thème.",
                        icon: <BadgeInfo />,
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 14.5,
                        letterSpacing: 0.3,
                        fontFamily: "semibold",
                      }}
                    >
                      Qu'est ce que c'est ?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <NativeList>
            {data[key as keyof typeof data].map((icon, index) => (
              <NativeItem
                key={index}
                chevron={false}
                onPress={() => {
                  if (icon.id !== currentIcon && !disableChoise) {
                    setNewIcon(icon);
                  }
                }}
                leading={(
                  <Image
                    source={
                      icon.isVariable
                        ? icon.dynamic[colorsList.find((color) => color.hex.primary === colors.primary)?.id || "green"]
                        : icon.icon
                    }
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      resizeMode: "contain",
                      marginLeft: -6,
                    }}
                  />
                )}
                trailing={(
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingRight: 10,
                    }}
                  >
                    {icon.isVariable ? (
                      <TouchableOpacity
                        onPress={() => {
                          showAlert({
                            title: "Icônes dynamiques",
                            message: "Les icônes dynamiques changent de couleur en fonction de ton thème.",
                            icon: <BadgeInfo />,
                          });
                        }}
                      >
                        <Sparkles color={colors.primary} style={{ marginRight: 10 }} />
                      </TouchableOpacity>
                    ) : null}

                    <PapillonCheckbox
                      checked={removeColor(currentIcon) === icon.id}
                      onPress={() => {
                        if (icon.id !== currentIcon && !disableChoise) {
                          setNewIcon(icon);
                        }
                      }}
                    />
                  </View>
                )}
              >
                <NativeText variant="title">{icon.name}</NativeText>
                {icon.author && icon.author.trim() !== "" && (
                  <NativeText variant="subtitle">{icon.author}</NativeText>
                )}
              </NativeItem>
            ))}
          </NativeList>
        </View>
      ))}

      <View
        style={{
          marginBottom: insets.bottom,
        }}
      />
    </ScrollView>
  );
};

export default SettingsIcons;
