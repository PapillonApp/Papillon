import Typography from "@/ui/components/Typography";
import { FlatList, View } from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useSettingsStore } from "@/stores/settings";
import { Colors, AppColors } from "@/utils/colors";
import adjust from "@/utils/adjustColor";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";

export { Colors, AppColors };

const ColorSelector = React.memo(function ColorSelector({ mainColor, backgroundColor, name, onPress, selected }: { mainColor: string, backgroundColor: string, name: string, onPress?: () => void, selected: boolean }) {
  const handlePress = React.useCallback(() => {
    if (onPress) {
      onPress()
    }
  }, [onPress]);

  const theme = useTheme();
  const { colors } = theme;

  const containerStyle = React.useMemo(() => ({
    flex: 1,
    margin: 4,
    marginVertical: selected ? 0 : 4,
    alignItems: "center" as const,
    backgroundColor: backgroundColor,
    borderColor: selected ? mainColor : colors.text + "26",
    borderWidth: selected ? 4 : 2,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: selected ? 20 : 26,
    alignSelf: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5
  }), [selected, backgroundColor, mainColor]);

  const circleStyle = React.useMemo(() => ({
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
  }), [mainColor]);

  return (
    <AnimatedPressable onPress={handlePress} style={containerStyle}>
      <View style={circleStyle} />
      <Typography variant="h6" color={mainColor}>{name}</Typography>
    </AnimatedPressable>
  )
}); const AppColorsSelector = React.memo(function AppColorsSelector(
  { onChangeColor, accountId }: { onChangeColor?: (color: string) => void, accountId?: string }
) {
  const settingsStore = useSettingsStore(state => state.personalization);

  const defaultColorData = useMemo(() =>
    AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0],
    [settingsStore.colorSelected]
  );

  const [selectedColor, setSelectedColor] = useState<string>(defaultColorData.mainColor);
  const [color, setColor] = useState<Colors>(settingsStore.colorSelected || Colors.PINK);

  const theme = useTheme();

  useEffect(() => {
    const colorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
    setSelectedColor(colorData.mainColor);
    setColor(colorData.colorEnum);
  }, [settingsStore.colorSelected]);

  const renderItem = useCallback(({ item }: { item: typeof AppColors[0] }) => {
    const handlePress = () => {
      setSelectedColor(item.mainColor);
      setColor(item.colorEnum);
      if (onChangeColor) {
        onChangeColor(item.mainColor);
      }
    };

    return (
      <ColorSelector
        selected={selectedColor === item.mainColor}
        mainColor={item.mainColor}
        backgroundColor={adjust(item.mainColor, theme.dark ? -0.8 : 0.8)}
        name={item.name}
        onPress={handlePress}
      />
    );
  }, [selectedColor, onChangeColor]);

  const keyExtractor = useCallback((item: typeof AppColors[0]) => item.name, []);

  const ListFooter = useMemo(() => (
    <Typography style={{ paddingTop: 10, flex: 1 }} color="#7F7F7F" variant="caption">
      {t("Settings_Personalization_Accent_Description")}
    </Typography>
  ), []);

  return (
    <FlatList
      scrollEnabled={false}
      data={AppColors}
      numColumns={3}
      renderItem={renderItem}
      ListFooterComponent={ListFooter}
      ListFooterComponentStyle={{ flex: 1 }}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ justifyContent: "space-between" }}
      style={{ maxHeight: 270 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={6}
      windowSize={1}
    />
  )
});

export default AppColorsSelector;