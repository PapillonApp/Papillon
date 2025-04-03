import React from "react";
import { ScrollView } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { Bell, Cable, Smile } from "lucide-react-native";

const SettingsGeneral: Screen<"SettingsGeneral"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const items = [
    {
      icon: <Bell />,
      colors: ["#F44336", "#FF7043"],
      label: "Notifications",
      onPress: () => navigation.navigate("SettingsNotifications"),
    },
    {
      icon: <Cable />,
      colors: ["#FF9800", "#FFCA28"],
      label: "Services externes",
      description: "Connecte ta cantine à Papillon",
      onPress: () => navigation.navigate("SettingsExternalServices"),
    },
    {
      icon: <Smile />,
      colors: ["#4CAF50", "#8BC34A"],
      label: "Réactions",
      onPress: () => navigation.navigate("SettingsReactions"),
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
            leading={
              <NativeIconGradient
                icon={item.icon}
                colors={item.colors}
              />
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

export default SettingsGeneral;