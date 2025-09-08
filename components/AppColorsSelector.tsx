import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";

import Typography from "@/ui/components/Typography";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useSettingsStore } from "@/stores/settings";
import { Colors, AppColors } from "@/utils/colors";
import adjust from "@/utils/adjustColor";
import { ImpactFeedbackStyle } from "expo-haptics";

export { Colors, AppColors };

interface ColorSelectorProps {
  mainColor: string;
  backgroundColor: string;
  name: string;
  onPress?: () => void;
  selected: boolean;
  itemWidth: number;
}

interface AppColorsSelectorProps {
  onChangeColor?: (color: string) => void;
}

const ColorSelector = React.memo<ColorSelectorProps>(function ColorSelector({
  mainColor,
  backgroundColor,
  name,
  onPress,
  selected,
  itemWidth
}) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const containerStyle = useMemo(() => ({
    width: itemWidth,
    height: itemWidth * 0.95,
    margin: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor,
    borderColor: selected ? mainColor : mainColor + "50",
    borderWidth: selected ? 4 : 2,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  }), [selected, backgroundColor, mainColor, theme.colors.text, itemWidth]);

  const circleStyle = useMemo(() => {
    const circleSize = Math.min(itemWidth * 0.4, 50);
    return {
      width: circleSize,
      height: circleSize,
      backgroundColor: mainColor,
      borderRadius: circleSize / 2,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 3.615,
      marginBottom: 6,
    };
  }, [mainColor, itemWidth]);

  return (
    <AnimatedPressable onPress={handlePress} style={containerStyle} hapticFeedback={ImpactFeedbackStyle.Light}>
      <View style={circleStyle} />
      <Typography variant="h6" color={mainColor}>
        {name}
      </Typography>
    </AnimatedPressable>
  );
});

const AppColorsSelector = React.memo<AppColorsSelectorProps>(function AppColorsSelector({
  onChangeColor
}) {
  const settingsStore = useSettingsStore(state => state.personalization);
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const defaultColorData = useMemo(
    () => AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0],
    [settingsStore.colorSelected]
  );

  const [selectedColor, setSelectedColor] = useState<string>(defaultColorData.mainColor);
  const [color, setColor] = useState<Colors>(settingsStore.colorSelected || Colors.PINK);

  const itemWidth = useMemo(() => {
    if (containerWidth === 0) return 100;
    return (containerWidth - 36) / 3;
  }, [containerWidth]);

  useEffect(() => {
    const colorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
    setSelectedColor(colorData.mainColor);
    setColor(colorData.colorEnum);
  }, [settingsStore.colorSelected]);

  const handleColorPress = useCallback((item: typeof AppColors[0]) => {
    setSelectedColor(item.mainColor);
    setColor(item.colorEnum);
    onChangeColor?.(item.mainColor);
  }, [onChangeColor]);

  const renderItem = useCallback(({ item }: { item: typeof AppColors[0] }) => (
    <ColorSelector
      selected={selectedColor === item.mainColor}
      mainColor={item.mainColor}
      backgroundColor={adjust(item.mainColor, theme.dark ? -0.8 : 0.8)}
      name={t(item.nameKey)}
      onPress={() => handleColorPress(item)}
      itemWidth={itemWidth}
    />
  ), [selectedColor, theme.dark, handleColorPress, itemWidth]);

  return (
    <FlatList
      scrollEnabled={false}
      data={AppColors}
      numColumns={3}
      renderItem={renderItem}
      keyExtractor={(item) => item.colorEnum.toString()}
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
      columnWrapperStyle={{
        justifyContent: "space-between",
        alignItems: "center",
      }}
      style={{
        width: "100%",
        overflow: "hidden"
      }}
      removeClippedSubviews
      maxToRenderPerBatch={6}
      windowSize={1}
    />
  );
});

export default AppColorsSelector;
