import React, { useEffect } from "react";
import { Text, ScrollView, View, TouchableOpacity, Image } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { BadgeInfo, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import IconsContainerCard from "@/components/Settings/IconsContainerCard";

import { icones } from "@/utils/data/icones";
import colorsList from "@/utils/data/colors.json";

import { getIconName, setIconName } from "@candlefinance/app-icon";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { useAlert } from "@/providers/AlertProvider";

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

const SettingsIcons: Screen<"SettingsIcons"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const {showAlert} = useAlert();
  const insets = useSafeAreaInsets();
  const data = icones as { [key: string]: Icon[] };

  const [currentIcon, setIcon] = React.useState("default");

  useEffect(() => {
    if (!isExpoGo()) {
      getIconName().then((icon) => {
        setIcon(icon);
      });
    };
  }, []);

  const setNewIcon = (icon: Icon) => {
    if (icon.isVariable) {
      const mainColor = theme.colors.primary;
      const colorItem = colorsList.find((color) => color.hex.primary === mainColor);

      const iconConstructName = icon.id + (colorItem ? "_" + colorItem.id : "");

      if (!isExpoGo()) {
        setIconName(iconConstructName);
        setIcon(iconConstructName);
      } else {
        alertExpoGo(showAlert);
      };
    }
    else {
      if (!isExpoGo()) {
        setIconName(icon.id);
        setIcon(icon.id);
      } else {
        alertExpoGo(showAlert);
      };
    }
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
                  setNewIcon(icon);
                }}
                leading={<Image
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
                />}
                trailing={
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
                        <Sparkles color={colors.primary} style={{ marginRight: 10}}/>
                      </TouchableOpacity>
                    ) : null}

                    <PapillonCheckbox
                      checked={removeColor(currentIcon) === icon.id}
                      onPress={() => {
                        setNewIcon(icon);
                      }}
                    />
                  </View>
                }
              >
                <NativeText variant="title">{icon.name}</NativeText>
                {(icon.author && icon.author.trim() !== "") &&
                <NativeText variant="subtitle">{icon.author}</NativeText>
                }
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
