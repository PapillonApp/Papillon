import Typography from "@/ui/components/Typography";
import { FlatList, View } from "react-native";
import React, { useState, useEffect } from "react";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useSettingsStore } from "@/stores/settings";
import { Colors, AppColors } from "@/utils/colors";

export { Colors, AppColors };

function ColorSelector({ mainColor, backgroundColor, name, onPress, selected }: { mainColor: string, backgroundColor: string, name: string, onPress?: () => void, selected: boolean }) {
  return (
    <AnimatedPressable
      onPress={() => {
        if (onPress) {
          onPress()
        }
      }}
      style={{
        flex: 1,
        margin: 4,
        marginVertical: selected ? 0 : 4,
        alignItems: "center",
        backgroundColor: backgroundColor,
        borderColor: selected ? mainColor : "#00000026",
        borderWidth: selected ? 4 : 2,
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: selected ? 20 : 26,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.07,
        shadowRadius: 5
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        backgroundColor: mainColor,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.615
      }} />
      <Typography variant="h6" color={mainColor}>{name}</Typography>
    </AnimatedPressable>
  )
}

const AppColorsSelector = (
  { onChangeColor, accountId }: { onChangeColor?: (color: string) => void, accountId?: string }
) => {
  const settingsStore = useSettingsStore(state => state.personalization);
  const defaultColorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
  const [selectedColor, setSelectedColor] = useState<string>(defaultColorData.mainColor);
  const [color, setColor] = useState<Colors>(settingsStore.colorSelected || Colors.PINK);

  useEffect(() => {
    const colorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
    setSelectedColor(colorData.mainColor);
    setColor(colorData.colorEnum);
  }, [settingsStore.colorSelected]);

  return (
    <FlatList
      scrollEnabled={false}
      data={AppColors}
      numColumns={3}
      renderItem={({ item }) => (
        <ColorSelector
          selected={selectedColor === item.mainColor}
          mainColor={item.mainColor}
          backgroundColor={item.backgroundColor}
          name={item.name}
          onPress={() => {
            setSelectedColor(item.mainColor)
            setColor(item.colorEnum)
            if (onChangeColor) {
              onChangeColor(item.mainColor)
            }
          }}
        />
      )}
      ListFooterComponent={<Typography style={{ paddingTop: 10, flex: 1 }} color="#7F7F7F" variant="caption">La couleur que tu choisis ici s’appliquera sur la page d’accueil de Papillon.</Typography>}
      ListFooterComponentStyle={{ flex: 1 }}
      keyExtractor={item => item.name}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ justifyContent: "space-between" }}
      style={{ maxHeight: 270 }}
    />
  )
};

export default AppColorsSelector;