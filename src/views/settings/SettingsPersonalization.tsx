import React, { useState } from "react";
import { ScrollView, Platform } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { Sparkles, SwatchBook, Route, Palette } from "lucide-react-native";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import { SettingsSubItem } from "./Settings";

const SettingsPersonalization: Screen<"SettingsPersonalization"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [click, setClick] = useState<true | false>(false);
  const { isTablet } = useScreenDimensions();

  // These are regular items that stay within the settings navigation
  const regularItems: SettingsSubItem[] = [
    {
      icon: <SwatchBook />,
      colors: ["#4CAF50", "#8BC34A"],
      label: "Matières",
      onPress: () => navigation.navigate("SettingsSubjects"),
    },
    {
      icon: <Sparkles />,
      colors: ["#2196F3", "#03A9F4"],
      label: "Icône de l'application",
      onPress: () => navigation.navigate("SettingsIcons"),
      android: false,
    },
  ];

  // These are special items that close the settings modal and show a full-screen view
  const specialItems: SettingsSubItem[] = [
    {
      icon: <Palette />,
      colors: ["#9C27B0", "#BA68C8"],
      label: "Thème de couleur",
      onPress: async () => {
        // Close the entire Settings stack
        navigation.getParent()?.goBack();

        // Navigate to the ColorSelector after a short delay
        setTimeout(() => {
          navigation.navigate("ColorSelector", { settings: true });
        }, 10);
      }
    }
  ];

  // Add Tabs & Navigation item if not on tablet
  if (!isTablet) {
    specialItems.push({
      icon: click ? (
        <PapillonSpinner
          size={18}
          color="white"
          strokeWidth={2.8}
          entering={animPapillon(ZoomIn)}
          exiting={animPapillon(ZoomOut)}
        />) : <Route />,
      colors: ["#673AB7", "#9575CD"],
      label: "Onglets & Navigation",
      onPress: async () => {
        setClick(true);

        // Close the entire Settings stack
        navigation.getParent()?.goBack();

        // Navigate to SettingsTabs after a short delay
        setTimeout(() => {
          navigation.navigate("SettingsTabs");
          setClick(false);
        }, 10);
      }
    });
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <NativeList>
        {regularItems.map((item, index) => (
          (Platform.OS === "android" && "android" in item && !item.android) ? null :
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

      <NativeList style={{ marginTop: 16 }}>
        {specialItems.map((item, index) => (
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

export default SettingsPersonalization;