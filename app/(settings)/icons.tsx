import { Platform, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Papicons } from "@getpapillon/papicons";
import { AppColors, Colors } from "@/utils/colors";
import LinearGradient from "react-native-linear-gradient";
import { useSettingsStore } from "@/stores/settings";
import { useHeaderHeight } from "@react-navigation/elements";
import { Dynamic } from "@/ui/components/Dynamic";
import TableFlatList from "@/ui/components/TableFlatList";
import { AppIcons } from "@/utils/icons/list";
import { getIconName, setIconName } from "@candlefinance/app-icon"

const PersonalizationSettings = () => {

  const settingsStore = useSettingsStore(state => state.personalization);

  const defaultColorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
  const selectedColor = defaultColorData.mainColor;
  const [currentIcon, setCurrentIcon] = useState<string>("");

  useEffect(() => {
    (async () => {
      const iconName = await getIconName();
      setCurrentIcon(iconName);
    })();
  }, []);

  const icons = AppIcons
  const height = useHeaderHeight();

  return (
    <>
      <Dynamic animated key={'color-grad-stgs:' + selectedColor}>
        <LinearGradient
          colors={[selectedColor + "50", selectedColor + "00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 400,
          }}
        />
      </Dynamic>

      <ScrollView
        contentInsetAdjustmentBehavior="always"
        style={{ flex: 1, paddingTop: Platform.OS === "android" ? height : 0 }}
      >
        <TableFlatList
          style={{ backgroundColor: "transparent" }}
          sections={[
            {
              title: "Icônes dynamiques",
              items: icons.Dynamics.map((icon) => {
                const colorName = Colors[defaultColorData.colorEnum];
                const colorNameCapitalized = colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase();
                const iconName = icon.iconName + colorNameCapitalized;
                const appIconName = "AppIcon-" + iconName;
                return {
                  title: icon.name,
                  onPress: () => {
                    setCurrentIcon(appIconName);
                    setIconName(appIconName);
                  },
                  leading: (
                    <Image
                      borderRadius={10}
                      source={icon.icons[defaultColorData.colorEnum]}
                      style={{ width: 32, height: 32 }}
                      resizeMode="cover"
                    />
                  ),
                  trailing: currentIcon === appIconName ? <Papicons name="Check" /> : undefined,
                };
              }),
            },
          ]}
        />
      </ScrollView>
    </>
  );
};

export default PersonalizationSettings;