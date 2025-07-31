import React from "react";
import { ScrollView, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { WandSparkles, Blocks, Puzzle } from "lucide-react-native";
import { useFlagsStore } from "@/stores/flags";
import { SettingsSubItem } from "./Settings";

const SettingsExperimental: Screen<"SettingsExperimental"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const defined = useFlagsStore(state => state.defined);

  const items: SettingsSubItem[] = [
    {
      icon: <WandSparkles />,
      colors: ["#FB8C00", "#FFA726"],
      label: "Papillon Magic",
      beta: true,
      description: "Fonctionnalités intelligentes",
      onPress: () => navigation.navigate("SettingsMagic"),
    },
    {
      icon: <Blocks />,
      colors: ["#1976D2", "#42A5F5"],
      label: "Multiservice",
      beta: true,
      description: "Connecte plusieurs services en un seul espace de travail",
      onPress: () => navigation.navigate("SettingsMultiService"),
    },
    {
      icon: <Puzzle />,
      colors: ["#00897B", "#4DB6AC"],
      label: "Extensions",
      description: "Disponible prochainement",
      onPress: () => navigation.navigate("SettingsAddons"),
      disabled: !defined("enable_addons"),
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <NativeList>
        {items.map((item, index) => (
          <NativeItem
            key={index}
            onPress={item.onPress}
            disabled={"disabled" in item && item.disabled}
            leading={
              <NativeIconGradient
                icon={item.icon}
                colors={item.colors}
              />
            }
            trailing={
              item.beta && (
                <View
                  style={{
                    borderColor: colors.primary,
                    borderWidth: 1,
                    borderRadius: 7,
                    borderCurve: "continuous",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <NativeText
                    style={{
                      color: colors.primary,
                      textTransform: "uppercase",
                      fontFamily: "semibold",
                      fontSize: 12.5,
                      letterSpacing: 1,
                    }}
                  >
                    Bêta
                  </NativeText>
                </View>
              )
            }
          >
            <NativeText variant="title">
              {item.label}
            </NativeText>
            {"description" in item && item.description &&
              <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                {item.description}
              </NativeText>
            }
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

export default SettingsExperimental;